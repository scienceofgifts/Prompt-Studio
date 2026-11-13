import { getEnabledModelIds, setLastRecognitionModel } from '../utils/aiModelManager';
import { computeContentFingerprint } from '../utils/imageAnalyzer';
import { DesignAnalysisResult, MerchandiseProductProfile } from './types';

export const D2P_ANALYSIS_CACHE_KEY = 'scienceOfGifts_d2p_analysis_cache_v1';
const MAX_STORED_ANALYSES = 40;

export interface SavedDesignAnalysisEntry {
  fingerprint: string;
  fileName: string;
  width?: number;
  height?: number;
  modelUsed: string;
  analyzedAt: number;
  analysis: DesignAnalysisResult;
  tinyThumbDataUrl?: string;
}

export interface AnalyzeDesignSuccess {
  ok: true;
  fingerprint: string;
  analysis: DesignAnalysisResult;
  modelUsed: string;
  attemptedModels: string[];
  fromCache: boolean;
}

export interface AnalyzeDesignFailure {
  ok: false;
  reason: 'unavailable' | 'failed' | 'aborted';
  message: string;
  errorCode?: string;
}

export type AnalyzeDesignOutcome = AnalyzeDesignSuccess | AnalyzeDesignFailure;

interface PreparedDesignPayload {
  base64: string;
  mimeType: string;
  fingerprint: string;
  tinyThumbDataUrl?: string;
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readStoredAnalysesMap(): Record<string, SavedDesignAnalysisEntry> {
  if (!hasLocalStorage()) return {};
  try {
    const raw = window.localStorage.getItem(D2P_ANALYSIS_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, SavedDesignAnalysisEntry>) : {};
  } catch {
    return {};
  }
}

function writeStoredAnalysesMap(entries: Record<string, SavedDesignAnalysisEntry>): void {
  if (!hasLocalStorage()) return;
  try {
    const sorted = Object.values(entries)
      .sort((a, b) => b.analyzedAt - a.analyzedAt)
      .slice(0, MAX_STORED_ANALYSES);
    const compacted: Record<string, SavedDesignAnalysisEntry> = {};
    for (const item of sorted) {
      compacted[item.fingerprint] = item;
    }
    window.localStorage.setItem(D2P_ANALYSIS_CACHE_KEY, JSON.stringify(compacted));
  } catch {
    // If localStorage is tight, retry saving without thumbnails
    try {
      const stripped: Record<string, SavedDesignAnalysisEntry> = {};
      const sorted = Object.values(entries)
        .sort((a, b) => b.analyzedAt - a.analyzedAt)
        .slice(0, MAX_STORED_ANALYSES);
      for (const item of sorted) {
        stripped[item.fingerprint] = { ...item, tinyThumbDataUrl: undefined };
      }
      window.localStorage.setItem(D2P_ANALYSIS_CACHE_KEY, JSON.stringify(stripped));
    } catch {
      // Ignore storage quota failures gracefully
    }
  }
}

export function getSavedDesignHistory(): SavedDesignAnalysisEntry[] {
  const map = readStoredAnalysesMap();
  return Object.values(map).sort((a, b) => b.analyzedAt - a.analyzedAt);
}

export function clearSavedDesignHistory(): void {
  memoryAnalysisCache.clear();
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(D2P_ANALYSIS_CACHE_KEY);
    } catch {
      // Ignore
    }
  }
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    // Sample perimeter & sparse interior points cleanly without full buffer scan cost
    const points: Array<[number, number]> = [
      [0, 0],
      [Math.max(0, w - 1), 0],
      [0, Math.max(0, h - 1)],
      [Math.max(0, w - 1), Math.max(0, h - 1)],
      [Math.floor(w / 2), 0],
      [0, Math.floor(h / 2)],
      [Math.floor(w / 2), Math.max(0, h - 1)],
    ];
    for (const [x, y] of points) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (pixel[3] < 245) return true;
    }
  } catch {
    // Ignore CORS / tainted canvas errors
  }
  return false;
}

/**
 * Prepares an uploaded design image for analysis, preserving alpha transparency in PNGs
 * and creating an optional compact thumbnail without bloating browser storage.
 */
