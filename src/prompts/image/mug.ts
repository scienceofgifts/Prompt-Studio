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

function getMugOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'upright':
      return 'Orientation: Standing upright on its base at a dignified eye-level perspective (15-degree slight downward tilt), showcasing the frontal printed artwork and handle profile clearly.';
    case 'flat-lay':
      return 'Orientation: Overhead flat-lay composition, captured from a direct 90-degree bird’s-eye perspective, accentuating the circular rim geometry and top opening with balanced negative space.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged at a 30-degree quarter-turn angle, allowing both the primary printed artwork and the sculpted contour of the handle to be viewed in harmonious balance.';
    case 'folded':
    default:
      return 'Orientation: Upright presentation angled to showcase the printed graphic design in optimal editorial light.';
  }
}

/**
 * Builds the complete photography prompt for Ceramic Mugs.
 * Edit this template to adjust wording, lighting styles, or product directives.
 */
export function generateMugPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getMugOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Do not add handles, lids, spoons, coasters, saucers, tea bags, or steam unless explicitly requested',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical ceramic mug itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium ceramic mug featuring the exact graphic artwork, typography, colors, and physical silhouette from the reference product.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT PHYSICAL FORM: Maintain the precise cylindrical proportions, outer diameter, wall thickness, rim profile, and base curve from the reference image.
• HANDLE ACCURACY: Faithfully preserve the exact shape, attachment points, and curve of the handle. Do NOT invent a different handle style, and do NOT add handles if none exist in the reference.
• PRESERVE ARTWORK & TYPOGRAPHY: All printed graphics, illustrations, scientific equations, lettering, logos, and brand marks must be reproduced with exact scale, placement, crisp typography, and precise color registration.
• NO UNINVITED ACCESSORIES: Do NOT add lids, spoons, coasters, saucers, tea bags, or steam unless explicitly requested.
• GLAZE & FINISH: Render authentic semi-gloss or matte ceramic glaze with natural, soft specular highlights and subtle reflections without cartoonish plastic sheen.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: High-fired stoneware ceramic with authentic micro-texture, gentle light falloff across the curved cylinder, and soft contact ambient occlusion where the base touches the surface.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const mugPromptTemplate: ProductImagePromptTemplate = {
  productType: 'mug',
  displayName: 'Mug',
  uiGuidance: 'Preserves cylindrical form, rim contour, handle curvature, and printed artwork. Forbids extra handles or lids.',
  generatePrompt: generateMugPrompt,
};
