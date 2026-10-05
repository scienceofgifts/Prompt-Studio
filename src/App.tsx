import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudioNavigation } from './components/StudioNavigation';
import { UploadDropzone } from './components/UploadDropzone';
import { ConfigurationControls } from './components/ConfigurationControls';
import { PromptResultView, ResultActiveChip } from './components/PromptResultView';
import { GiftGuideControls } from './components/writing/GiftGuideControls';
import { ArticleControls } from './components/writing/ArticleControls';
import { ProductCopyControls } from './components/writing/ProductCopyControls';
import { ProductDataControls } from './components/writing/ProductDataControls';
import { SettingsPage } from './components/settings/SettingsPage';
import { StyleLibraryModal } from './components/writing/StyleLibraryModal';
import { WritingStyleKey } from './prompts/writing/styles';
import { TEMPLATES_UPDATED_EVENT } from './utils/templateManager';
import {
  GenerationSettings,
  StudioToolId,
  GiftGuideCompositeState,
  ArticleOptions,
  ProductCopyOptions,
  ProductDataOptions,
  buildProductPhotoPrompt,
  generateGiftGuideSectionPrompt,
  generateArticlePrompt,
  generateProductCopyPrompt,
  generateProductDataPrompt,
} from './types';
import { Sparkles, Shield, CheckCircle2 } from 'lucide-react';

