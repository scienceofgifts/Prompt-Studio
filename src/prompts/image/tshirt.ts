import { PromptOptions, ProductImagePromptTemplate } from '../types';
import { generateClothingPrompt } from './clothing';

export function generateTshirtPrompt(options: PromptOptions): string {
  return generateClothingPrompt(
    { ...options, productType: 'tshirt' },
    {
      productTypeName: 'Apparel / T-shirt',
      productDescription:
        'A premium apparel T-shirt faithfully showcasing the exact fabric tone, neckline construction, and printed graphic artwork from the reference garment.',
      garmentSpecificDirectives: [
        'PRESERVE T-SHIRT CONSTRUCTION & FABRIC: Retain the authentic T-shirt silhouette, ring-spun combed cotton jersey knit texture, ribbed crewneck or v-neck collar band, shoulder taping, and twin-needle sleeve and bottom hem stitching.',
        'AUTHENTIC JERSEY WEIGHT & DRAPE: Render genuine midweight cotton jersey texture, soft natural drape, and believable textile ambient shadows.',
      ],
    }
  );
}

export const tshirtPromptTemplate: ProductImagePromptTemplate = {
  productType: 'tshirt',
  displayName: 'T-shirt',
  uiGuidance:
    'Preserves actual T-shirt silhouette, cotton jersey weave, collar ribbing, color, and printed artwork without warping.',
  generatePrompt: generateTshirtPrompt,
};
