import { ProductRecognitionResult } from '../prompts/shared/smartSetup';
import { getEnabledModelIds, setLastRecognitionModel } from './aiModelManager';

export interface AnalyzeProductResponse {
  ok: true;
  recognition: ProductRecognitionResult;
  modelUsed: string;
  attemptedModels: string[];
  fromCache?: boolean;
}

export interface AnalyzeProductFailure {
  ok: false;
  reason: 'unavailable' | 'failed' | 'aborted';
  message: string;
  errorCode?: string;
}

export type AnalyzeProductOutcome = AnalyzeProductResponse | AnalyzeProductFailure;

export interface PreparedImagePayload {
  base64: string;
  mimeType: string;
  fingerprint: string;
}

export interface AnalyzeProductOptions {
  signal?: AbortSignal;
  skipCache?: boolean;
  preferredModels?: string[];
}

/**
 * Deterministic fast hash for image content deduplication & caching.
 */
export function computeContentFingerprint(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}:${input.length}`;
}

/**
 * Normalizes any browser-renderable image data URL (including large photos or SVGs)
 * into a compact raster base64 payload suitable for server-side Gemini vision analysis.
 */
async function prepareImageForAnalysis(
  dataUrl: string
): Promise<PreparedImagePayload> {
  const MAX_DIMENSION = 1024;

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

        // Fill neutral light background in case source has transparency (PNG/SVG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const base64 = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, '');
        resolve({
          base64,
          mimeType: 'image/jpeg',
          fingerprint: computeContentFingerprint(base64),
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Could not decode image for analysis'));
    img.src = dataUrl;
  });
}

export interface RecognitionRunnerDeps {
  prepareImage: (dataUrl: string) => Promise<PreparedImagePayload>;
  sendRequest: (
    payload: {
      imageBase64: string;
      mimeType: string;
      fileName?: string;
      preferredModels: string[];
    },
    signal?: AbortSignal
  ) => Promise<{ status: number; data: Record<string, unknown> | null }>;
  getModels: () => string[];
  onModelSuccess?: (record: {
    modelId: string;
    attemptedModels: string[];
    fromCache?: boolean;
  }) => void;
}

export function createRecognitionRunner(deps: RecognitionRunnerDeps) {
  const resultCache = new Map<string, AnalyzeProductResponse>();
  const inFlightMap = new Map<string, Promise<AnalyzeProductOutcome>>();

  async function run(
    dataUrl: string,
    fileName?: string,
    options?: AnalyzeProductOptions
  ): Promise<AnalyzeProductOutcome> {
    if (options?.signal?.aborted) {
      return {
        ok: false,
        reason: 'aborted',
        message: 'Analysis cancelled.',
      };
    }

    const sourceFingerprint = computeContentFingerprint(dataUrl);

    if (!options?.skipCache) {
      const cachedBySource = resultCache.get(sourceFingerprint);
      if (cachedBySource) {
        deps.onModelSuccess?.({
          modelId: cachedBySource.modelUsed,
          attemptedModels: cachedBySource.attemptedModels,
          fromCache: true,
        });
        return {
          ...cachedBySource,
          fromCache: true,
        };
      }
    }

    const existingInFlight = inFlightMap.get(sourceFingerprint);
    if (existingInFlight) {
      const outcome = await existingInFlight;
      if (options?.signal?.aborted) {
        return {
          ok: false,
          reason: 'aborted',
          message: 'Analysis cancelled.',
        };
      }
      return outcome;
    }

    const preferredModels = options?.preferredModels ?? deps.getModels();
    if (preferredModels.length === 0) {
      return {
        ok: false,
        reason: 'failed',
        errorCode: 'NO_MODELS_ENABLED',
        message:
          'All AI recognition models are disabled in Settings. Enable at least one model or configure settings manually below.',
      };
    }

    const requestPromise = (async (): Promise<AnalyzeProductOutcome> => {
      try {
        const prepared = await deps.prepareImage(dataUrl);

        if (options?.signal?.aborted) {
          return {
            ok: false,
            reason: 'aborted',
            message: 'Analysis cancelled.',
          };
        }

        if (!options?.skipCache) {
          const cachedByNormalized = resultCache.get(prepared.fingerprint);
          if (cachedByNormalized) {
            resultCache.set(sourceFingerprint, cachedByNormalized);
            deps.onModelSuccess?.({
              modelId: cachedByNormalized.modelUsed,
              attemptedModels: cachedByNormalized.attemptedModels,
              fromCache: true,
            });
            return {
              ...cachedByNormalized,
              fromCache: true,
            };
          }
        }

        const { status, data } = await deps.sendRequest(
          {
            imageBase64: prepared.base64,
            mimeType: prepared.mimeType,
            fileName,
            preferredModels,
          },
          options?.signal
        );

        if (options?.signal?.aborted) {
          return {
            ok: false,
            reason: 'aborted',
            message: 'Analysis cancelled.',
          };
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
              'Automatic recognition is unavailable. Configure product settings manually below.',
          };
        }

        if (status < 200 || status >= 300 || !data?.recognition) {
          return {
            ok: false,
            reason: 'failed',
            errorCode,
            message:
              errorMsg ||
              'Could not identify the product automatically. Configure settings manually below.',
          };
        }

        const modelUsed =
          typeof data.modelUsed === 'string' && data.modelUsed.trim()
            ? data.modelUsed.trim()
            : preferredModels[0];

        const attemptedModels = Array.isArray(data.attemptedModels)
          ? data.attemptedModels.filter((m): m is string => typeof m === 'string')
          : [modelUsed];

        const successResult: AnalyzeProductResponse = {
          ok: true,
          recognition: data.recognition as ProductRecognitionResult,
          modelUsed,
          attemptedModels,
          fromCache: false,
        };

        resultCache.set(sourceFingerprint, successResult);
        resultCache.set(prepared.fingerprint, successResult);

        deps.onModelSuccess?.({
          modelId: modelUsed,
          attemptedModels,
          fromCache: false,
        });

        return successResult;
      } catch (err: unknown) {
        if (
          options?.signal?.aborted ||
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return {
            ok: false,
            reason: 'aborted',
            message: 'Analysis cancelled.',
          };
        }
        return {
          ok: false,
          reason: 'failed',
          message: 'Automatic recognition could not complete. Configure settings manually below.',
        };
      } finally {
        inFlightMap.delete(sourceFingerprint);
      }
    })();

    inFlightMap.set(sourceFingerprint, requestPromise);
    return requestPromise;
  }

  return {
    run,
    clearCache: () => {
      resultCache.clear();
      inFlightMap.clear();
    },
    getCacheSize: () => resultCache.size,
  };
}

const defaultRunner = createRecognitionRunner({
  prepareImage: prepareImageForAnalysis,
  sendRequest: async (payload, signal) => {
    const response = await fetch('/api/recognize-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    return { status: response.status, data };
  },
  getModels: () => getEnabledModelIds(),
  onModelSuccess: (record) => {
    setLastRecognitionModel({
      modelId: record.modelId,
      timestamp: Date.now(),
      attemptedModels: record.attemptedModels,
      fromCache: record.fromCache,
    });
  },
});

/**
 * Calls the server-side /api/analyze-product endpoint with image caching,
 * concurrent deduplication, and configured Gemini model fallback ordering.
 * Never handles API keys on the client.
 */
export async function analyzeProductImage(
  dataUrl: string,
  fileName?: string,
  options?: AnalyzeProductOptions
): Promise<AnalyzeProductOutcome> {
  return defaultRunner.run(dataUrl, fileName, options);
}

export function clearRecognitionCache(): void {
  defaultRunner.clearCache();
}
