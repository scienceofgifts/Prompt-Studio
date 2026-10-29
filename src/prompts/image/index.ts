import { ProductType, ProductImagePromptTemplate, PromptOptions } from '../types';
import { mugPromptTemplate, generateMugPrompt } from './mug';
import { tshirtPromptTemplate, generateTshirtPrompt } from './tshirt';
import { sweatshirtPromptTemplate, generateSweatshirtPrompt } from './sweatshirt';
import { hoodiePromptTemplate, generateHoodiePrompt } from './hoodie';
import { notebookPromptTemplate, generateNotebookPrompt } from './notebook';
import { glassPromptTemplate, generateGlassPrompt } from './glass';
import { waterBottlePromptTemplate, generateWaterBottlePrompt } from './waterBottle';
import { tumblerPromptTemplate, generateTumblerPrompt } from './tumbler';
import { posterPromptTemplate, generatePosterPrompt } from './poster';
import { otherPromptTemplate, generateOtherPrompt } from './other';
import { buildChatGPTPhotoPrompt, buildGeminiPhotoPrompt } from '../shared/modelFormatters';

export * from './clothing';
export * from './giftGuideHero';

export const imagePromptTemplates: Record<ProductType, ProductImagePromptTemplate> = {
  mug: mugPromptTemplate,
  tshirt: tshirtPromptTemplate,
  sweatshirt: sweatshirtPromptTemplate,
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
  return template.generatePrompt(options);
}

// Backwards-compatible alias
export const buildProductPhotoPrompt = buildImagePrompt;

export {
  buildChatGPTPhotoPrompt,
  buildGeminiPhotoPrompt,
  mugPromptTemplate,
  generateMugPrompt,
  tshirtPromptTemplate,
  generateTshirtPrompt,
  sweatshirtPromptTemplate,
  generateSweatshirtPrompt,
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