async function prepareDesignImageForAnalysis(dataUrl: string): Promise<PreparedDesignPayload> {
  const MAX_DIMENSION = 1024;
  const THUMB_MAX = 140;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth || 800;
        const naturalH = img.naturalHeight || 800;
        const scale = Math.min(1, MAX_DIMENSION / Math.max(naturalW, naturalH));
        const targetW = Math.max(1, Math.round(naturalW * scale));
        const targetH = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const isTransparent = canvasHasTransparency(ctx, targetW, targetH);
        let mimeType = 'image/png';
        let encodedDataUrl: string;

        if (isTransparent) {
          encodedDataUrl = canvas.toDataURL('image/png');
        } else {
          // Composite onto crisp white background for non-transparent JPEG encoding
          const opaqueCanvas = document.createElement('canvas');
          opaqueCanvas.width = targetW;
          opaqueCanvas.height = targetH;
          const oCtx = opaqueCanvas.getContext('2d');
          if (oCtx) {
            oCtx.fillStyle = '#ffffff';
            oCtx.fillRect(0, 0, targetW, targetH);
            oCtx.drawImage(canvas, 0, 0);
            encodedDataUrl = opaqueCanvas.toDataURL('image/jpeg', 0.88);
            mimeType = 'image/jpeg';
          } else {
            encodedDataUrl = canvas.toDataURL('image/png');
          }
        }

        const base64 = encodedDataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

        // Tiny optional thumbnail (~3–8 KB) for revisiting previously analyzed designs
        let tinyThumbDataUrl: string | undefined;
        try {
          const thumbScale = Math.min(1, THUMB_MAX / Math.max(naturalW, naturalH));
          const thumbW = Math.max(1, Math.round(naturalW * thumbScale));
          const thumbH = Math.max(1, Math.round(naturalH * thumbScale));
          const thumbCanvas = document.createElement('canvas');
          thumbCanvas.width = thumbW;
          thumbCanvas.height = thumbH;
          const tCtx = thumbCanvas.getContext('2d');
          if (tCtx) {
            if (!isTransparent) {
              tCtx.fillStyle = '#ffffff';
              tCtx.fillRect(0, 0, thumbW, thumbH);
            }
            tCtx.drawImage(img, 0, 0, thumbW, thumbH);
            tinyThumbDataUrl = thumbCanvas.toDataURL(
              isTransparent ? 'image/png' : 'image/jpeg',
              0.68
            );
            if (tinyThumbDataUrl.length > 32_000) {
              tinyThumbDataUrl = undefined;
            }
          }
        } catch {
          tinyThumbDataUrl = undefined;
        }

        resolve({
          base64,
          mimeType,
          fingerprint: computeContentFingerprint(base64),
          tinyThumbDataUrl,
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Could not decode artwork image for analysis'));
    img.src = dataUrl;
  });
}

const memoryAnalysisCache = new Map<string, AnalyzeDesignSuccess>();
const inFlightDesignRequests = new Map<string, Promise<AnalyzeDesignOutcome>>();

export interface AnalyzeDesignRunnerDeps {
  prepareImage: (dataUrl: string) => Promise<PreparedDesignPayload>;
  sendRequest: (
    payload: {
      imageBase64: string;
      mimeType: string;
      fileName?: string;
      preferredModels: string[];
      catalog: Array<{ id: string; name: string; category: string }>;
    },
    signal?: AbortSignal
  ) => Promise<{ status: number; data: Record<string, unknown> | null }>;
  getModels: () => string[];
  persistResult?: (entry: SavedDesignAnalysisEntry) => void;
  lookupPersisted?: (fingerprint: string) => SavedDesignAnalysisEntry | undefined;
  onModelSuccess?: (record: {
    modelId: string;
    attemptedModels: string[];
    fromCache?: boolean;
  }) => void;
}

