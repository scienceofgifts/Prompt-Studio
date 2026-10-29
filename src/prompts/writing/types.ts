export type StudioCategory = 'image' | 'writing' | 'settings';

export type StudioToolId =
  | 'product-photography'
  | 'gift-guide-hero'
  | 'product-copy'
  | 'settings';

// ==========================================
// Product Copy Types & Reusable Product Profiles
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
  occasion?: string;
  personalization?: string;
  productConcept: string;
  keyFeatures: string;
  materials?: string;
  dimensions?: string;
  tone: ProductCopyTone;
  additionalInstructions?: string;
}

export interface ProductProfile {
  id: string;
  name: string;
  productType: string;
  productConcept: string;
  keyFeatures: string;
  materials: string;
  dimensions: string;
  updatedAt: string;
}
