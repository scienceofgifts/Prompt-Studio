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

function getOtherOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'upright':
      return 'Orientation: Standing upright on its base at an eye-level / 15-degree studio perspective, presenting its primary face with dignity and clarity.';
    case 'flat-lay':
      return 'Orientation: Overhead 90-degree flat-lay composition, laid flat on the surface with balanced negative space around all sides.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged in an organic editorial staging position, showing depth, authentic materials, and dimensional form.';
    case 'folded':
      return 'Orientation: Neatly arranged or folded according to the item’s natural construction, highlighting signature details and craftsmanship.';
    default:
      return 'Orientation: Upright hero staging in balanced editorial lighting.';
  }
}

/**
 * Builds the complete photography prompt for Custom / Specialty Boutique Products.
 * Edit this template to adjust fallback product directives or general editorial rules.
 */
export function generateOtherPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getOtherOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions();
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  const customLabel = options.customProductType?.trim() || 'specialty boutique product';

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical product itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium ${customLabel} faithfully reproducing the exact physical construction, materials, colors, logos, and artwork from the reference image.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT PHYSICAL IDENTITY: The reference product is the definitive source of truth. Preserve the exact physical shape, proportions, dimensions, geometry, and structural construction.
• PRESERVE ARTWORK & BRANDING: All printed artwork, logos, typography, graphics, surface textures, and color values must be reproduced with absolute fidelity without redesign or artistic reinterpretation.
• ZERO REDESIGN: Do not alter the form factor, do not invent extra features, buttons, handles, or decorative accoutrements not present on the actual physical product.
• AUTHENTIC MATERIAL TEXTURE: Accurately render the natural physical material (wood, metal, ceramic, leather, paper, textile, or resin) with genuine tactile fidelity and appropriate light interaction.
• RESTRAINED EDITORIAL CONTEXT: The product must remain the absolute focal hero of the photograph, supported by clean negative space and natural shadows.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Authentic tactile material finish with realistic light absorption and specular highlights, grounded by natural contact shadows and subtle ambient occlusion.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const otherPromptTemplate: ProductImagePromptTemplate = {
  productType: 'other',
  displayName: 'Other',
  uiGuidance: 'Treats uploaded product as the definitive source of truth. Zero redesign of artwork, logos, or construction.',
  generatePrompt: generateOtherPrompt,
};
