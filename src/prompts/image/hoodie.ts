import {
  PromptOptions,
  ProductImagePromptTemplate,
  ProductOrientation,
} from '../types';
import {
  getBackgroundPromptText,
  getSurfacePromptText,
  getPropsPromptText,
  formatReferenceHeader,
  formatTechnicalSettings,
  formatNegativeExclusions,
  formatAdditionalInstructions,
} from '../shared/options';

function getHoodieOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'folded':
      return 'Orientation: Expertly folded in a high-end editorial knitwear presentation—sleeves neatly tucked, hood softly framed around the top, and the central chest artwork fully legible.';
    case 'flat-lay':
      return 'Orientation: Overhead flat-lay arrangement shot from 90 degrees above, displaying balanced symmetry across the shoulders, pocket, and chest artwork.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged with relaxed, organic styling—gentle textile ripples, relaxed sleeves with soft wrist folds, and hood resting organically.';
    case 'upright':
    default:
      return 'Orientation: Upright presentation with natural body and authentic fabric drape, highlighting chest artwork and pocket construction.';
  }
}

/**
 * Builds the complete photography prompt for Hoodies.
 * Edit this template to adjust fleece texture, hood geometry, or pocket construction.
 */
export function generateHoodiePrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getHoodieOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Exclude human models, headless mannequins, and plastic hangers',
    'Do not flatten or crumple the hood into an unnatural lump',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical hooded sweatshirt itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium hooded sweatshirt displaying the exact fleece construction, hood architecture, kangaroo pocket, and printed artwork from the reference garment.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE GARMENT CONSTRUCTION: Preserve the exact double-layer hood shape, drawstring cords and eyelet grommets, kangaroo pouch pocket, wide ribbed cuffs, and hem waistband.
• PRESERVE PRINTED ARTWORK & GRAPHICS: Faithfully retain the graphic design, typography, brand emblems, or chest/back print from the reference image with authentic scale, font sharpness, and color accuracy.
• ACCURATE FABRIC WEIGHT: Depict substantial 400+ GSM heavyweight french terry or brushed fleece, showing tactile substance and rich matte fabric density.
• NATURAL HOOD DRAPE: Keep the hood softly resting in an organic, deliberate editorial shape behind the neck without looking crumpled or rigid.
• EXCLUDE HUMAN MODELS & MANNEQUINS: Render the hoodie strictly as a standalone styled product without human models, phantom necks, or artificial props.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Rich brushed-fleece cotton blend with visible weave micro-texture, diffused studio raking light across soft textile peaks, and deep, gentle ambient shadows in folds.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const hoodiePromptTemplate: ProductImagePromptTemplate = {
  productType: 'hoodie',
  displayName: 'Hoodie',
  uiGuidance: 'Preserves fleece weight, hood drape, drawstrings, kangaroo pocket, and printed/embroidered graphics.',
  generatePrompt: generateHoodiePrompt,
};
