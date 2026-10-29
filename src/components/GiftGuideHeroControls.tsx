import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Compass,
  FileText,
  Info,
  Layers,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import {
  GiftGuideHeroPromptOptions,
  HERO_PRODUCT_CATEGORY_LIST,
  HERO_PROP_DENSITY_OPTIONS,
  HeroProductCategory,
  HeroProductReference,
  HeroPropDensity,
  inferHeroProductCategoryFromName,
  resolveHeroCameraPerspective,
  STUDIO_ASPECT_RATIOS,
  STUDIO_BACKGROUNDS,
  STUDIO_SURFACES,
} from '../types';

interface GiftGuideHeroControlsProps {
  options: GiftGuideHeroPromptOptions;
  onChange: (newOptions: GiftGuideHeroPromptOptions) => void;
  onGenerate: () => void;
}

interface CatalogSampleTemplate {
  baseName: string;
  category: HeroProductCategory;
  sampleSourceId: string;
}

const HERO_CATALOG_SAMPLE_POOL: CatalogSampleTemplate[] = [
  {
    baseName: 'Sidereus-Nuncius-Galileo-Tee.svg',
    category: 'tshirt',
    sampleSourceId: 'sample-tshirt',
  },
  {
    baseName: 'Fibonacci-Golden-Spiral-Mug.svg',
    category: 'mug',
    sampleSourceId: 'sample-mug',
  },
  {
    baseName: 'Quantum-Wave-Vacuum-Flask.svg',
    category: 'waterBottle',
    sampleSourceId: 'sample-bottle',
  },
  {
    baseName: 'Celestial-Atlas-Poster-Print.svg',
    category: 'poster',
    sampleSourceId: 'sample-notebook',
  },
  {
    baseName: 'Observatory-Heavyweight-Hoodie.svg',
    category: 'hoodie',
    sampleSourceId: 'sample-tshirt',
  },
  {
    baseName: 'Principia-Hardcover-Field-Notebook.svg',
    category: 'notebook',
    sampleSourceId: 'sample-notebook',
  },
  {
    baseName: 'Botanical-Taxonomy-Canvas-Tote-Bag.svg',
    category: 'toteBag',
    sampleSourceId: 'sample-tshirt',
  },
  {
    baseName: 'Thermodynamics-Insulated-Tumbler.svg',
    category: 'tumbler',
    sampleSourceId: 'sample-bottle',
  },
  {
    baseName: 'Orbital-Mechanics-Crewneck-Sweatshirt.svg',
    category: 'sweatshirt',
    sampleSourceId: 'sample-tshirt',
  },
  {
    baseName: 'Lab-Beaker-Etched-Glass.svg',
    category: 'glass',
    sampleSourceId: 'sample-mug',
  },
];

interface HeroProductRowProps {
  item: HeroProductReference;
  index: number;
  totalCount: number;
  onUpdateCategory: (id: string, category: HeroProductCategory) => void;
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
}

