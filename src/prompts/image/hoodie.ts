import { PromptOptions, ProductImagePromptTemplate } from '../types';
import { generateClothingPrompt } from './clothing';

export function generateHoodiePrompt(options: PromptOptions): string {
  return generateClothingPrompt(
    { ...options, productType: 'hoodie' },
    {
      productTypeName: 'Apparel / Hoodie',
      productDescription:
        'A premium hooded sweatshirt displaying the exact fleece construction, hood architecture, kangaroo pocket, drawstrings, and printed artwork from the reference garment.',
      garmentSpecificDirectives: [
        'PRESERVE HOODIE CONSTRUCTION: Preserve the exact double-layer hood shape, drawstring cords and eyelet grommets (where present on the reference), kangaroo pouch pocket, wide ribbed cuffs, and ribbed hem waistband.',
        'ACCURATE HEAVYWEIGHT FLEECE: Depict substantial 400+ GSM heavyweight French terry or brushed fleece, showing tactile substance and rich matte fabric density.',
        'NATURAL HOOD DRAPE: Keep the hood resting in an organic, deliberate editorial shape without looking crumpled, flattened, or rigid.',
      ],
    }
  );
}

export const hoodiePromptTemplate: ProductImagePromptTemplate = {
  productType: 'hoodie',
  displayName: 'Hoodie',
  uiGuidance:
    'Preserves fleece weight, hood drape, drawstrings, kangaroo pocket, and printed/embroidered graphics.',
  generatePrompt: generateHoodiePrompt,
};