export function createDesignAnalysisRunner(deps: AnalyzeDesignRunnerDeps) {
  const localCache = new Map<string, AnalyzeDesignSuccess>();
  const localInFlight = new Map<string, Promise<AnalyzeDesignOutcome>>();

  async function run(params: {
    dataUrl: string;
    fileName?: string;
    width?: number;
    height?: number;
    catalog: MerchandiseProductProfile[];
    signal?: AbortSignal;
    forceRefresh?: boolean;
  }): Promise<AnalyzeDesignOutcome> {
    const { dataUrl, fileName, width, height, catalog, signal, forceRefresh } = params;

    if (signal?.aborted) {
      return { ok: false, reason: 'aborted', message: 'Design analysis cancelled.' };
    }

    const sourceFp = computeContentFingerprint(dataUrl);

    if (!forceRefresh) {
      const memHit = localCache.get(sourceFp) || memoryAnalysisCache.get(sourceFp);
      if (memHit) {
        return { ...memHit, fromCache: true };
      }
      const storedHit = deps.lookupPersisted?.(sourceFp);
      if (storedHit) {
        const restored: AnalyzeDesignSuccess = {
          ok: true,
          fingerprint: storedHit.fingerprint,
          analysis: storedHit.analysis,
          modelUsed: storedHit.modelUsed,
          attemptedModels: [storedHit.modelUsed],
          fromCache: true,
        };
        localCache.set(sourceFp, restored);
        return restored;
      }
    }

    const existingFlight = localInFlight.get(sourceFp);
    if (existingFlight) {
      return existingFlight;
    }

    const preferredModels = deps.getModels();
    if (preferredModels.length === 0) {
      return {
        ok: false,
        reason: 'failed',
        errorCode: 'NO_MODELS_ENABLED',
        message:
          'All AI models are disabled in Studio Settings → AI Models. Enable at least one model to analyze designs.',
      };
    }

    const flightPromise = (async (): Promise<AnalyzeDesignOutcome> => {
      try {
        const prepared = await deps.prepareImage(dataUrl);
        if (signal?.aborted) {
          return { ok: false, reason: 'aborted', message: 'Design analysis cancelled.' };
        }

        if (!forceRefresh) {
          const normHit =
            localCache.get(prepared.fingerprint) ||
            memoryAnalysisCache.get(prepared.fingerprint);
          if (normHit) {
            localCache.set(sourceFp, normHit);
            return { ...normHit, fromCache: true };
          }
          const persistedNorm = deps.lookupPersisted?.(prepared.fingerprint);
          if (persistedNorm) {
            const restored: AnalyzeDesignSuccess = {
              ok: true,
              fingerprint: persistedNorm.fingerprint,
              analysis: persistedNorm.analysis,
              modelUsed: persistedNorm.modelUsed,
              attemptedModels: [persistedNorm.modelUsed],
              fromCache: true,
            };
            localCache.set(sourceFp, restored);
            localCache.set(prepared.fingerprint, restored);
            return restored;
          }
        }

        const { status, data } = await deps.sendRequest(
          {
            imageBase64: prepared.base64,
            mimeType: prepared.mimeType,
            fileName,
            preferredModels,
            catalog: catalog.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
            })),
          },
          signal
        );

        if (signal?.aborted) {
          return { ok: false, reason: 'aborted', message: 'Design analysis cancelled.' };
        }

        const available = data?.available;
        const errorCode = typeof data?.errorCode === 'string' ? data.errorCode : undefined;
        const errorMsg = typeof data?.error === 'string' ? data.error : undefined;

        if (status === 503 || available === false) {
          return {
            ok: false,
            reason: 'unavailable',
            errorCode,
            message:
              errorMsg ||
              'Automatic design analysis is unavailable right now. You can still select a product manually below.',
          };
        }

        if (status < 200 || status >= 300 || !data?.analysis) {
          return {
            ok: false,
            reason: 'failed',
            errorCode,
            message:
              errorMsg ||
              'Unable to analyze this design automatically. Retry or select a product manually.',
          };
        }

        const modelUsed =
          typeof data.modelUsed === 'string' && data.modelUsed.trim()
            ? data.modelUsed.trim()
            : preferredModels[0];

        const attemptedModels = Array.isArray(data.attemptedModels)
          ? data.attemptedModels.filter((m): m is string => typeof m === 'string')
          : [modelUsed];

        const success: AnalyzeDesignSuccess = {
          ok: true,
          fingerprint: prepared.fingerprint,
          analysis: data.analysis as DesignAnalysisResult,
          modelUsed,
          attemptedModels,
          fromCache: false,
        };

        localCache.set(sourceFp, success);
        localCache.set(prepared.fingerprint, success);
        memoryAnalysisCache.set(sourceFp, success);
        memoryAnalysisCache.set(prepared.fingerprint, success);

        deps.persistResult?.({
          fingerprint: prepared.fingerprint,
          fileName: fileName || 'Uploaded Design',
          width,
          height,
          modelUsed,
          analyzedAt: Date.now(),
          analysis: success.analysis,
          tinyThumbDataUrl: prepared.tinyThumbDataUrl,
        });

        deps.onModelSuccess?.({
          modelId: modelUsed,
          attemptedModels,
          fromCache: false,
        });

        return success;
      } catch (err: unknown) {
        if (
          signal?.aborted ||
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return { ok: false, reason: 'aborted', message: 'Design analysis cancelled.' };
        }
        return {
          ok: false,
          reason: 'failed',
          message: 'Design analysis encountered a network or server error. Please retry.',
        };
      } finally {
        localInFlight.delete(sourceFp);
      }
    })();

    localInFlight.set(sourceFp, flightPromise);
    return flightPromise;
  }

  return {
    run,
    clearCache: () => {
      localCache.clear();
      localInFlight.clear();
    },
  };
}

const defaultDesignRunner = createDesignAnalysisRunner({
  prepareImage: prepareDesignImageForAnalysis,
  sendRequest: async (payload, signal) => {
    const res = await fetch('/api/analyze-design', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: res.status, data };
  },
  getModels: () => getEnabledModelIds(),
  lookupPersisted: (fp) => readStoredAnalysesMap()[fp],
  persistResult: (entry) => {
    const map = readStoredAnalysesMap();
    map[entry.fingerprint] = entry;
    writeStoredAnalysesMap(map);
  },
  onModelSuccess: (record) => {
    setLastRecognitionModel({
      modelId: record.modelId,
      timestamp: Date.now(),
      attemptedModels: record.attemptedModels,
      fromCache: record.fromCache,
    });
  },
});

export async function analyzeDesignArtwork(params: {
  dataUrl: string;
  fileName?: string;
  width?: number;
  height?: number;
  catalog: MerchandiseProductProfile[];
  signal?: AbortSignal;
  forceRefresh?: boolean;
}): Promise<AnalyzeDesignOutcome> {
  return defaultDesignRunner.run(params);
}

/**
 * Controlled concurrency queue runner for batch design processing.
 * Evaluates items cleanly with bounded concurrency without restarting successful items on partial failures.
 */
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  let cursor = 0;

  async function nextWorker(): Promise<void> {
    while (cursor < items.length) {
      const idx = cursor++;
      await worker(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => nextWorker()));
}
