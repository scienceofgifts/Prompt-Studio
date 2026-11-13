import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Layers,
  Download,
  ChevronDown,
  ChevronRight,
  History,
  Plus,
  Wand2,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  BackgroundTreatmentOption,
  ColorTreatmentOption,
  DesignAdaptationOptions,
  DesignAnalysisResult,
  DesignWorkspaceItem,
  MerchandiseCategory,
  MerchandiseProductProfile,
} from '../../designToProduct/types';
import { SavedDesignAnalysisEntry } from '../../designToProduct/designAnalyzer';
import { resolveBackgroundTreatment, resolveColorTreatment } from '../../designToProduct/adaptationRules';
import { buildDesignAdaptationPrompt } from '../../designToProduct/promptBuilder';

export interface DesignToProductStudioProps {
  catalog: MerchandiseProductProfile[];
  items: DesignWorkspaceItem[];
  activeItemId: string | null;
  manualPrompts: Record<string, string>;
  savedHistory: SavedDesignAnalysisEntry[];
  onSelectActiveItem: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onRestoreHistoryEntry: (entry: SavedDesignAnalysisEntry) => void;
  onClearHistory: () => void;
  onUpdateItemOptions: (id: string, patch: Partial<DesignAdaptationOptions>) => void;
  onManualPromptChange: (id: string, prompt: string) => void;
  onResetManualPrompt: (id: string) => void;
  onReanalyzeItem: (id: string) => void;
  onRetryFailed: () => void;
  onRemoveItem: (id: string) => void;
  onClearAllItems: () => void;
}

const CATEGORY_ORDER: MerchandiseCategory[] = [
  'apparel',
  'drinkware',
  'paper-wall-art',
  'desk-accessories',
  'other',
];

const CATEGORY_LABELS: Record<MerchandiseCategory, string> = {
  apparel: 'Apparel',
  drinkware: 'Drinkware',
  'paper-wall-art': 'Paper & Wall Art',
  'desk-accessories': 'Desk & Accessories',
  other: 'Other Merchandise',
};

export function buildFallbackAnalysisForManualOverride(fileName: string): DesignAnalysisResult {
  const cleanName = fileName.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_-]+/g, ' ').trim();
  return {
    conceptSummary: cleanName ? `Artwork "${cleanName}"` : 'Uploaded graphic artwork',
    themeOrTopic: cleanName || 'Graphic design',
    intendedAudience: 'Gift buyers',
    visualIdentity: 'Original uploaded graphic style',
    compositionType: 'illustration',
    aspectProfile: 'square',
    elementDistribution: 'Centered artwork composition',
    typographyStyle: 'Original lettering if present',
    textDensity: 'low',
    exactVisibleText: '',
    importantElements: ['Primary illustration and lettering from the attached image'],
    dominantColors: ['Original palette'],
    supportingColors: [],
    currentBackground: 'unknown',
    detailLevel: 'moderate',
    suitableForSmallPrint: true,
    expandableToWideOrFullBleed: false,
    readabilityNotes: 'Keep all lettering and crisp details clean and readable on target product.',
    worksWithoutModification: true,
    prefersTransparentBackground: true,
    contrastRiskNotes: 'Check legibility against dark or light product surfaces.',
    recommendedDefaultProductColor: 'Balanced Neutral',
    elementsToPreserve: ['All original artwork details and lettering'],
    suggestedProductFits: [],
  };
}

export function getResolvedPromptForItem(
  item: DesignWorkspaceItem,
  catalog: MerchandiseProductProfile[],
  manualPrompts: Record<string, string>
): string {
  if (manualPrompts[item.id] !== undefined) {
    return manualPrompts[item.id];
  }
  const profile =
    catalog.find((p) => p.id === item.options.selectedProductId) || catalog[0];
  if (!profile) return '';
  const analysis =
    item.analysis || buildFallbackAnalysisForManualOverride(item.fileName);
  return buildDesignAdaptationPrompt(analysis, profile, item.options);
}

