import { useState, useEffect, useRef, useCallback } from 'react';
import { computeContentFingerprint } from '../utils/imageAnalyzer';
import {
  D2P_PROFILES_UPDATED_EVENT,
  getMerchandiseProfiles,
} from './profileManager';
import {
  analyzeDesignArtwork,
  clearSavedDesignHistory,
  getSavedDesignHistory,
  runWithConcurrency,
  SavedDesignAnalysisEntry,
} from './designAnalyzer';
import {
  recommendProductsForDesign,
  selectBatchRecommendedProductId,
} from './recommendationEngine';
import {
  DesignAdaptationOptions,
  DesignWorkspaceItem,
  MerchandiseProductProfile,
} from './types';

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDesignAsset(file: File): Promise<{
  dataUrl: string;
  width?: number;
  height?: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Could not read file'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth || undefined,
          height: img.naturalHeight || undefined,
        });
      };
      img.onerror = () => resolve({ dataUrl });
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function useDesignToProductWorkspace() {
  const [catalog, setCatalog] = useState<MerchandiseProductProfile[]>(() =>
    getMerchandiseProfiles()
  );
  const catalogRef = useRef<MerchandiseProductProfile[]>(catalog);
  catalogRef.current = catalog;

  const [items, setItems] = useState<DesignWorkspaceItem[]>([]);
  const itemsRef = useRef<DesignWorkspaceItem[]>(items);
  itemsRef.current = items;

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [manualPrompts, setManualPrompts] = useState<Record<string, string>>({});
  const [savedHistory, setSavedHistory] = useState<SavedDesignAnalysisEntry[]>(() =>
    getSavedDesignHistory()
  );

  const abortControllersRef = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    const handleProfilesUpdate = () => {
      const nextCatalog = getMerchandiseProfiles();
      setCatalog(nextCatalog);
      catalogRef.current = nextCatalog;
      setItems((prev) =>
        prev.map((item) => {
          if (!item.analysis) return item;
          const recs = recommendProductsForDesign(item.analysis, nextCatalog);
          const stillExists = nextCatalog.some(
            (p) => p.id === item.options.selectedProductId
          );
          return {
            ...item,
            recommendations: recs,
            options: stillExists
              ? item.options
              : { ...item.options, selectedProductId: recs.primary.productId },
          };
        })
      );
    };
    window.addEventListener(D2P_PROFILES_UPDATED_EVENT, handleProfilesUpdate);
    return () => {
      window.removeEventListener(D2P_PROFILES_UPDATED_EVENT, handleProfilesUpdate);
    };
  }, []);

  const analyzeSingleWorkspaceItem = useCallback(
    async (
      targetId: string,
      dataUrl: string,
      fileName: string,
      width: number | undefined,
      height: number | undefined,
      forceRefresh = false
    ) => {
      if (abortControllersRef.current[targetId]) {
        abortControllersRef.current[targetId].abort();
      }
      const controller = new AbortController();
      abortControllersRef.current[targetId] = controller;

      setItems((prev) =>
        prev.map((it) =>
          it.id === targetId
            ? { ...it, status: 'analyzing', errorMessage: undefined }
            : it
        )
      );

      const currentCatalog = catalogRef.current;
      const outcome = await analyzeDesignArtwork({
        dataUrl,
        fileName,
        width,
        height,
        catalog: currentCatalog,
        signal: controller.signal,
        forceRefresh,
      });

      delete abortControllersRef.current[targetId];

      if (!outcome.ok && outcome.reason === 'aborted') {
        return;
      }

      if (outcome.ok) {
        const recs = recommendProductsForDesign(outcome.analysis, catalogRef.current);

        setItems((prev) => {
          const categoryCounts: Record<string, number> = {};
          for (const existing of prev) {
            if (existing.id !== targetId && existing.status === 'ready') {
              const prof = catalogRef.current.find(
                (p) => p.id === existing.options.selectedProductId
              );
              if (prof) {
                categoryCounts[prof.category] =
                  (categoryCounts[prof.category] || 0) + 1;
              }
            }
          }

          const recommendedId =
            prev.length > 1
              ? selectBatchRecommendedProductId(recs, categoryCounts)
              : recs.primary.productId;

          return prev.map((it) => {
            if (it.id !== targetId) return it;
            return {
              ...it,
              fingerprint: outcome.fingerprint,
              status: 'ready',
              errorMessage: undefined,
              modelUsed: outcome.modelUsed,
              fromCache: outcome.fromCache,
              analysis: outcome.analysis,
              recommendations: recs,
              options: {
                ...it.options,
                selectedProductId: recommendedId,
                productColor:
                  it.options.productColor ||
                  outcome.analysis.recommendedDefaultProductColor ||
                  '',
              },
            };
          });
        });

        setSavedHistory(getSavedDesignHistory());
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === targetId
              ? {
                  ...it,
                  status: 'failed',
                  errorMessage: outcome.message,
                }
              : it
          )
        );
      }
    },
    []
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter((f) => f.type.startsWith('image/'));
      if (validFiles.length === 0) return;

      const loaded = await Promise.all(
        validFiles.map(async (file, index) => {
          const asset = await readFileAsDesignAsset(file);
          const id = `d2p-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
          const defaultProdId = catalogRef.current[0]?.id || 'tshirt';
          const newItem: DesignWorkspaceItem = {
            id,
            fingerprint: computeContentFingerprint(asset.dataUrl),
            fileName: file.name || `Design ${index + 1}`,
            fileSize: formatBytes(file.size),
            width: asset.width,
            height: asset.height,
            previewDataUrl: asset.dataUrl,
            status: 'queued',
            analysis: null,
            recommendations: null,
            options: {
              selectedProductId: defaultProdId,
              backgroundTreatment: 'ai-decides',
              colorTreatment: 'ai-decides',
              productColor: '',
              customNotes: '',
            },
            createdAt: Date.now(),
          };
          return { newItem, dataUrl: asset.dataUrl };
        })
      );

      setItems((prev) => [...prev, ...loaded.map((l) => l.newItem)]);
      setActiveItemId((curr) => curr || loaded[0]?.newItem.id || null);

      await runWithConcurrency(loaded, 2, async ({ newItem, dataUrl }) => {
        await analyzeSingleWorkspaceItem(
          newItem.id,
          dataUrl,
          newItem.fileName,
          newItem.width,
          newItem.height,
          false
        );
      });
    },
    [analyzeSingleWorkspaceItem]
  );

  const restoreHistoryEntry = useCallback((entry: SavedDesignAnalysisEntry) => {
    const existing = itemsRef.current.find(
      (i) => i.fingerprint === entry.fingerprint
    );
    if (existing) {
      setActiveItemId(existing.id);
      return;
    }

    const recs = recommendProductsForDesign(entry.analysis, catalogRef.current);
    const id = `d2p-restored-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const restoredItem: DesignWorkspaceItem = {
      id,
      fingerprint: entry.fingerprint,
      fileName: entry.fileName,
      fileSize: 'Saved analysis',
      width: entry.width,
      height: entry.height,
      previewDataUrl: entry.tinyThumbDataUrl,
      status: 'ready',
      modelUsed: entry.modelUsed,
      fromCache: true,
      analysis: entry.analysis,
      recommendations: recs,
      options: {
        selectedProductId: recs.primary.productId,
        backgroundTreatment: 'ai-decides',
        colorTreatment: 'ai-decides',
        productColor: entry.analysis.recommendedDefaultProductColor || '',
        customNotes: '',
      },
      createdAt: entry.analyzedAt,
    };

    setItems((prev) => [restoredItem, ...prev]);
    setActiveItemId(id);
  }, []);

  const updateItemOptions = useCallback(
    (id: string, patch: Partial<DesignAdaptationOptions>) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, options: { ...it.options, ...patch } } : it
        )
      );
      // Clear manual prompt text override when user switches product or options so prompt updates immediately
      setManualPrompts((prev) => {
        if (prev[id] === undefined) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    []
  );

  const handleManualPromptChange = useCallback((id: string, prompt: string) => {
    setManualPrompts((prev) => ({ ...prev, [id]: prompt }));
  }, []);

  const resetManualPrompt = useCallback((id: string) => {
    setManualPrompts((prev) => {
      if (prev[id] === undefined) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const reanalyzeItem = useCallback(
    async (id: string) => {
      const target = itemsRef.current.find((it) => it.id === id);
      if (!target || !target.previewDataUrl) return;
      await analyzeSingleWorkspaceItem(
        target.id,
        target.previewDataUrl,
        target.fileName,
        target.width,
        target.height,
        true
      );
    },
    [analyzeSingleWorkspaceItem]
  );

  const retryFailed = useCallback(async () => {
    const failed = itemsRef.current.filter(
      (it) => it.status === 'failed' && Boolean(it.previewDataUrl)
    );
    if (failed.length === 0) return;

    await runWithConcurrency(failed, 2, async (target) => {
      if (!target.previewDataUrl) return;
      await analyzeSingleWorkspaceItem(
        target.id,
        target.previewDataUrl,
        target.fileName,
        target.width,
        target.height,
        false
      );
    });
  }, [analyzeSingleWorkspaceItem]);

  const removeItem = useCallback((id: string) => {
    if (abortControllersRef.current[id]) {
      abortControllersRef.current[id].abort();
      delete abortControllersRef.current[id];
    }
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      setActiveItemId((curr) =>
        curr === id ? next[0]?.id || null : curr
      );
      return next;
    });
    setManualPrompts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const clearAllItems = useCallback(() => {
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    abortControllersRef.current = {};
    setItems([]);
    setActiveItemId(null);
    setManualPrompts({});
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSavedDesignHistory();
    setSavedHistory([]);
  }, []);

  return {
    catalog,
    items,
    activeItemId,
    manualPrompts,
    savedHistory,
    setActiveItemId,
    addFiles,
    restoreHistoryEntry,
    handleClearHistory,
    updateItemOptions,
    handleManualPromptChange,
    resetManualPrompt,
    reanalyzeItem,
    retryFailed,
    removeItem,
    clearAllItems,
  };
}
