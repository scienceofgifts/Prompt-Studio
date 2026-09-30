import { ProductType, ProductImagePromptTemplate, PromptOptions } from '../types';
import { getCreativeVariationDirectives } from '../shared/options';
import { mugPromptTemplate, generateMugPrompt } from './mug';
import { tshirtPromptTemplate, generateTshirtPrompt } from './tshirt';
import { hoodiePromptTemplate, generateHoodiePrompt } from './hoodie';
import { notebookPromptTemplate, generateNotebookPrompt } from './notebook';
import { glassPromptTemplate, generateGlassPrompt } from './glass';
import { waterBottlePromptTemplate, generateWaterBottlePrompt } from './waterBottle';
import { tumblerPromptTemplate, generateTumblerPrompt } from './tumbler';
import { posterPromptTemplate, generatePosterPrompt } from './poster';
import { otherPromptTemplate, generateOtherPrompt } from './other';

export const imagePromptTemplates: Record<ProductType, ProductImagePromptTemplate> = {
  mug: mugPromptTemplate,
  tshirt: tshirtPromptTemplate,
  hoodie: hoodiePromptTemplate,
  notebook: notebookPromptTemplate,
  glass: glassPromptTemplate,
  waterBottle: waterBottlePromptTemplate,
  tumbler: tumblerPromptTemplate,
  poster: posterPromptTemplate,
  other: otherPromptTemplate,
};

/**
 * Builds the complete photography prompt according to the selected product type and options.
 */
export function buildImagePrompt(options: PromptOptions): string {
  const template = imagePromptTemplates[options.productType] || imagePromptTemplates.other;
  const basePrompt = template.generatePrompt(options);

  if (!basePrompt.includes('FRAMEWORK FOR CONTROLLED CREATIVE VARIATION')) {
    const variation = getCreativeVariationDirectives();
    // Insert variation section right before TECHNICAL & CAMERA SETTINGS if present, or before final output requirement
    if (basePrompt.includes('TECHNICAL & CAMERA SETTINGS:')) {
      return basePrompt.replace(
        'TECHNICAL & CAMERA SETTINGS:',
        `${variation}\n\nTECHNICAL & CAMERA SETTINGS:`
      );
    }
    return `${basePrompt}\n\n${variation}`;
  }

  return basePrompt;
}

// Backwards-compatible alias
export const buildProductPhotoPrompt = buildImagePrompt;

export {
  mugPromptTemplate,
  generateMugPrompt,
  tshirtPromptTemplate,
  generateTshirtPrompt,
  hoodiePromptTemplate,
  generateHoodiePrompt,
  notebookPromptTemplate,
  generateNotebookPrompt,
  glassPromptTemplate,
  generateGlassPrompt,
  waterBottlePromptTemplate,
  generateWaterBottlePrompt,
  tumblerPromptTemplate,
  generateTumblerPrompt,
  posterPromptTemplate,
  generatePosterPrompt,
  otherPromptTemplate,
  generateOtherPrompt,
};