export const DesignToProductStudio: React.FC<DesignToProductStudioProps> = ({
  catalog,
  items,
  activeItemId,
  manualPrompts,
  savedHistory,
  onSelectActiveItem,
  onAddFiles,
  onRestoreHistoryEntry,
  onClearHistory,
  onUpdateItemOptions,
  onManualPromptChange,
  onResetManualPrompt,
  onReanalyzeItem,
  onRetryFailed,
  onRemoveItem,
  onClearAllItems,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const activeItem =
    items.find((item) => item.id === activeItemId) || items[0] || null;

  // Clipboard paste handler while this view is mounted
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedItems = e.clipboardData?.items;
      if (!pastedItems) return;
      const files: File[] = [];
      for (let i = 0; i < pastedItems.length; i++) {
        if (pastedItems[i].type.startsWith('image/')) {
          const f = pastedItems[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        onAddFiles(files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onAddFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      onAddFiles(Array.from(fileList));
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length > 0) {
      onAddFiles(files);
    }
  };

  const handleCopyPrompt = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  const handleExportBatchTxt = () => {
    const sections = items.map((item, idx) => {
      const profile =
        catalog.find((p) => p.id === item.options.selectedProductId) || catalog[0];
      const prompt = getResolvedPromptForItem(item, catalog, manualPrompts);
      const reason =
        item.recommendations?.allRanked.find(
          (r) => r.productId === item.options.selectedProductId
        )?.reason || 'Manual selection';
      return [
        `====================================================================`,
        `DESIGN #${idx + 1}: ${item.fileName}`,
        `SELECTED PRODUCT: ${profile?.name || item.options.selectedProductId} (${CATEGORY_LABELS[profile?.category || 'other']})`,
        `WHY THIS PRODUCT: ${reason}`,
        `OPTIONS: Background=${item.options.backgroundTreatment} | Color=${item.options.colorTreatment}${item.options.productColor ? ` | Product Color=${item.options.productColor}` : ''}`,
        `====================================================================`,
        prompt,
      ].join('\n');
    });

    const blob = new Blob([sections.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-to-product-prompts-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportBatchJson = () => {
    const payload = items.map((item) => {
      const profile =
        catalog.find((p) => p.id === item.options.selectedProductId) || catalog[0];
      return {
        fileName: item.fileName,
        dimensions: item.width && item.height ? `${item.width}x${item.height}` : undefined,
        status: item.status,
        selectedProductId: item.options.selectedProductId,
        selectedProductName: profile?.name,
        category: profile?.category,
        options: item.options,
        analysis: item.analysis,
        recommendations: item.recommendations
          ? {
              primary: item.recommendations.primary,
              alternatives: item.recommendations.alternatives,
            }
          : null,
        adaptationPrompt: getResolvedPromptForItem(item, catalog, manualPrompts),
      };
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-to-product-batch-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Batch stats
  const totalCount = items.length;
  const readyCount = items.filter((i) => i.status === 'ready').length;
  const analyzingCount = items.filter(
    (i) => i.status === 'analyzing' || i.status === 'queued'
  ).length;
  const failedCount = items.filter((i) => i.status === 'failed').length;

  const categoryDistribution = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    count: items.filter((item) => {
      const prof = catalog.find((p) => p.id === item.options.selectedProductId);
      return prof?.category === cat;
    }).length,
  })).filter((entry) => entry.count > 0);

  // Active item derived data
  const activeProfile = activeItem
    ? catalog.find((p) => p.id === activeItem.options.selectedProductId) || catalog[0]
    : null;
  const activeAnalysis = activeItem
    ? activeItem.analysis || buildFallbackAnalysisForManualOverride(activeItem.fileName)
    : null;
  const activePrompt = activeItem
    ? getResolvedPromptForItem(activeItem, catalog, manualPrompts)
    : '';
  const isManualPromptEdited = activeItem ? manualPrompts[activeItem.id] !== undefined : false;

  const bgDecision =
    activeProfile && activeAnalysis && activeItem
      ? resolveBackgroundTreatment(
          activeAnalysis,
          activeProfile,
          activeItem.options.backgroundTreatment
        )
      : null;

  const colorDecision =
    activeProfile && activeAnalysis && activeItem
      ? resolveColorTreatment(
          activeAnalysis,
          activeProfile,
          activeItem.options.colorTreatment,
          activeItem.options.productColor
        )
      : null;

  const catalogByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    products: catalog.filter((p) => p.category === cat),
  })).filter((g) => g.products.length > 0);

  return (
    <div className="space-y-6">
      {/* Hidden inputs for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Empty State Dropzone OR Top Workspace Action Strip */}
      {items.length === 0 ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all cursor-pointer bg-white shadow-xs ${
              isDragging
                ? 'border-[#0f766e] bg-[#f0fdfa] scale-[1.005]'
                : 'border-[#cbd5e1] hover:border-[#0f766e]/60 hover:bg-[#f8fafc]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#f0fdfa] border border-[#a7f3d0] text-[#0f766e] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0f172a]">
              Upload 1 Design or a Batch of Artwork
            </h2>
            <p className="text-sm text-[#64748b] mt-1.5 max-w-xl mx-auto">
              Drop finished PNG, JPG, or WebP designs here, click to browse single or multiple files, or paste an image with <kbd className="px-1.5 py-0.5 text-[11px] bg-[#f1f5f9] border border-[#e2e8f0] rounded">Ctrl+V</kbd>.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#475569]">
              <span className="px-3 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0]">
                Automatic Concept & Text Analysis
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0]">
                1 Primary + 2 Alternative Product Picks
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0]">
                Instant Local Adaptation Prompts
              </span>
            </div>
          </div>

          {/* Previously Analyzed Designs (compact history restore) */}
          {savedHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory((s) => !s)}
                  className="flex items-center gap-2 text-xs font-bold text-[#334155] hover:text-[#0f766e] cursor-pointer"
                >
                  <History className="w-4 h-4 text-[#0f766e]" />
                  <span>Previously Analyzed Designs ({savedHistory.length})</span>
                  {showHistory ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[11px] text-[#94a3b8] hover:text-[#b91c1c] cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              {showHistory && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {savedHistory.slice(0, 12).map((entry) => (
                    <button
                      key={entry.fingerprint}
                      type="button"
                      onClick={() => onRestoreHistoryEntry(entry)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#e2e8f0] hover:border-[#0f766e] hover:bg-[#f0fdfa]/40 text-left transition-all cursor-pointer"
                    >
                      {entry.tinyThumbDataUrl ? (
                        <img
                          src={entry.tinyThumbDataUrl}
                          alt={entry.fileName}
                          className="w-10 h-10 rounded-lg object-contain bg-[#f8fafc] border border-[#e2e8f0] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] shrink-0">
                          <Wand2 className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#0f172a] truncate">
                          {entry.fileName}
                        </div>
                        <div className="text-[10px] text-[#64748b] truncate">
                          {entry.analysis.conceptSummary}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Compact Top Action & Batch Queue Bar */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0f766e]" />
                  {totalCount === 1
                    ? '1 Active Design'
                    : `Batch Workspace (${totalCount} designs)`}
                </span>

                {analyzingCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] text-[11px] font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing {readyCount}/{totalCount}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {readyCount}/{totalCount} Ready
                  </span>
                )}

                {failedCount > 0 && (
                  <button
                    type="button"
                    onClick={onRetryFailed}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] text-[11px] font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry {failedCount} Failed
                  </button>
                )}

                {/* Category distribution chips when >1 item */}
                {totalCount > 1 && categoryDistribution.length > 0 && (
                  <div className="hidden md:flex flex-wrap items-center gap-1.5 pl-2 border-l border-[#e2e8f0]">
                    {categoryDistribution.map((entry) => (
                      <span
                        key={entry.category}
                        className="px-2 py-0.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[10px] font-medium text-[#475569]"
                      >
                        {entry.count} {entry.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {totalCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportBatchTxt}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Export .txt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportBatchJson}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Export .json</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0f766e] bg-[#f0fdfa] hover:bg-[#ccfbf1] border border-[#a7f3d0] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Designs</span>
                </button>
                <button
                  type="button"
                  onClick={onClearAllItems}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#64748b] hover:text-[#b91c1c] hover:bg-[#fef2f2] border border-[#e2e8f0] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Batch Item Switcher / Compact Row List when > 1 */}
            {totalCount > 1 && (
              <div className="divide-y divide-[#f1f5f9] border border-[#e2e8f0] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  const itemPrompt = getResolvedPromptForItem(item, catalog, manualPrompts);
                  const itemRecReason = item.recommendations?.allRanked.find(
                    (r) => r.productId === item.options.selectedProductId
                  )?.reason;
                  const isRowCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectActiveItem(item.id)}
                      className={`p-2.5 sm:px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#f0fdfa]/70' : 'bg-white hover:bg-[#f8fafc]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.previewDataUrl ? (
                          <img
                            src={item.previewDataUrl}
                            alt={item.fileName}
                            className="w-10 h-10 rounded-lg object-contain bg-[#f8fafc] border border-[#e2e8f0] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] shrink-0">
                            <Wand2 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0f172a] truncate">
                              {item.fileName}
                            </span>
                            {item.status === 'analyzing' && (
                              <Loader2 className="w-3 h-3 text-[#0284c7] animate-spin shrink-0" />
                            )}
                            {item.status === 'queued' && (
                              <span className="text-[10px] text-[#64748b] shrink-0">Queued</span>
                            )}
                            {item.status === 'failed' && (
                              <span className="text-[10px] text-[#b91c1c] font-semibold shrink-0">
                                Failed (manual ready)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748b] truncate">
                            {itemRecReason ||
                              item.analysis?.conceptSummary ||
                              (item.status === 'analyzing'
                                ? 'Analyzing artwork...'
                                : 'Ready for product selection')}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label={`Product for ${item.fileName}`}
                          value={item.options.selectedProductId}
                          onChange={(e) =>
                            onUpdateItemOptions(item.id, {
                              selectedProductId: e.target.value,
                            })
                          }
                          className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#0f766e]"
                        >
                          {catalogByCategory.map((group) => (
                            <optgroup key={group.category} label={group.label}>
                              {group.products.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(item.id, itemPrompt)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isRowCopied
                              ? 'bg-[#16a34a] text-white'
                              : 'bg-[#0f172a] hover:bg-[#1e293b] text-white'
                          }`}
                        >
                          {isRowCopied ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{isRowCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail 2-Column Workspace for Active Design */}
          {activeItem && activeProfile && activeAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Design Preview, AI Concept Summary & Product Recommendations */}
              <div className="lg:col-span-6 space-y-6">
                {/* 1. Artwork Preview & Status Card */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#0f172a] truncate max-w-xs sm:max-w-sm">
                        {activeItem.fileName}
                      </h3>
                      <p className="text-[11px] text-[#64748b]">
                        {activeItem.width && activeItem.height
                          ? `${activeItem.width} × ${activeItem.height}px`
                          : 'Saved analysis'}
                        {activeItem.fileSize ? ` • ${activeItem.fileSize}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeItem.previewDataUrl && activeItem.fileSize !== 'Saved analysis' && (
                        <button
                          type="button"
                          onClick={() => onReanalyzeItem(activeItem.id)}
                          disabled={activeItem.status === 'analyzing'}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] disabled:opacity-50 cursor-pointer"
                          title="Re-run Gemini artwork analysis"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              activeItem.status === 'analyzing' ? 'animate-spin' : ''
                            }`}
                          />
                          <span>Re-analyze</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(activeItem.id)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#b91c1c] hover:bg-[#fef2f2] cursor-pointer"
                        title="Remove this design"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Artwork Visual Preview with Neutral Checkerboard for Alpha PNGs */}
                  {activeItem.previewDataUrl && (
                    <div
                      className="rounded-xl border border-[#e2e8f0] p-4 flex items-center justify-center max-h-64 overflow-hidden"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <img
                        src={activeItem.previewDataUrl}
                        alt={activeItem.fileName}
                        className="max-h-56 w-auto object-contain rounded"
                      />
                    </div>
                  )}

                  {/* Analysis Status Banner */}
                  {activeItem.status === 'analyzing' || activeItem.status === 'queued' ? (
                    <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-xs text-[#0369a1] flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>
                        Analyzing design concept, visible lettering, colors, and product suitability...
                      </span>
                    </div>
                  ) : activeItem.status === 'failed' ? (
                    <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                        <span>
                          {activeItem.errorMessage ||
                            'Automatic analysis was unavailable. You can still select any product manually below and copy your adaptation prompt.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onReanalyzeItem(activeItem.id)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#fcd34d] text-[11px] font-bold hover:bg-[#fef3c7] shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    activeItem.analysis && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="font-bold text-[#0f766e] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Artwork Analysis
                            {activeItem.fromCache ? ' (Restored from cache)' : ''}
                          </span>
                          {activeItem.modelUsed && (
                            <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] font-medium">
                              {activeItem.modelUsed}
                            </span>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
                          <p className="font-semibold text-[#0f172a]">
                            {activeItem.analysis.conceptSummary}
                          </p>
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] text-[#475569]">
                              Type: {activeItem.analysis.compositionType}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] text-[#475569]">
                              Detail: {activeItem.analysis.detailLevel}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] text-[#475569]">
                              Aspect: {activeItem.analysis.aspectProfile}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] text-[#475569]">
                              Backdrop: {activeItem.analysis.currentBackground.replace(/-/g, ' ')}
                            </span>
                          </div>

                          {activeItem.analysis.exactVisibleText && (
                            <div className="pt-1 border-t border-[#e2e8f0]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                                Exact Text Preserved:
                              </span>
                              <p className="text-xs font-mono text-[#0f172a] mt-0.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e2e8f0]">
                                “{activeItem.analysis.exactVisibleText}”
                              </p>
                            </div>
                          )}

                          {activeItem.analysis.dominantColors.length > 0 && (
                            <p className="text-[11px] text-[#475569]">
                              <strong>Palette:</strong>{' '}
                              {activeItem.analysis.dominantColors.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* 2. Product Recommendation & Quick Alternatives */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0f172a]">
                      2. Best Product Match
                    </h3>
                    <span className="text-[11px] text-[#64748b]">
                      Switch anytime with zero extra API calls
                    </span>
                  </div>

                  {activeItem.recommendations ? (
                    <div className="space-y-3">
                      {/* Primary Recommendation */}
                      {(() => {
                        const rec = activeItem.recommendations.primary;
                        const isSelected =
                          activeItem.options.selectedProductId === rec.productId;
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateItemOptions(activeItem.id, {
                                selectedProductId: rec.productId,
                              })
                            }
                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#f0fdfa] border-[#0f766e] ring-1 ring-[#0f766e]/20 shadow-xs'
                                : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#0f766e]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-[#0f766e] text-white text-[10px] font-bold uppercase tracking-wide">
                                  Recommended
                                </span>
                                <span className="text-sm font-bold text-[#0f172a]">
                                  {rec.productName}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0f766e]">
                                Fit {rec.score}/100 • {rec.adaptationEffort}
                              </span>
                            </div>
                            <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                              {rec.reason}
                            </p>
                          </button>
                        );
                      })()}

                      {/* 2 Alternatives */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeItem.recommendations.alternatives.map((alt) => {
                          const isSelected =
                            activeItem.options.selectedProductId === alt.productId;
                          return (
                            <button
                              key={alt.productId}
                              type="button"
                              onClick={() =>
                                onUpdateItemOptions(activeItem.id, {
                                  selectedProductId: alt.productId,
                                })
                              }
                              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#f0fdfa] border-[#0f766e] ring-1 ring-[#0f766e]/20 shadow-xs'
                                  : 'bg-white border-[#e2e8f0] hover:border-[#0f766e]/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-[#0f172a]">
                                  {alt.productName}
                                </span>
                                <span className="text-[10px] font-semibold text-[#64748b]">
                                  {alt.score}/100
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748b] mt-1 line-clamp-2">
                                {alt.reason}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Manual Full-Catalog Selector (20+ Products) */}
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <label className="block text-[11px] font-semibold text-[#334155] mb-1.5">
                      Browse All Merchandise Products ({catalog.length})
                    </label>
                    <select
                      value={activeItem.options.selectedProductId}
                      onChange={(e) =>
                        onUpdateItemOptions(activeItem.id, {
                          selectedProductId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-semibold bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                    >
                      {catalogByCategory.map((group) => (
                        <optgroup key={group.category} label={group.label}>
                          {group.products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Quick Adaptation Controls & Copyable ChatGPT Prompt */}
              <div className="lg:col-span-6 space-y-5 sticky top-24">
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
                  {/* Top Bar: Target Product + Copy Prompt */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0f172a]">
                          ChatGPT Adaptation Prompt
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#f0fdfa] text-[#0f766e] border border-[#a7f3d0] text-[10px] font-bold">
                          {activeProfile.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Attach your design image in ChatGPT and paste this prompt
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isManualPromptEdited && (
                        <button
                          type="button"
                          onClick={() => onResetManualPrompt(activeItem.id)}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] cursor-pointer"
                          title="Reset manual text edits back to auto-generated prompt"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(activeItem.id, activePrompt)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                          copiedId === activeItem.id
                            ? 'bg-[#16a34a]'
                            : 'bg-[#0f766e] hover:bg-[#115e59]'
                        }`}
                      >
                        {copiedId === activeItem.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>
                          {copiedId === activeItem.id ? 'Copied Prompt!' : 'Copy Prompt'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Essential Inline Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Background Treatment
                      </label>
                      <select
                        value={activeItem.options.backgroundTreatment}
                        onChange={(e) =>
                          onUpdateItemOptions(activeItem.id, {
                            backgroundTreatment: e.target.value as BackgroundTreatmentOption,
                          })
                        }
                        className="w-full px-2.5 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#0f766e]"
                      >
                        <option value="ai-decides">AI Decides (Smart Default)</option>
                        <option value="transparent">Transparent PNG (True Alpha)</option>
                        <option value="full-background">Full Background</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Color Treatment
                      </label>
                      <select
                        value={activeItem.options.colorTreatment}
                        onChange={(e) =>
                          onUpdateItemOptions(activeItem.id, {
                            colorTreatment: e.target.value as ColorTreatmentOption,
                          })
                        }
                        className="w-full px-2.5 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#0f766e]"
                      >
                        <option value="ai-decides">AI Decides (Contrast-Aware)</option>
                        <option value="preserve-original">Preserve Original Colors</option>
                        <option value="adapt-for-product">Adapt for Product Color</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Target Product Color (optional)
                      </label>
                      <input
                        type="text"
                        list={`d2p-colors-${activeProfile.id}`}
                        value={activeItem.options.productColor}
                        onChange={(e) =>
                          onUpdateItemOptions(activeItem.id, {
                            productColor: e.target.value,
                          })
                        }
                        placeholder={
                          activeProfile.supportedProductColors.length > 0
                            ? `e.g., ${activeProfile.supportedProductColors.slice(0, 3).join(', ')}`
                            : 'e.g., Black, Cream, Clear Glass'
                        }
                        className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:outline-none focus:border-[#0f766e]"
                      />
                      <datalist id={`d2p-colors-${activeProfile.id}`}>
                        {activeProfile.supportedProductColors.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Decision Summary Badges */}
                  {bgDecision && colorDecision && (
                    <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5 text-[11px] text-[#475569]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ${
                            bgDecision.mode === 'transparent'
                              ? 'bg-[#e0f2fe] text-[#0369a1]'
                              : 'bg-[#fef3c7] text-[#92400e]'
                          }`}
                        >
                          {bgDecision.mode === 'transparent'
                            ? 'Output: True Transparent PNG'
                            : 'Output: Full Background'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] font-semibold text-[#334155]">
                          Surface: {colorDecision.targetProductColor}
                        </span>
                      </div>
                      <p className="leading-snug">{bgDecision.rationale}</p>
                      {colorDecision.requiresInkVerification && (
                        <p className="text-[#92400e] flex items-start gap-1.5 pt-0.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            Printing/etching method on this blank should be verified before finalizing multi-color ink vs single-color etching.
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Collapsed-by-default Advanced Settings */}
                  <details className="rounded-xl border border-[#e2e8f0] bg-[#fafafa]">
                    <summary className="px-3.5 py-2.5 text-xs font-semibold text-[#334155] cursor-pointer select-none">
                      Advanced Adaptation Notes & Profile Specs
                    </summary>
                    <div className="p-3.5 pt-1 space-y-2.5 border-t border-[#e2e8f0]">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                          Additional Custom Art-Direction Notes
                        </label>
                        <textarea
                          rows={2}
                          value={activeItem.options.customNotes || ''}
                          onChange={(e) =>
                            onUpdateItemOptions(activeItem.id, {
                              customNotes: e.target.value,
                            })
                          }
                          placeholder="e.g., Slightly simplify the outer border or center badge higher on chest..."
                          className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                        />
                      </div>
                      <p className="text-[11px] text-[#64748b]">
                        <strong>Active Profile Surface:</strong> {activeProfile.printSurfaceCharacteristics}
                      </p>
                    </div>
                  </details>

                  {/* Editable Prompt Textarea */}
                  <div>
                    <textarea
                      rows={16}
                      value={activePrompt}
                      onChange={(e) =>
                        onManualPromptChange(activeItem.id, e.target.value)
                      }
                      spellCheck={false}
                      className="w-full p-3.5 bg-[#fafafa] focus:bg-white border border-[#e2e8f0] focus:border-[#0f766e] rounded-xl text-xs font-mono text-[#1e293b] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
