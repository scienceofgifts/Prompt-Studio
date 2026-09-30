import { InternalLink } from '../../utils/internalLinks';
export type { InternalLink };

export type StudioCategory = 'image' | 'writing';

export type StudioToolId =
  | 'product-photography'
  | 'gift-guide'
  | 'article'
  | 'product-copy';

export * from './giftGuides/types';

// ==========================================
// 1. Article Types & Workflow
// ==========================================
export type ArticleType =
  | 'informational'
  | 'how-to'
  | 'explainer'
  | 'advice'
  | 'etiquette'
  | 'problem-solving';

export type ArticleTone =
  | 'conversational-editorial'
  | 'warm-helpful'
  | 'witty-refined'
  | 'practical'
  | 'informational'
  | 'authoritative';

export type ArticleSearchIntent =
  | 'informational'
  | 'commercial-investigation'
  | 'how-to-guide'
  | 'inspiration-ideas';

export type ArticleWorkflowTab =
  | 'research-angles'
  | 'research-outline'
  | 'writing-article'
  | 'editing-humanize'
  | 'editing-tighten';

export interface ArticleOptions {
  activeWorkflowTab?: ArticleWorkflowTab;
  topic: string;
  intendedReader: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  searchIntent: ArticleSearchIntent;
  tone: ArticleTone;
  articleType: ArticleType;
  // Research Section Inputs
  researchAngleInput?: string;
  // Writing Section Optional Inputs
  articleAngle?: string;
  articleOutline?: string;
  // Editing Section Inputs
  draftToEdit?: string;
  // Optional Internal Links
  internalLinks?: InternalLink[];
  additionalInstructions?: string;
}

// ==========================================
// 2. Product Copy Types (Standalone Product Page Copy)
// ==========================================
export type ProductCopyTone =
  | 'sophisticated-editorial'
  | 'warm-approachable'
  | 'playfully-cerebral'
  | 'minimalist-luxury'
  | 'practical-informative';

export interface ProductCopyOptions {
  productName: string;
  productType: string;
  targetCustomer: string;
  productConcept: string;
  keyFeatures: string;
  tone: ProductCopyTone;
  internalLinks?: InternalLink[];
  additionalInstructions?: string;
}
