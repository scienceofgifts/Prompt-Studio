export type GeneratorId =
  | 'photography'
  | 'giftGuides'
  | 'articles'
  | 'productCopy'
  | 'productData';

export interface TemplateSectionMetadata {
  id: string;
  label: string;
  description: string;
  category: GeneratorId;
}

export interface GeneratorTemplateConfig {
  id: GeneratorId;
  label: string;
  description: string;
  iconName: string;
  sections: Record<string, string>;
  metadata: Record<string, TemplateSectionMetadata>;
}
