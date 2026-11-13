import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StudioNavigation } from './components/StudioNavigation';
import {
  UploadDropzone,
  ProductAnalysisStatus,
  ProductAnalysisSummary,
} from './components/UploadDropzone';
import { ConfigurationControls } from './components/ConfigurationControls';
import { GiftGuideHeroControls } from './components/GiftGuideHeroControls';
import { PromptResultView, ResultActiveChip } from './components/PromptResultView';
import { ProductCopyControls } from './components/writing/ProductCopyControls';
import { SettingsPage } from './components/settings/SettingsPage';
import { StyleLibraryModal } from './components/writing/StyleLibraryModal';
import { WritingStyleKey } from './prompts/writing/styles';
import { TEMPLATES_UPDATED_EVENT } from './utils/templateManager';
import { analyzeProductImage } from './utils/imageAnalyzer';
import { resolveAutoPromptUpdate } from './utils/promptEditGuard';
import {
  applySmartSetupToSettings,
  CURATED_STUDIO_LOOKS,
  CuratedStudioLook,
  formatPresentationSummary,
  getNextStudioLook,
} from './prompts/shared/smartSetup';
import {
  GenerationSettings,
  GiftGuideHeroPromptOptions,
  StudioToolId,
  ProductCopyOptions,
  STUDIO_BACKGROUNDS,
  STUDIO_SURFACES,
  HERO_PROP_DENSITY_OPTIONS,
  normalizeAspectRatio,
  buildChatGPTPhotoPrompt,
  buildGeminiPhotoPrompt,
  buildGiftGuideHeroPrompt,
  resolveHeroCameraPerspective,
  generateProductCopyPrompt,
} from './types';
import { Sparkles, Shield, CheckCircle2 } from 'lucide-react';

const DEFAULT_IMAGE_SETTINGS: GenerationSettings = {
  productType: 'notebook',
  orientation: 'flat-lay',
  background: 'gradient-wall-neutral-surface',
  surface: 'editorial-tabletop',
  props: 'subtle-historical',
  aspectRatio: '3:4',
  additionalInstructions: '',
  theme: 'editorial-still-life',
  productPosition: 'centered',
  productPresentation: 'editorial',
  shotType: 'hero-product',
  cameraAngle: 'three-quarter',
  perspective: 'natural',
  focalLength: 'normal-editorial',
  depthOfField: 'gentle-falloff',
  compositionStyle: 'centered',
  negativeSpace: 'balanced',
  lightingStyle: 'large-soft-studio',
  shadowCharacter: 'soft',
  propLevel: 'minimal',
  propFamily: 'category-aware',
  propPlacement: 'background-only',
  colorPalette: 'science-blue-mint',
  variationLevel: 'moderate',
  websiteCropSafe: false,
};

const DEFAULT_GIFT_GUIDE_HERO_OPTIONS: GiftGuideHeroPromptOptions = {
  products: [],
  background: 'gradient-wall-neutral-surface',
  surface: 'editorial-tabletop',
  propDensity: 'balanced',
  aspectRatio: '16:9',
  additionalInstructions: '',
};

const DEFAULT_PRODUCT_COPY_OPTIONS: ProductCopyOptions = {
  productName: 'Celestial Atlas Hardcover Journal',
  productType: 'Archival Stationery / Hardcover Notebook',
  targetCustomer: 'Writers, stargazers, historians, and mindful note-takers',
  productConcept: 'Inspired by Galileo Galilei’s 1610 Sidereus Nuncius telescopic sketches of lunar craters and Jovian satellites.',
  keyFeatures: '160 pages of 120 GSM fountain pen-friendly paper\nDebossed metallic gold foil constellation charts\nSilk ribbon page marker & elastic closure band\nLay-flat smyth-sewn binding',
  materials: '120 GSM archival acid-free ivory paper, tactile woven linen bookcloth cover',
  dimensions: '5.5 x 8.25 inches (A5)',
  occasion: 'Graduation, observatory visit keepsake, or thoughtful desk gift',
  personalization: '',
  tone: 'sophisticated-editorial',
  additionalInstructions: 'Highlight the tactile linen bookcloth cover and zero feathering with fountain pen ink.',
};

