import { PromptOptions, ProductImagePromptTemplate } from '../types';
import { generateClothingPrompt } from './clothing';

export function generateSweatshirtPrompt(options: PromptOptions): string {
  return generateClothingPrompt(
    { ...options, productType: 'sweatshirt' },
    {
      productTypeName: 'Apparel / Sweatshirt',
      productDescription:
        'A premium crewneck sweatshirt faithfully showcasing the exact heavyweight fleece or French terry texture, ribbed collar, cuffs, waistband, and printed graphic artwork from the reference garment.',
      garmentSpecificDirectives: [
        'PRESERVE SWEATSHIRT CONSTRUCTION & FABRIC: Retain the authentic crewneck sweatshirt silhouette, ribbed crewneck collar band (without adding a hood or drawstrings), wide ribbed wrist cuffs, ribbed hem waistband, and shoulder/sleeve seam construction.',
        'AUTHENTIC FLEECE WEIGHT & TEXTURE: Render substantial mid-to-heavyweight brushed fleece or French terry fabric density, rich matte surface weave, and natural dimensional folds.',
      ],
    }
  );
}

export const sweatshirtPromptTemplate: ProductImagePromptTemplate = {
  productType: 'sweatshirt',
  displayName: 'Sweatshirt',
  uiGuidance:
    'Preserves crewneck sweatshirt fleece weight, ribbed collar, cuffs, hem waistband, and exact printed/embroidered graphics.',
  generatePrompt: generateSweatshirtPrompt,
};
