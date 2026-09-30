export type ProductType =
  | 'mug'
  | 'tshirt'
  | 'hoodie'
  | 'notebook'
  | 'glass'
  | 'waterBottle'
  | 'tumbler'
  | 'poster'
  | 'other';

export type ProductOrientation =
  | 'upright'
  | 'folded'
  | 'flat-lay'
  | 'naturally-arranged';

export type BackgroundStyle =
  | 'neutral-editorial'
  | 'science-gradient'
  | 'gradient-wall-neutral-surface'
  | 'blue-wall-neutral-surface'
  | 'mint-wall-neutral-surface'
  | 'branded-editorial-environment'
  | 'dark-editorial'
  | 'custom';

export type SurfaceStyle =
  | 'editorial-tabletop'
  | 'light-stone'
  | 'dark-matte'
  | 'soft-fabric'
  | 'no-visible-surface';

export type PropsStyle =
  | 'none'
  | 'minimal-subtle'
  | 'subtle-historical'
  | 'books-ephemera'
  | 'seasonal-subtle';

export type AspectRatio = '1:1' | '4:5' | '3:2' | '16:9';

export interface PromptOptions {
  productType: ProductType;
  customProductType?: string;
  orientation: ProductOrientation;
  background: BackgroundStyle;
  surface: SurfaceStyle;
  props: PropsStyle;
  aspectRatio: AspectRatio;
  additionalInstructions?: string;
  hasReferenceImage?: boolean;
  referenceImageName?: string;
}

// Alias for backwards compatibility
export type PromptTemplateContext = PromptOptions;

export interface ProductImagePromptTemplate {
  productType: ProductType;
  displayName: string;
  uiGuidance: string;
  generatePrompt: (options: PromptOptions) => string;
}