const DEFAULT_IMAGE_SETTINGS: GenerationSettings = {
  productType: 'notebook',
  orientation: 'flat-lay',
  background: 'gradient-wall-neutral-surface',
  surface: 'editorial-tabletop',
  props: 'subtle-historical',
  aspectRatio: '1:1',
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

const DEFAULT_GIFT_GUIDE_STATE: GiftGuideCompositeState = {
  activeSection: 'introduction',
  guideTitle: '10 Thoughtful Gifts for Amateur Astronomers & Stargazers',
  recipient: 'Astronomy enthusiasts, stargazers, and science lovers',
  primaryKeyword: 'astronomy gifts',
  additionalInstructions: 'Emphasize tactile craftsmanship, heirloom quality, and practical stargazing wonder.',

  // 1. Introduction
  introAngle: 'hobby-interest',
  introTone: 'conversational-editorial',

  // 2. Product Copy
  productName: 'Galilean Moon Phase Ceramic Mug',
  productType: 'Ceramic Drinkware',
  productUrl: 'https://scienceofgifts.com/products/galileo-moon-mug',
  productFeatures: '14 oz high-fired ceramic with matte black glaze\nAccurate 1610 Galileo lunar transit drawings in crisp white enamel\nMicrowave and dishwasher safe',
  whyItFits: 'Perfect for morning coffee reflections before sunrise observation sessions',
  productTone: 'conversational-editorial',
  productLength: 'balanced',

  // 3. More Gifts Section
  moreGiftsSectionName: 'More Astronomy T-Shirts',
  moreGiftsProductsIncluded: 'Vintage Apollo 11 schematic tee\nJames Webb deep field graphic tee\nHistorical telescope patent illustration tee',
  moreGiftsTone: 'conversational-editorial',
  moreGiftsLength: 'standard',

  // 4. How to Choose
  howToChooseConsiderations: 'Level of expertise (beginner vs experienced observer)\nDisplay space for charts vs portable field gear\nAvoiding cheap plastic novelty toys\nArchival paper quality for charts and journals',
  howToChooseTone: 'warm-helpful',
  howToChooseLength: 'standard',

  // 5. FAQ
  faqQuestionsToAnswer: 'What if they already own a basic telescope?\nAre celestial star charts functional or purely decorative?\nWhat is a reasonable budget for an astronomy gift?',
  faqNumberOfQuestions: 4,
  faqTone: 'warm-helpful',

  // 6. Title & Meta
  titleMetaSecondaryKeywords: 'stargazing gifts, telescope accessories, gifts for science teachers',
  titleMetaSearchIntent: 'Commercial investigation & curated gift discovery for science lovers',
};

const DEFAULT_ARTICLE_OPTIONS: ArticleOptions = {
  topic: 'The Architecture of Memory: Why Physical Keepsakes Matter in a Digital Age',
  intendedReader: 'Culture enthusiasts, thoughtful shoppers, and mindful gift-givers',
  primaryKeyword: 'meaningful gifts',
  secondaryKeywords: 'tangible keepsakes, intentional gifting, memory objects',
  searchIntent: 'informational',
  tone: 'conversational-editorial',
  articleType: 'explainer',
  additionalInstructions: 'Include a historical perspective on Victorian keepsake traditions and the tactile psychology of touch.',
};

const DEFAULT_PRODUCT_COPY_OPTIONS: ProductCopyOptions = {
  productName: 'Celestial Atlas Hardcover Journal',
  productType: 'Archival Stationery / Hardcover Notebook',
  targetCustomer: 'Writers, stargazers, historians, and mindful note-takers',
  productConcept: 'Inspired by Galileo Galilei’s 1610 Sidereus Nuncius telescopic sketches of lunar craters and Jovian satellites.',
  keyFeatures: '160 pages of 120 GSM fountain pen-friendly paper\nDebossed metallic gold foil constellation charts\nSilk ribbon page marker & elastic closure band\nLay-flat smyth-sewn binding\nDimensions: 5.5 x 8.25 inches',
  tone: 'sophisticated-editorial',
  additionalInstructions: 'Highlight the tactile linen bookcloth cover and zero feathering with fountain pen ink.',
};

const DEFAULT_PRODUCT_DATA_OPTIONS: ProductDataOptions = {
  productUrl: 'https://scienceofgifts.com/products/galileo-moon-mug',
  productType: 'Mug',
  category: 'Astronomy & Stargazing',
  affiliateType: 'affiliate',
  priceMode: 'provided',
  providedPrice: '34.00',
  editorialPositioning: 'conversation-piece',
  editorialTone: 'standard',
  additionalInstructions: 'Focus on high-fired matte black ceramic construction and Galileo Galilei’s original 1610 lunar observations.',
  hasImage: false,
};

export default function App() {
  const [activeTool, setActiveTool] = useState<StudioToolId>('product-photography');

  // ==========================================
  // Tool 1: Product Photography State
  // ==========================================
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    size: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [imageSettings, setImageSettings] = useState<GenerationSettings>(DEFAULT_IMAGE_SETTINGS);
  const [imagePrompt, setImagePrompt] = useState<string>(() =>
    buildProductPhotoPrompt({
      ...DEFAULT_IMAGE_SETTINGS,
      hasReferenceImage: false,
    })
  );

  // ==========================================
  // Tool 2: Gift Guides State (Modular Section Prompt System)
  // ==========================================
  const [giftGuideState, setGiftGuideState] = useState<GiftGuideCompositeState>(DEFAULT_GIFT_GUIDE_STATE);
  const [giftGuidePrompt, setGiftGuidePrompt] = useState<string>(() =>
    generateGiftGuideSectionPrompt(DEFAULT_GIFT_GUIDE_STATE)
  );

  // ==========================================
  // Tool 3: Articles State
  // ==========================================
  const [articleOptions, setArticleOptions] = useState<ArticleOptions>(DEFAULT_ARTICLE_OPTIONS);
  const [articlePrompt, setArticlePrompt] = useState<string>(() =>
    generateArticlePrompt(DEFAULT_ARTICLE_OPTIONS)
  );

  // ==========================================
  // Tool 4: Standalone Product Copy State
  // ==========================================
  const [productCopyOptions, setProductCopyOptions] = useState<ProductCopyOptions>(DEFAULT_PRODUCT_COPY_OPTIONS);
  const [productCopyPrompt, setProductCopyPrompt] = useState<string>(() =>
    generateProductCopyPrompt(DEFAULT_PRODUCT_COPY_OPTIONS)
  );

  // ==========================================
  // Tool 5: Catalog Product Data State
  // ==========================================
  const [productDataOptions, setProductDataOptions] = useState<ProductDataOptions>(DEFAULT_PRODUCT_DATA_OPTIONS);
  const [productDataPrompt, setProductDataPrompt] = useState<string>(() =>
    generateProductDataPrompt(DEFAULT_PRODUCT_DATA_OPTIONS)
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
    // Regenerate active writing prompts using updated style rules
    setGiftGuidePrompt(generateGiftGuideSectionPrompt(giftGuideState));
    setArticlePrompt(generateArticlePrompt(articleOptions));
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
  };

  const handleTemplatesUpdated = () => {
    // Regenerate all 5 prompts using updated customizable templates
    setImagePrompt(
      buildProductPhotoPrompt({
        ...imageSettings,
        hasReferenceImage: Boolean(uploadedImage),
        referenceImageName: imageInfo?.name,
      })
    );
    setGiftGuidePrompt(generateGiftGuideSectionPrompt(giftGuideState));
    setArticlePrompt(generateArticlePrompt(articleOptions));
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
    setProductDataPrompt(
      generateProductDataPrompt({
        ...productDataOptions,
        hasImage: Boolean(uploadedImage),
        imageName: imageInfo?.name,
      })
    );
  };

  // Listen to custom style and template update events dispatched across the app
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
  }, [giftGuideState, articleOptions, productCopyOptions, productDataOptions, imageSettings, uploadedImage, imageInfo]);

  // ==========================================
  // Image Handlers
  // ==========================================
  const handleImageSelected = (
    dataUrl: string,
    info: { name: string; size: string; width?: number; height?: number }
  ) => {
    setUploadedImage(dataUrl);
    setImageInfo(info);
    const updated = buildProductPhotoPrompt({
      ...imageSettings,
      hasReferenceImage: true,
      referenceImageName: info.name,
    });
    setImagePrompt(updated);

    const updatedDataOptions: ProductDataOptions = {
      ...productDataOptions,
      hasImage: true,
      imageName: info.name,
    };
    setProductDataOptions(updatedDataOptions);
    setProductDataPrompt(generateProductDataPrompt(updatedDataOptions));
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setImageInfo(null);
    const updated = buildProductPhotoPrompt({
      ...imageSettings,
      hasReferenceImage: false,
    });
    setImagePrompt(updated);

    const updatedDataOptions: ProductDataOptions = {
      ...productDataOptions,
      hasImage: false,
      imageName: undefined,
    };
    setProductDataOptions(updatedDataOptions);
    setProductDataPrompt(generateProductDataPrompt(updatedDataOptions));
  };

  const handleApplySampleSettings = (sampleSettings: Partial<GenerationSettings>) => {
    const newSettings = {
      ...imageSettings,
      ...sampleSettings,
    };
    setImageSettings(newSettings);
    const updated = buildProductPhotoPrompt({
      ...newSettings,
      hasReferenceImage: Boolean(uploadedImage),
      referenceImageName: imageInfo?.name,
    });
    setImagePrompt(updated);
  };

  const handleGenerateImagePrompt = () => {
    const updated = buildProductPhotoPrompt({
      ...imageSettings,
      hasReferenceImage: Boolean(uploadedImage),
      referenceImageName: imageInfo?.name,
    });
    setImagePrompt(updated);
  };

  // ==========================================
  // Writing Handlers
  // ==========================================
  const handleGiftGuideStateChange = (newState: GiftGuideCompositeState) => {
    setGiftGuideState(newState);
    // If the section changed, automatically update the preview prompt
    if (newState.activeSection !== giftGuideState.activeSection) {
      setGiftGuidePrompt(generateGiftGuideSectionPrompt(newState));
    }
  };

  const handleGenerateGiftGuidePrompt = () => {
    setGiftGuidePrompt(generateGiftGuideSectionPrompt(giftGuideState));
  };

  const handleGenerateArticlePrompt = () => {
    setArticlePrompt(generateArticlePrompt(articleOptions));
  };

  const handleGenerateProductCopyPrompt = () => {
    setProductCopyPrompt(generateProductCopyPrompt(productCopyOptions));
  };

  const handleProductDataOptionsChange = (newOpts: ProductDataOptions) => {
    const optsWithImage = {
      ...newOpts,
      hasImage: Boolean(uploadedImage),
      imageName: imageInfo?.name,
    };
    setProductDataOptions(optsWithImage);
    setProductDataPrompt(generateProductDataPrompt(optsWithImage));
  };

  const handleGenerateProductDataPrompt = () => {
    const optsWithImage = {
      ...productDataOptions,
      hasImage: Boolean(uploadedImage),
      imageName: imageInfo?.name,
    };
    setProductDataPrompt(generateProductDataPrompt(optsWithImage));
  };

  // Active prompt configuration for right column view
  let currentPrompt = imagePrompt;
  let onCurrentPromptChange = setImagePrompt;
  let onCurrentClear = () => setImagePrompt('');
  let onCurrentRegenerate = handleGenerateImagePrompt;
  let currentToolTitle = 'Product Photo Prompt';
  let currentToolSubtitle = 'Ready to paste into Gemini / Midjourney / Flux';
  let currentActiveChips: ResultActiveChip[] = [];

  if (activeTool === 'gift-guide') {
    currentPrompt = giftGuidePrompt;
    onCurrentPromptChange = setGiftGuidePrompt;
    onCurrentClear = () => setGiftGuidePrompt('');
    onCurrentRegenerate = handleGenerateGiftGuidePrompt;

    const sectionTitles: Record<string, string> = {
      introduction: 'Guide Introduction Prompt',
      'product-copy': 'Guide Product Entry Prompt',
      'more-gifts': '"More Gifts" Section Prompt',
      'how-to-choose': '"How to Choose" Advice Prompt',
      faq: 'Guide FAQ Section Prompt',
      'title-meta': 'Guide Title & Meta Prompt',
    };

    currentToolTitle = sectionTitles[giftGuideState.activeSection] || 'Gift Guide Section Prompt';
    currentToolSubtitle = 'Ready to paste into Claude / ChatGPT / Gemini';

    currentActiveChips = [
      { label: 'Section', value: giftGuideState.activeSection.replace(/-/g, ' ') },
      { label: 'Guide', value: giftGuideState.guideTitle || 'Gift Guide' },
      { label: 'Recipient', value: giftGuideState.recipient || 'Curious Minds' },
    ];

    const sectionStyles: Record<string, string> = {
      introduction: 'Global + Editorial',
      'product-copy': 'Global + Copy',
      'more-gifts': 'Global + Editorial + Copy',
      'how-to-choose': 'Global + Editorial',
      faq: 'Global + Editorial',
      'title-meta': 'SEO Directives',
    };
    currentActiveChips.push({
      label: 'Style Rules',
      value: sectionStyles[giftGuideState.activeSection] || 'Global',
    });

    if (giftGuideState.activeSection === 'product-copy') {
      currentActiveChips.push({ label: 'Item', value: giftGuideState.productName || 'Featured Product' });
    } else if (giftGuideState.activeSection === 'more-gifts') {
      currentActiveChips.push({ label: 'Category', value: giftGuideState.moreGiftsSectionName || 'Sub-category' });
    }
  } else if (activeTool === 'article') {
    currentPrompt = articlePrompt;
    onCurrentPromptChange = setArticlePrompt;
    onCurrentClear = () => setArticlePrompt('');
    onCurrentRegenerate = handleGenerateArticlePrompt;
    currentToolTitle = 'Editorial Article Prompt';
    currentToolSubtitle = 'Ready to paste into Claude / ChatGPT / Gemini';
    currentActiveChips = [
      { label: 'Type', value: articleOptions.articleType },
      { label: 'Intent', value: articleOptions.searchIntent.replace(/-/g, ' ') },
      { label: 'Tone', value: articleOptions.tone.replace(/-/g, ' ') },
      { label: 'Style Rules', value: 'Global + Editorial' },
      { label: 'Keyword', value: articleOptions.primaryKeyword || 'Topical Authority' },
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
      { label: 'Tone', value: productCopyOptions.tone.replace(/-/g, ' ') },
      { label: 'Style Rules', value: 'Global + Copy' },
    ];
  } else if (activeTool === 'product-data') {
    currentPrompt = productDataPrompt;
    onCurrentPromptChange = setProductDataPrompt;
    onCurrentClear = () => setProductDataPrompt('');
    onCurrentRegenerate = handleGenerateProductDataPrompt;
    currentToolTitle = 'Product Data Catalog Record Prompt';
    currentToolSubtitle = 'Ready to paste into ChatGPT / Claude';
    currentActiveChips = [
      { label: 'Schema', value: 'Science of Gifts Product YAML' },
      { label: 'Type', value: productDataOptions.productType },
      { label: 'Category', value: productDataOptions.category },
      { label: 'Link Type', value: productDataOptions.affiliateType },
      {
        label: 'Price',
        value:
          productDataOptions.priceMode === 'provided'
            ? `$${productDataOptions.providedPrice || '0.00'}`
            : 'Extract from URL',
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">
      {/* Header */}
      <Navbar />

      {/* Main Category & Tool Navigation (Image: Product Photography | Writing: Gift Guides, Articles, Product Copy) */}
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
                  'Construct production-grade photography prompts that strictly preserve your product’s logos, artwork, proportions, and construction.'}
                {activeTool === 'gift-guide' &&
                  'Generate focused, modular prompts for individual sections of your self-authored gift guides: introduction, single-product entries, category spotlights, buyer advice, FAQs, and metadata.'}
                {activeTool === 'article' &&
                  'Produce thoughtful long-form magazine essays, explainer guides, and etiquette articles without robotic SEO filler.'}
                {activeTool === 'product-copy' &&
                  'Craft evocative, high-converting product page briefs celebrating craftsmanship, tactile materials, and honest storytelling.'}
                {activeTool === 'product-data' &&
                  'Generate factually accurate, structured Science of Gifts YAML catalog records and rich metadata for any product.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#475569]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-[#0f766e]" />
                  100% Local Browser Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7]" />
                  Zero API Keys or Subscriptions
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                  Modular Prompts for Any LLM
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
                      />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#334155]">
                        2. Editorial Staging & Environment
                      </h2>
                      <ConfigurationControls
                        settings={imageSettings}
                        onChange={setImageSettings}
                        onGenerate={handleGenerateImagePrompt}
                        hasImage={Boolean(uploadedImage)}
                      />
                    </div>
                  </>
                )}

                {/* 2. WRITING: GIFT GUIDES (MODULAR SECTIONS) */}
                {activeTool === 'gift-guide' && (
                  <GiftGuideControls
                    state={giftGuideState}
                    onChange={handleGiftGuideStateChange}
                    onGenerate={handleGenerateGiftGuidePrompt}
                    onOpenStyleLibrary={handleOpenStyleLibrary}
                  />
                )}

                {/* 3. WRITING: ARTICLES */}
                {activeTool === 'article' && (
                  <ArticleControls
                    options={articleOptions}
                    onChange={setArticleOptions}
                    onGenerate={handleGenerateArticlePrompt}
                    onOpenStyleLibrary={() => handleOpenStyleLibrary('editorial')}
                  />
                )}

                {/* 4. WRITING: PRODUCT COPY (STANDALONE) */}
                {activeTool === 'product-copy' && (
                  <ProductCopyControls
                    options={productCopyOptions}
                    onChange={setProductCopyOptions}
                    onGenerate={handleGenerateProductCopyPrompt}
                    onOpenStyleLibrary={() => handleOpenStyleLibrary('copy')}
                  />
                )}

                {/* 5. WRITING: PRODUCT DATA (CATALOG RECORD) */}
                {activeTool === 'product-data' && (
                  <ProductDataControls
                    options={productDataOptions}
                    onChange={handleProductDataOptionsChange}
                    onGenerate={handleGenerateProductDataPrompt}
                    uploadedImage={uploadedImage}
                    imageInfo={imageInfo}
                    onImageSelected={handleImageSelected}
                    onClearImage={handleClearImage}
                  />
                )}
              </div>

              {/* RIGHT COLUMN: Generated Prompt View (6 cols on lg) */}
              <div className="lg:col-span-6 space-y-6 sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center justify-between">
                  <span>{currentToolTitle}</span>
                  <span className="text-[11px] text-[#64748b]">Ready to copy</span>
                </h2>

                <PromptResultView
                  prompt={currentPrompt}
                  onPromptChange={onCurrentPromptChange}
                  onClear={onCurrentClear}
                  onRegenerate={onCurrentRegenerate}
                  toolTitle={currentToolTitle}
                  toolSubtitle={currentToolSubtitle}
                  referenceImage={activeTool === 'product-photography' ? uploadedImage : null}
                  imageInfo={activeTool === 'product-photography' ? imageInfo : null}
                  settings={activeTool === 'product-photography' ? imageSettings : undefined}
                  activeChips={activeTool !== 'product-photography' ? currentActiveChips : undefined}
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
            Product Photography & Editorial Writing Prompt Studio • 100% Local Browser Engine • No APIs
          </p>
        </div>
      </footer>
    </div>
  );
}