const HeroProductRow = memo<HeroProductRowProps>(
  ({ item, index, totalCount, onUpdateCategory, onSetPrimary, onRemove }) => {
    return (
      <div
        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
          item.isPrimaryHero
            ? 'border-[#0284c7] bg-[#f0f9ff]/70'
            : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
        }`}
      >
        {/* Thumbnail */}
        <div className="w-11 h-11 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
          {item.dataUrl ? (
            <img
              src={item.dataUrl}
              alt={item.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-bold text-[#64748b]">#{index + 1}</span>
          )}
        </div>

        {/* Name & Category Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#334155]">
              #{index + 1} of {totalCount}
            </span>
            <p className="text-xs font-semibold text-[#0f172a] truncate" title={item.name}>
              {item.name}
            </p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <select
              aria-label={`Product category for ${item.name}`}
              value={item.category}
              onChange={(e) =>
                onUpdateCategory(item.id, e.target.value as HeroProductCategory)
              }
              className="px-2 py-1 text-[11px] rounded-lg border border-[#cbd5e1] bg-white text-[#1e293b] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0284c7]"
            >
              {HERO_PRODUCT_CATEGORY_LIST.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {item.size && (
              <span className="text-[10px] text-[#64748b] hidden sm:inline">{item.size}</span>
            )}

            {item.isPrimaryHero && (
              <span className="text-[10px] font-semibold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded-md">
                Primary Focal Item
              </span>
            )}
          </div>
        </div>

        {/* Primary Toggle & Remove */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onSetPrimary(item.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              item.isPrimaryHero
                ? 'text-[#0284c7] bg-[#e0f2fe]'
                : 'text-[#94a3b8] hover:text-[#0284c7] hover:bg-[#f1f5f9]'
            }`}
            title="Set as primary hero focal product"
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors cursor-pointer"
            title={`Remove ${item.name}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

HeroProductRow.displayName = 'HeroProductRow';

export const GiftGuideHeroControls: React.FC<GiftGuideHeroControlsProps> = ({
  options,
  onChange,
  onGenerate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const sampleCounterRef = useRef<number>(1);

  // Keep a ref to latest options so rapid file drops, pastes, or row callbacks
  // never read a stale product list or trigger unnecessary listener re-binds.
  const optionsRef = useRef<GiftGuideHeroPromptOptions>(options);
  optionsRef.current = options;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Cleanup any created blob URLs on unmount
  useEffect(() => {
    const trackedUrls = objectUrlsRef.current;
    return () => {
      trackedUrls.forEach((url) => URL.revokeObjectURL(url));
      trackedUrls.clear();
    };
  }, []);

  const updateOption = useCallback(
    <K extends keyof GiftGuideHeroPromptOptions>(
      key: K,
      value: GiftGuideHeroPromptOptions[K]
    ) => {
      const current = optionsRef.current;
      onChangeRef.current({
        ...current,
        [key]: value,
      });
    },
    []
  );

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (f) =>
        f.type.startsWith('image/') ||
        /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(f.name)
    );
    if (files.length === 0) {
      setUploadNotice('Please select valid image files (PNG, JPG, WEBP, SVG).');
      return;
    }
    setUploadNotice(null);

    const now = Date.now();
    const newItems: HeroProductReference[] = files.map((file, idx) => {
      const sizeKB = file.size / 1024;
      const formattedSize =
        sizeKB >= 1024
          ? `${(sizeKB / 1024).toFixed(2)} MB`
          : `${Math.max(1, Math.round(sizeKB))} KB`;
      const inferredCategory = inferHeroProductCategoryFromName(file.name);
      const id = `hero-ref-${now}-${idx}-${Math.random().toString(36).slice(2, 7)}`;

      let previewUrl: string | undefined;
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(previewUrl);
      }

      return {
        id,
        name: file.name,
        dataUrl: previewUrl,
        size: formattedSize,
        category: inferredCategory,
      };
    });

    const current = optionsRef.current;
    const merged = [...current.products, ...newItems];
    if (merged.length > 0 && !merged.some((p) => p.isPrimaryHero)) {
      merged[0] = { ...merged[0], isPrimaryHero: true };
    }
    onChangeRef.current({
      ...current,
      products: merged,
    });
  }, []);

  // Support clipboard paste when Gift Guide Hero Image mode is active
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter(
          (f) =>
            f.type.startsWith('image/') ||
            /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(f.name)
        );
        if (imageFiles.length > 0) {
          e.preventDefault();
          processFiles(imageFiles);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  const handleUpdateProductCategory = useCallback(
    (id: string, category: HeroProductCategory) => {
      const current = optionsRef.current;
      const updated = current.products.map((p) =>
        p.id === id ? { ...p, category } : p
      );
      onChangeRef.current({
        ...current,
        products: updated,
      });
    },
    []
  );

  const handleSetPrimaryProduct = useCallback((id: string) => {
    const current = optionsRef.current;
    const updated = current.products.map((p) => ({
      ...p,
      isPrimaryHero: p.id === id,
    }));
    onChangeRef.current({
      ...current,
      products: updated,
    });
  }, []);

  const handleRemoveProduct = useCallback((id: string) => {
    const current = optionsRef.current;
    const target = current.products.find((p) => p.id === id);
    if (target?.dataUrl && objectUrlsRef.current.has(target.dataUrl)) {
      URL.revokeObjectURL(target.dataUrl);
      objectUrlsRef.current.delete(target.dataUrl);
    }

    const remaining = current.products.filter((p) => p.id !== id);
    if (remaining.length > 0 && !remaining.some((p) => p.isPrimaryHero)) {
      remaining[0] = { ...remaining[0], isPrimaryHero: true };
    }
    onChangeRef.current({
      ...current,
      products: remaining,
    });
  }, []);

  const handleClearAllProducts = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    updateOption('products', []);
  }, [updateOption]);

  const createCatalogSampleItems = (count: number, startIndex = 0): HeroProductReference[] => {
    const now = Date.now();
    return Array.from({ length: count }, (_, idx) => {
      const templateIndex = (startIndex + idx) % HERO_CATALOG_SAMPLE_POOL.length;
      const template = HERO_CATALOG_SAMPLE_POOL[templateIndex];
      const cyclePass = Math.floor((startIndex + idx) / HERO_CATALOG_SAMPLE_POOL.length);
      const name =
        cyclePass === 0
          ? template.baseName
          : template.baseName.replace(/\.svg$/i, `-v${cyclePass + 1}.svg`);
      const imageUrl = SAMPLE_PRODUCTS.find(
        (s) => s.id === template.sampleSourceId
      )?.imageUrl;

      return {
        id: `sample-hero-${now}-${startIndex + idx}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        dataUrl: imageUrl,
        size: 'Sample Product',
        category: template.category,
      };
    });
  };

  const handleAppendSingleSampleProduct = () => {
    const current = optionsRef.current;
    const nextIdx = current.products.length + sampleCounterRef.current - 1;
    sampleCounterRef.current += 1;
    const [newItem] = createCatalogSampleItems(1, nextIdx);
    const merged = [...current.products, newItem];
    if (merged.length > 0 && !merged.some((p) => p.isPrimaryHero)) {
      merged[0] = { ...merged[0], isPrimaryHero: true };
    }
    updateOption('products', merged);
  };

  const handleLoadEightProductSampleSet = () => {
    const eightSet = createCatalogSampleItems(8, 0);
    eightSet[0].isPrimaryHero = true;
    updateOption('products', eightSet);
  };

  const handleLoadClothingSampleSet = () => {
    const tshirtImg = SAMPLE_PRODUCTS.find((s) => s.id === 'sample-tshirt')?.imageUrl;
    const now = Date.now();
    const clothingSet: HeroProductReference[] = [
      {
        id: `sample-clothing-hoodie-${now}`,
        name: 'Observatory-Heavyweight-Hoodie.svg',
        dataUrl: tshirtImg,
        size: 'Sample Product',
        category: 'hoodie',
        isPrimaryHero: true,
      },
      {
        id: `sample-clothing-tshirt-${now}`,
        name: 'Sidereus-Nuncius-Galileo-Tee.svg',
        dataUrl: tshirtImg,
        size: 'Sample Product',
        category: 'tshirt',
      },
      {
        id: `sample-clothing-sweatshirt-${now}`,
        name: 'Orbital-Mechanics-Crewneck-Sweatshirt.svg',
        dataUrl: tshirtImg,
        size: 'Sample Product',
        category: 'sweatshirt',
      },
    ];
    updateOption('products', clothingSet);
  };

  const handleResetDefaults = () => {
    onChange({
      products: options.products,
      background: 'gradient-wall-neutral-surface',
      surface: 'editorial-tabletop',
      propDensity: 'balanced',
      aspectRatio: '16:9',
      additionalInstructions: '',
    });
  };

  const resolvedCamera = resolveHeroCameraPerspective(options);

  return (
    <div className="space-y-6">
      {/* ==========================================
          1. MULTI-PRODUCT REFERENCE UPLOADER
         ========================================== */}
      <div className="space-y-3 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">
                1. Product Reference Images
              </h2>
              <p className="text-[11px] text-[#64748b]">
                Upload any number of actual products to arrange together in one gift-guide hero composition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0369a1] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Images</span>
            </button>

            {options.products.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllProducts}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({options.products.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              processFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
            isDragging
              ? 'border-[#0284c7] bg-[#f0f9ff]'
              : 'border-[#cbd5e1] hover:border-[#94a3b8] bg-[#f8fafc] hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#0f172a]">
                Drop product images here (1, 8, 12+ files), or{' '}
                <span className="text-[#0284c7] underline">browse files</span>
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Add in batches or all at once • T-shirts, hoodies, mugs, water bottles, posters, tote bags & more •{' '}
                <kbd className="px-1 py-0.5 rounded bg-white border text-[10px] font-mono">
                  Ctrl+V
                </kbd>{' '}
                to paste
              </p>
            </div>
          </div>
        </div>

        {uploadNotice && (
          <p className="text-xs text-[#dc2626] font-medium px-2">{uploadNotice}</p>
        )}

        {/* Uploaded Product Reference List */}
        {options.products.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569] px-1">
              <span className="font-semibold text-[#0f172a]">
                Selected Reference Products ({options.products.length}{' '}
                {options.products.length === 1 ? 'item' : 'items'} — all {options.products.length}{' '}
                included in prompt)
              </span>
              <span>Click ★ to set primary focal product • Click × to remove</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {options.products.map((item, idx) => (
                <HeroProductRow
                  key={item.id}
                  item={item}
                  index={idx}
                  totalCount={options.products.length}
                  onUpdateCategory={handleUpdateProductCategory}
                  onSetPrimary={handleSetPrimaryProduct}
                  onRemove={handleRemoveProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Sample Sets & Incremental Adder for Instant Testing */}
        <div className="pt-2 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-[#475569]">
            Quick sample products:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAppendSingleSampleProduct}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#0f172a] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
              title="Append one more sample product to the current list"
            >
              + Add Sample Product
            </button>
            <button
              type="button"
              onClick={handleLoadEightProductSampleSet}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#0369a1] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] rounded-lg transition-colors cursor-pointer"
              title="Load an 8-product mixed gift-guide composition"
            >
              Load Mixed Gift Set (8 items)
            </button>
            <button
              type="button"
              onClick={handleLoadClothingSampleSet}
              className="px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] bg-[#f0fdfa] hover:bg-[#ccfbf1] border border-[#99f6e4] rounded-lg transition-colors cursor-pointer"
            >
              Load Clothing Set (3 items)
            </button>
          </div>
        </div>

        {/* Downstream Image Model Reference Attachment Note */}
        <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-start gap-2 text-[10px] text-[#64748b]">
          <Info className="w-3.5 h-3.5 text-[#0284c7] mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-[#334155]">No limit in Prompt Studio:</strong> Every product you
            add here is included in the generated prompt without truncation. When attaching reference
            image files in external tools, note each platform&apos;s per-message upload limit (e.g.,
            ChatGPT web UI allows up to 10 image attachments per prompt; Gemini web UI allows up to
            10 files per turn, with higher limits in Google AI Studio / Gemini API).
          </p>
        </div>
      </div>

      {/* ==========================================
          2. PROP DENSITY & BACKGROUND CONTROLS
         ========================================== */}
      <div className="space-y-6 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">
                2. Hero Composition & Background
              </h2>
              <p className="text-[11px] text-[#64748b]">
                Consistent studio lighting, camera perspective & editorial styling
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#475569] hover:text-[#0284c7] bg-[#f8fafc] hover:bg-[#f0f9ff] border border-[#cbd5e1] rounded-lg transition-all cursor-pointer"
            title="Reset hero settings to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Prop Density Selector (Primary Composition Control) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              Prop Density
            </label>
            <span className="text-[11px] text-[#64748b]">
              Products always remain the primary focus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {HERO_PROP_DENSITY_OPTIONS.map((opt) => {
              const isSelected = options.propDensity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateOption('propDensity', opt.id as HeroPropDensity)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-[#0369a1]' : 'text-[#0f172a]'
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#e0f2fe] text-[#0369a1]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#64748b] mt-1 leading-relaxed">
                      {opt.shortDescription}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Configuration (Reused from Studio Options) */}
        <div>
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-[#0284c7]" />
            Background Configuration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STUDIO_BACKGROUNDS.map((bg) => {
              const isSelected = options.background === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => updateOption('background', bg.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border flex-shrink-0 shadow-xs ${bg.swatchClass}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold leading-tight truncate ${
                        isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'
                      }`}
                    >
                      {bg.label}
                    </p>
                    <p className="text-[10px] text-[#64748b] mt-0.5 truncate">{bg.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Supporting Tabletop Surface */}
        <div>
          <label
            htmlFor="hero-surface-select"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5 block"
          >
            Supporting Studio Surface
          </label>
          <select
            id="hero-surface-select"
            value={options.surface}
            onChange={(e) => updateOption('surface', e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] bg-white text-[#1e293b] font-medium"
          >
            {STUDIO_SURFACES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} — {s.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio (Defaults to 16:9 Landscape) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0284c7]" />
              Hero Image Aspect Ratio
            </label>
            <span className="text-[11px] text-[#0f766e] font-medium">
              16:9 Landscape recommended for Gift Guides
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STUDIO_ASPECT_RATIOS.map((item) => {
              const isSelected = options.aspectRatio === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateOption('aspectRatio', item.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                  }`}
                >
                  <div
                    className={`border-2 rounded-xs transition-colors ${
                      isSelected
                        ? 'border-[#0284c7] bg-[#bae6fd]'
                        : 'border-[#94a3b8] bg-[#f1f5f9]'
                    } ${item.shapeClass}`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[9px] text-[#64748b] leading-none">{item.ratioDesc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Camera & Composition Summary Badge */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-start gap-2.5 text-[11px] text-[#475569]">
          <Camera className="w-4 h-4 text-[#0284c7] mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-[#0f172a]">
              Auto Camera Perspective: {resolvedCamera.summaryLabel}
            </span>
            <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed">
              Automatically adapts to your uploaded product mix—using an overhead perspective for
              flat-only garments/posters and an elevated three-quarter tabletop perspective when
              upright items (mugs, bottles) or mixed categories are included.
            </p>
          </div>
        </div>

        {/* Optional Additional Notes */}
        <div>
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
            Optional Gift-Guide Theme Note
          </label>
          <input
            type="text"
            placeholder="Optional: e.g. Astronomy & stargazing gift guide, subtle brass & archival accents..."
            value={options.additionalInstructions || ''}
            onChange={(e) => updateOption('additionalInstructions', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b] placeholder-[#94a3b8]"
          />
        </div>

        {/* Generate Button */}
        <div className="pt-2 border-t border-[#f1f5f9]">
          <button
            type="button"
            onClick={onGenerate}
            className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#0284c7] via-[#0f766e] to-[#0d9488] hover:from-[#0369a1] hover:to-[#0f766e] hover:shadow-lg active:scale-[0.99] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#a7f3d0]" />
            <span>Generate Gift Guide Hero Image Prompt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
