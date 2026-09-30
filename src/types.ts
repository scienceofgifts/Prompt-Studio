import {
  ProductType,
  ProductOrientation,
  BackgroundStyle,
  SurfaceStyle,
  PropsStyle,
  AspectRatio,
  PromptTemplateContext,
} from './prompts/types';

export * from './prompts/types';
export * from './prompts/image';
export * from './prompts/writing';

export interface GenerationSettings {
  productType: ProductType;
  customProductType?: string;
  orientation: ProductOrientation;
  background: BackgroundStyle;
  surface: SurfaceStyle;
  props: PropsStyle;
  aspectRatio: AspectRatio;
  additionalInstructions: string;
}

export interface SampleProduct {
  id: string;
  title: string;
  category: ProductType;
  description: string;
  imageUrl: string;
  recommendedSettings: Partial<GenerationSettings>;
}