export default function App() {
  const [activeTool, setActiveTool] = useState<StudioToolId>('product-photography');

  // ==========================================
  // Tool 1: Product Photography State (Dual-Model: ChatGPT & Gemini)
  // ==========================================
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    size: string;
    width?: number;
    height?: number;
  } | null>(null);
  const imageInfoRef = useRef<{
    name: string;
    size: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [imageSettings, setImageSettings] = useState<GenerationSettings>(DEFAULT_IMAGE_SETTINGS);
  const imageSettingsRef = useRef<GenerationSettings>(DEFAULT_IMAGE_SETTINGS);
  imageSettingsRef.current = imageSettings;

  // Smart Setup & Recognition State (runs once per newly uploaded image)
  const uploadSessionRef = useRef<number>(0);
  const recognitionAbortRef = useRef<AbortController | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<ProductAnalysisStatus>('idle');
  const [analysisSummary, setAnalysisSummary] = useState<ProductAnalysisSummary | null>(null);

  // One-Click Next Look State
  const [usedLookIds, setUsedLookIds] = useState<string[]>([]);
  const [currentLook, setCurrentLook] = useState<CuratedStudioLook | null>(() =>
    CURATED_STUDIO_LOOKS.find(
      (look) =>
        look.background === DEFAULT_IMAGE_SETTINGS.background &&
        look.surface === DEFAULT_IMAGE_SETTINGS.surface
    ) || null
  );
  const [lookCounter, setLookCounter] = useState<{ current: number; total: number } | null>(() => {
    const idx = CURATED_STUDIO_LOOKS.findIndex(
      (look) =>
        look.background === DEFAULT_IMAGE_SETTINGS.background &&
        look.surface === DEFAULT_IMAGE_SETTINGS.surface
    );
    return idx >= 0 ? { current: idx + 1, total: CURATED_STUDIO_LOOKS.length } : null;
  });

  const [chatgptPrompt, setChatgptPrompt] = useState<string>(() =>
    buildChatGPTPhotoPrompt({
      ...DEFAULT_IMAGE_SETTINGS,
      hasReferenceImage: false,
    })
  );
  const [geminiPrompt, setGeminiPrompt] = useState<string>(() =>
    buildGeminiPhotoPrompt({
      ...DEFAULT_IMAGE_SETTINGS,
      hasReferenceImage: false,
    })
  );

  // Manual Prompt Edit Safeguard State
  const [manualEdits, setManualEdits] = useState<{ chatgpt: boolean; gemini: boolean }>({
    chatgpt: false,
    gemini: false,
  });
  const [pendingAutoPrompts, setPendingAutoPrompts] = useState<{
    chatgpt: string | null;
    gemini: string | null;
  }>({ chatgpt: null, gemini: null });

  const chatgptPromptRef = useRef<string>(chatgptPrompt);
  const geminiPromptRef = useRef<string>(geminiPrompt);
  const manualEditsRef = useRef<{ chatgpt: boolean; gemini: boolean }>(manualEdits);
  chatgptPromptRef.current = chatgptPrompt;
  geminiPromptRef.current = geminiPrompt;
  manualEditsRef.current = manualEdits;

  const updatePhotoPrompts = (
    settings: GenerationSettings,
    hasRef: boolean,
    refName?: string,
    forceOverwrite = false
  ) => {
    const opts = {
      ...settings,
      aspectRatio: normalizeAspectRatio(settings.aspectRatio, '3:4'),
      hasReferenceImage: hasRef,
      referenceImageName: refName,
    };
    const generatedChatgpt = buildChatGPTPhotoPrompt(opts);
    const generatedGemini = buildGeminiPhotoPrompt(opts);

    if (forceOverwrite) {
      setChatgptPrompt(generatedChatgpt);
      setGeminiPrompt(generatedGemini);
      chatgptPromptRef.current = generatedChatgpt;
      geminiPromptRef.current = generatedGemini;
      const clearedEdits = { chatgpt: false, gemini: false };
      manualEditsRef.current = clearedEdits;
      setManualEdits(clearedEdits);
      setPendingAutoPrompts({ chatgpt: null, gemini: null });
      return;
    }

    const resolved = resolveAutoPromptUpdate(
      {
        chatgptPrompt: chatgptPromptRef.current,
        geminiPrompt: geminiPromptRef.current,
        manualEdits: manualEditsRef.current,
        pendingAutoPrompts,
      },
      {
        chatgpt: generatedChatgpt,
        gemini: generatedGemini,
      }
    );

    setChatgptPrompt(resolved.chatgptPrompt);
    setGeminiPrompt(resolved.geminiPrompt);
    chatgptPromptRef.current = resolved.chatgptPrompt;
    geminiPromptRef.current = resolved.geminiPrompt;
    setPendingAutoPrompts(resolved.pendingAutoPrompts);
  };

  const handleManualChatgptChange = (newPrompt: string) => {
    setChatgptPrompt(newPrompt);
    chatgptPromptRef.current = newPrompt;
    const nextEdits = { ...manualEditsRef.current, chatgpt: true };
    manualEditsRef.current = nextEdits;
    setManualEdits(nextEdits);
    setPendingAutoPrompts((prev) => ({ ...prev, chatgpt: null }));
  };

  const handleManualGeminiChange = (newPrompt: string) => {
    setGeminiPrompt(newPrompt);
    geminiPromptRef.current = newPrompt;
    const nextEdits = { ...manualEditsRef.current, gemini: true };
    manualEditsRef.current = nextEdits;
    setManualEdits(nextEdits);
    setPendingAutoPrompts((prev) => ({ ...prev, gemini: null }));
  };

  const handleApplyPendingAutoPrompt = (tab: 'chatgpt' | 'gemini') => {
    const pendingVal = pendingAutoPrompts[tab];
    if (!pendingVal) return;

    if (tab === 'chatgpt') {
      setChatgptPrompt(pendingVal);
      chatgptPromptRef.current = pendingVal;
    } else {
      setGeminiPrompt(pendingVal);
      geminiPromptRef.current = pendingVal;
    }

    const nextEdits = { ...manualEditsRef.current, [tab]: false };
    manualEditsRef.current = nextEdits;
    setManualEdits(nextEdits);
    setPendingAutoPrompts((prev) => ({ ...prev, [tab]: null }));
  };

  const handleDismissPendingAutoPrompt = (tab: 'chatgpt' | 'gemini') => {
    setPendingAutoPrompts((prev) => ({ ...prev, [tab]: null }));
  };

  // ==========================================
  // Tool 2: Gift Guide Hero Image State
  // ==========================================
  const [heroOptions, setHeroOptions] = useState<GiftGuideHeroPromptOptions>(
    DEFAULT_GIFT_GUIDE_HERO_OPTIONS
  );
  const [heroPrompt, setHeroPrompt] = useState<string>(() =>
    buildGiftGuideHeroPrompt(DEFAULT_GIFT_GUIDE_HERO_OPTIONS)
  );

  // ==========================================
  // Tool 3: Product Copy State
  // ==========================================
  const [productCopyOptions, setProductCopyOptions] = useState<ProductCopyOptions>(DEFAULT_PRODUCT_COPY_OPTIONS);
  const [productCopyPrompt, setProductCopyPrompt] = useState<string>(() =>
    generateProductCopyPrompt(DEFAULT_PRODUCT_COPY_OPTIONS)
  );

  // ==========================================
  // Centralized Writing Style Library State
  // ==========================================
  const [isStyleLibraryOpen, setIsStyleLibraryOpen] = useState<boolean>(false);
  const [styleLibraryTab, setStyleLibraryTab] = useState<WritingStyleKey>('global');

  const handleOpenStyleLibrary = (tab: WritingStyleKey = 'global') => {
    setStyleLibraryTab(tab);
    setIsStyleLibraryOpen(true);
  };

  const handleStylesUpdated = () => {
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
  };

  const handleTemplatesUpdated = () => {
    updatePhotoPrompts(imageSettings, Boolean(uploadedImage), imageInfo?.name);
    setHeroPrompt(buildGiftGuideHeroPrompt(heroOptions));
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
  };

  useEffect(() => {
    const handleStyleStorageUpdate = () => {
      handleStylesUpdated();
    };
    const handleTemplateStorageUpdate = () => {
      handleTemplatesUpdated();
    };

    window.addEventListener('scienceOfGifts_styles_updated', handleStyleStorageUpdate);
    window.addEventListener(TEMPLATES_UPDATED_EVENT, handleTemplateStorageUpdate);

    return () => {
      window.removeEventListener('scienceOfGifts_styles_updated', handleStyleStorageUpdate);
      window.removeEventListener(TEMPLATES_UPDATED_EVENT, handleTemplateStorageUpdate);
    };
  }, [productCopyOptions, imageSettings, heroOptions, uploadedImage, imageInfo]);

  // ==========================================
  // Image Handlers
  // ==========================================
  const handleImageSelected = async (
    dataUrl: string,
    info: { name: string; size: string; width?: number; height?: number },
    meta?: { isSample?: boolean }
  ) => {
    if (recognitionAbortRef.current) {
      recognitionAbortRef.current.abort();
      recognitionAbortRef.current = null;
    }

    const sessionId = ++uploadSessionRef.current;
    setUploadedImage(dataUrl);
    setImageInfo(info);
    imageInfoRef.current = info;
    setUsedLookIds([]);
    setAnalysisSummary(null);

    if (meta?.isSample) {
      setAnalysisStatus('sample');
      updatePhotoPrompts(imageSettingsRef.current, true, info.name);
      return;
    }

    // Immediate prompt update with current settings while recognition runs once
    updatePhotoPrompts(imageSettingsRef.current, true, info.name);
    setAnalysisStatus('analyzing');

    const controller = new AbortController();
    recognitionAbortRef.current = controller;

    const outcome = await analyzeProductImage(dataUrl, info.name, {
      signal: controller.signal,
    });

    // Ignore stale or aborted response if user cleared or replaced the image
    if (uploadSessionRef.current !== sessionId) {
      return;
    }
    if (!outcome.ok && outcome.reason === 'aborted') {
      return;
    }

    if (outcome.ok) {
      const smartSettings = applySmartSetupToSettings(
        outcome.recognition,
        imageSettingsRef.current
      );
      setImageSettings(smartSettings);
      imageSettingsRef.current = smartSettings;
      updatePhotoPrompts(smartSettings, true, info.name);

      setAnalysisStatus('recognized');
      setAnalysisSummary({
        detectedLabel: outcome.recognition.detectedLabel,
        presentationSummary: formatPresentationSummary(smartSettings),
        briefNotes: outcome.recognition.briefNotes || undefined,
        modelUsed: outcome.modelUsed,
        fromCache: outcome.fromCache,
      });
    } else if (outcome.reason !== 'aborted') {
      setAnalysisStatus(outcome.reason);
      setAnalysisSummary({
        detectedLabel: '',
        presentationSummary: '',
        errorMessage: outcome.message,
      });
    }
  };

  const handleClearImage = () => {
    if (recognitionAbortRef.current) {
      recognitionAbortRef.current.abort();
      recognitionAbortRef.current = null;
    }
    uploadSessionRef.current += 1;
    setUploadedImage(null);
    setImageInfo(null);
    imageInfoRef.current = null;
    setAnalysisStatus('idle');
    setAnalysisSummary(null);
    setUsedLookIds([]);
    updatePhotoPrompts(imageSettings, false);
  };

  const handleImageSettingsChange = (newSettings: GenerationSettings) => {
    setImageSettings(newSettings);
    imageSettingsRef.current = newSettings;
    if (analysisStatus === 'recognized' && analysisSummary) {
      setAnalysisSummary({
        ...analysisSummary,
        presentationSummary: formatPresentationSummary(newSettings),
      });
    }
    updatePhotoPrompts(newSettings, Boolean(uploadedImage), imageInfoRef.current?.name);
  };

  const handleApplySampleSettings = (sampleSettings: Partial<GenerationSettings>) => {
    const newSettings: GenerationSettings = {
      ...imageSettingsRef.current,
      ...sampleSettings,
      aspectRatio: normalizeAspectRatio(
        sampleSettings.aspectRatio ?? imageSettingsRef.current.aspectRatio,
        '3:4'
      ),
    };
    setImageSettings(newSettings);
    imageSettingsRef.current = newSettings;
    const matchedLookIdx = CURATED_STUDIO_LOOKS.findIndex(
      (look) => look.background === newSettings.background && look.surface === newSettings.surface
    );
    setCurrentLook(matchedLookIdx >= 0 ? CURATED_STUDIO_LOOKS[matchedLookIdx] : null);
    setLookCounter(
      matchedLookIdx >= 0
        ? { current: matchedLookIdx + 1, total: CURATED_STUDIO_LOOKS.length }
        : null
    );
    setAnalysisStatus('sample');
    setAnalysisSummary({
      detectedLabel: newSettings.productType,
      presentationSummary: formatPresentationSummary(newSettings),
    });
    updatePhotoPrompts(newSettings, true, imageInfoRef.current?.name);
  };

  const handleNextLook = () => {
    const result = getNextStudioLook(imageSettings, usedLookIds, currentLook?.id);
    setImageSettings(result.nextSettings);
    imageSettingsRef.current = result.nextSettings;
    setUsedLookIds(result.nextUsedLookIds);
    setCurrentLook(result.look);
    setLookCounter({ current: result.lookNumber, total: result.totalLooks });

    if (analysisStatus === 'recognized' && analysisSummary) {
      setAnalysisSummary({
        ...analysisSummary,
        presentationSummary: formatPresentationSummary(result.nextSettings),
      });
    }

    updatePhotoPrompts(result.nextSettings, Boolean(uploadedImage), imageInfoRef.current?.name);
  };

  const handleGenerateImagePrompt = () => {
    updatePhotoPrompts(imageSettings, Boolean(uploadedImage), imageInfo?.name, true);
  };

  // ==========================================
  // Gift Guide Hero Image Handlers
  // ==========================================
  const handleHeroOptionsChange = (newOptions: GiftGuideHeroPromptOptions) => {
    setHeroOptions(newOptions);
    setHeroPrompt(buildGiftGuideHeroPrompt(newOptions));
  };

  const handleGenerateHeroPrompt = () => {
    setHeroPrompt(buildGiftGuideHeroPrompt(heroOptions));
  };

  // ==========================================
  // Product Copy Handlers
  // ==========================================
  const handleGenerateProductCopyPrompt = () => {
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
  };

  // Active prompt configuration for right column view
  let currentPrompt = '';
  let onCurrentPromptChange = (val: string) => {};
  let onCurrentClear = () => {};
  let onCurrentRegenerate = () => {};
  let currentToolTitle = 'Product Photo Prompt';
  let currentToolSubtitle = 'Ready to paste into Gemini / Midjourney / Flux';
  let currentActiveChips: ResultActiveChip[] = [];

  if (activeTool === 'gift-guide-hero') {
    currentPrompt = heroPrompt;
    onCurrentPromptChange = setHeroPrompt;
    onCurrentClear = () => setHeroPrompt('');
    onCurrentRegenerate = handleGenerateHeroPrompt;
    currentToolTitle = 'Gift Guide Hero Image Prompt';
    currentToolSubtitle = 'Multi-product editorial hero composition • Ready for Gemini / ChatGPT / Midjourney';

    const bgLabel =
      STUDIO_BACKGROUNDS.find((b) => b.id === heroOptions.background)?.label ||
      heroOptions.background;
    const surfaceLabel =
      STUDIO_SURFACES.find((s) => s.id === heroOptions.surface)?.label ||
      heroOptions.surface;
    const propDensityLabel =
      HERO_PROP_DENSITY_OPTIONS.find((p) => p.id === heroOptions.propDensity)?.label ||
      heroOptions.propDensity;
    const cameraResolution = resolveHeroCameraPerspective(heroOptions);

    currentActiveChips = [
      {
        label: 'Products',
        value:
          heroOptions.products.length > 0
            ? `${heroOptions.products.length} reference${heroOptions.products.length === 1 ? '' : 's'}`
            : 'Template mode',
      },
      { label: 'Aspect Ratio', value: heroOptions.aspectRatio },
      { label: 'Prop Density', value: propDensityLabel },
      { label: 'Background', value: bgLabel },
      { label: 'Surface', value: surfaceLabel },
      {
        label: 'Perspective',
        value:
          cameraResolution.mode === 'overhead-flat'
            ? '80°–90° Overhead'
            : '35°–45° Three-Quarter',
      },
    ];
  } else if (activeTool === 'product-copy') {
    currentPrompt = productCopyPrompt;
    onCurrentPromptChange = setProductCopyPrompt;
    onCurrentClear = () => setProductCopyPrompt('');
    onCurrentRegenerate = handleGenerateProductCopyPrompt;
    currentToolTitle = 'Product Page Copy Prompt';
    currentToolSubtitle = 'Ready to paste into Claude / ChatGPT / Gemini';
    currentActiveChips = [
      { label: 'Product', value: productCopyOptions.productName || 'Catalog Product' },
      { label: 'Type', value: productCopyOptions.productType || 'Custom Type' },
      { label: 'Tone', value: productCopyOptions.tone.replace(/-/g, ' ') },
      { label: 'Style Rules', value: 'Global + Copy' },
    ];
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      {/* Header */}
      <Navbar />

      {/* Main Category & Tool Navigation (Image: Product Photography, Gift Guide Hero Image | Writing: Product Copy) */}
      <StudioNavigation
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenStyleLibrary={() => handleOpenStyleLibrary('global')}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTool === 'settings' ? (
          <SettingsPage onBackToStudio={() => setActiveTool('product-photography')} />
        ) : (
          <>
            {/* Subtle Brand Introduction Header */}
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0f172a] leading-tight">
                Science of Gifts <span className="italic font-normal text-[#0f766e]">Prompt Studio.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#64748b] leading-relaxed">
                {activeTool === 'product-photography' &&
                  'Construct production-grade photography prompts optimized for ChatGPT (DALL-E 3) and Google Gemini Multimodal Studio with strict product fidelity.'}
                {activeTool === 'gift-guide-hero' &&
                  'Create cohesive, editorial multi-product hero image prompts for gift-guide articles—combining your actual product reference images with adaptive arrangement, background, and prop density.'}
                {activeTool === 'product-copy' &&
                  'Craft evocative, high-converting product page briefs celebrating craftsmanship, tactile materials, and honest storytelling—accelerated by reusable product profiles.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#475569]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-[#0f766e]" />
                  100% Local Browser Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7]" />
                  Smart Auto-Setup &amp; Manual Overrides
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                  Dual-Model ChatGPT & Gemini Studio
                </span>
              </div>
            </div>

            {/* Studio Layout: Left Controls, Right Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Controls for Active Tool (6 cols on lg) */}
              <div className="lg:col-span-6 space-y-6">
                {/* 1. PRODUCT PHOTOGRAPHY */}
                {activeTool === 'product-photography' && (
                  <>
                    <div className="space-y-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center justify-between">
                        <span>1. Upload Product Image (Local Preview)</span>
                        {uploadedImage && (
                          <span className="text-[11px] font-semibold text-[#0f766e] lowercase">
                            loaded locally
                          </span>
                        )}
                      </h2>
                      <UploadDropzone
                        image={uploadedImage}
                        imageInfo={imageInfo}
                        onImageSelected={handleImageSelected}
                        onClear={handleClearImage}
                        onApplySampleSettings={handleApplySampleSettings}
                        analysisStatus={analysisStatus}
                        analysisSummary={analysisSummary}
                      />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#334155]">
                        2. Editorial Staging & Environment
                      </h2>
                      <ConfigurationControls
                        settings={imageSettings}
                        onChange={handleImageSettingsChange}
                        onGenerate={handleGenerateImagePrompt}
                        hasImage={Boolean(uploadedImage)}
                      />
                    </div>
                  </>
                )}

                {/* 2. GIFT GUIDE HERO IMAGE */}
                {activeTool === 'gift-guide-hero' && (
                  <GiftGuideHeroControls
                    options={heroOptions}
                    onChange={handleHeroOptionsChange}
                    onGenerate={handleGenerateHeroPrompt}
                  />
                )}

                {/* 3. WRITING: PRODUCT COPY */}
                {activeTool === 'product-copy' && (
                  <ProductCopyControls
                    options={productCopyOptions}
                    onChange={setProductCopyOptions}
                    onGenerate={handleGenerateProductCopyPrompt}
                    onOpenStyleLibrary={() => handleOpenStyleLibrary('copy')}
                  />
                )}
              </div>

              {/* RIGHT COLUMN: Generated Prompt View (6 cols on lg) */}
              <div className="lg:col-span-6 space-y-6 sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center justify-between">
                  <span>{activeTool === 'product-photography' ? 'Product Photography Studio' : currentToolTitle}</span>
                  <span className="text-[11px] text-[#64748b]">Ready to copy</span>
                </h2>

                <PromptResultView
                  prompt={activeTool !== 'product-photography' ? currentPrompt : undefined}
                  onPromptChange={activeTool !== 'product-photography' ? onCurrentPromptChange : undefined}
                  chatgptPrompt={activeTool === 'product-photography' ? chatgptPrompt : undefined}
                  geminiPrompt={activeTool === 'product-photography' ? geminiPrompt : undefined}
                  onChatgptPromptChange={
                    activeTool === 'product-photography' ? handleManualChatgptChange : undefined
                  }
                  onGeminiPromptChange={
                    activeTool === 'product-photography' ? handleManualGeminiChange : undefined
                  }
                  onClear={
                    activeTool === 'product-photography'
                      ? () => {
                          setChatgptPrompt('');
                          setGeminiPrompt('');
                          chatgptPromptRef.current = '';
                          geminiPromptRef.current = '';
                          const clearedEdits = { chatgpt: false, gemini: false };
                          manualEditsRef.current = clearedEdits;
                          setManualEdits(clearedEdits);
                          setPendingAutoPrompts({ chatgpt: null, gemini: null });
                        }
                      : onCurrentClear
                  }
                  onRegenerate={activeTool === 'product-photography' ? handleGenerateImagePrompt : onCurrentRegenerate}
                  toolTitle={activeTool === 'product-photography' ? 'Product Photography Prompts' : currentToolTitle}
                  toolSubtitle={
                    activeTool === 'product-photography'
                      ? 'Optimized for ChatGPT (DALL-E 3) & Google Gemini Multimodal Studio'
                      : currentToolSubtitle
                  }
                  referenceImage={activeTool === 'product-photography' ? uploadedImage : null}
                  imageInfo={activeTool === 'product-photography' ? imageInfo : null}
                  settings={activeTool === 'product-photography' ? imageSettings : undefined}
                  activeChips={activeTool !== 'product-photography' ? currentActiveChips : undefined}
                  onNextLook={activeTool === 'product-photography' ? handleNextLook : undefined}
                  currentLookName={activeTool === 'product-photography' ? currentLook?.name || null : null}
                  currentLookSubtitle={activeTool === 'product-photography' ? currentLook?.subtitle || null : null}
                  lookCounter={activeTool === 'product-photography' ? lookCounter : null}
                  isChatgptManuallyEdited={activeTool === 'product-photography' ? manualEdits.chatgpt : false}
                  isGeminiManuallyEdited={activeTool === 'product-photography' ? manualEdits.gemini : false}
                  pendingChatgptAutoPrompt={
                    activeTool === 'product-photography' ? pendingAutoPrompts.chatgpt : null
                  }
                  pendingGeminiAutoPrompt={
                    activeTool === 'product-photography' ? pendingAutoPrompts.gemini : null
                  }
                  onApplyPendingAutoPrompt={
                    activeTool === 'product-photography' ? handleApplyPendingAutoPrompt : undefined
                  }
                  onDismissPendingAutoPrompt={
                    activeTool === 'product-photography' ? handleDismissPendingAutoPrompt : undefined
                  }
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Centralized Writing Style Library Modal */}
      <StyleLibraryModal
        isOpen={isStyleLibraryOpen}
        onClose={() => setIsStyleLibraryOpen(false)}
        onStylesUpdated={handleStylesUpdated}
        initialTab={styleLibraryTab}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-6 mt-12 text-center text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-editorial text-base text-[#1e293b]">
            Science of Gifts • Prompt Studio
          </p>
          <p className="text-[11px]">
            Product Photography & Editorial Writing Prompt Studio • Dual-Model ChatGPT & Gemini Engine • 100% Local
          </p>
        </div>
      </footer>
    </div>
  );
}
