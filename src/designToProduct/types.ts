export type MerchandiseCategory =
  | 'apparel'
  | 'drinkware'
  | 'paper-wall-art'
  | 'desk-accessories'
  | 'other';

export type MerchandiseDefaultBackground =
  | 'transparent'
  | 'full-background'
  | 'context-dependent';

export interface MerchandiseProductProfile {
  id: string;
  name: string;
  category: MerchandiseCategory;
  typicalOrientation: 'vertical' | 'square' | 'horizontal' | 'flexible';
  preferredComposition: string;
  defaultBackgroundTreatment: MerchandiseDefaultBackground;
  printSurfaceCharacteristics: string;
  supportedProductColors: string[];
  printingMethod: string;
  colorAndContrastConsiderations: string;
  recommendedDesignAdjustments: string;
  exactPrintSpecifications?: string;
  additionalInstructions?: string;
  isBuiltIn?: boolean;
  isCustom?: boolean;
}

export type DesignCompositionType =
  | 'badge'
  | 'logo'
  | 'illustration'
  | 'pattern'
  | 'slogan'
  | 'poster'
  | 'emblem'
  | 'infographic'
  | 'typography'
  | 'other';

export type DesignAspectProfile =
  | 'portrait'
  | 'square'
  | 'landscape'
  | 'wide-panoramic';

export type DesignCurrentBackground =
  | 'transparent-clean'
  | 'solid-light'
  | 'solid-dark'
  | 'textured-or-patterned'
  | 'full-scene-illustration'
  | 'unknown';

export interface SemanticProductFit {
  productId: string;
  reason: string;
  conceptFitScore: number;
  visualFitScore: number;
}

export interface DesignAnalysisResult {
  // Design concept
  conceptSummary: string;
  themeOrTopic: string;
  intendedAudience: string;
  visualIdentity: string;
  compositionType: DesignCompositionType;

  // Visual composition
  aspectProfile: DesignAspectProfile;
  elementDistribution: string;
  typographyStyle: string;
  textDensity: 'none' | 'low' | 'medium' | 'high';
  exactVisibleText: string;
  importantElements: string[];
  dominantColors: string[];
  supportingColors: string[];
  currentBackground: DesignCurrentBackground;
  detailLevel: 'minimal' | 'moderate' | 'intricate';
  suitableForSmallPrint: boolean;
  expandableToWideOrFullBleed: boolean;

  // Production considerations
  readabilityNotes: string;
  worksWithoutModification: boolean;
  prefersTransparentBackground: boolean;
  contrastRiskNotes: string;
  recommendedDefaultProductColor: string;
  elementsToPreserve: string[];

  // Initial AI semantic product fits
  suggestedProductFits: SemanticProductFit[];
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  category: MerchandiseCategory;
  score: number;
  reason: string;
  adaptationEffort: 'minimal' | 'moderate' | 'tailored';
}

export interface ProductRecommendationSet {
  primary: ProductRecommendation;
  alternatives: [ProductRecommendation, ProductRecommendation] | ProductRecommendation[];
  allRanked: ProductRecommendation[];
}

export type BackgroundTreatmentOption =
  | 'ai-decides'
  | 'transparent'
  | 'full-background';

export type ColorTreatmentOption =
  | 'ai-decides'
  | 'preserve-original'
  | 'adapt-for-product';

export interface DesignAdaptationOptions {
  selectedProductId: string;
  backgroundTreatment: BackgroundTreatmentOption;
  colorTreatment: ColorTreatmentOption;
  productColor: string;
  customNotes?: string;
}

export interface ResolvedBackgroundDecision {
  mode: 'transparent' | 'full-background';
  source: 'user-override' | 'ai-decision';
  rationale: string;
}

export interface ResolvedColorDecision {
  mode: 'preserve-original' | 'targeted-adaptation';
  source: 'user-override' | 'ai-decision';
  targetProductColor: string;
  requiresInkVerification: boolean;
  rationale: string;
  adjustments: string[];
}

export type DesignItemStatus = 'queued' | 'analyzing' | 'ready' | 'failed';

export interface DesignWorkspaceItem {
  id: string;
  fingerprint: string;
  fileName: string;
  fileSize: string;
  width?: number;
  height?: number;
  previewDataUrl?: string;
  status: DesignItemStatus;
  errorMessage?: string;
  modelUsed?: string;
  fromCache?: boolean;
  analysis: DesignAnalysisResult | null;
  recommendations: ProductRecommendationSet | null;
  options: DesignAdaptationOptions;
  createdAt: number;
}
