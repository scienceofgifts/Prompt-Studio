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

function getTumblerOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'upright':
      return 'Orientation: Standing upright at a slight 15-degree downward angle, revealing both the frontal printed artwork and the clean architectural contour of the transparent lid.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged at a subtle three-quarter angle, catching soft ambient light across the cylindrical taper and metallic lip ring.';
    case 'flat-lay':
      return 'Orientation: Top-down flat-lay or high-angle product layout resting on the surface with balanced editorial spacing.';
    case 'folded':
    default:
      return 'Orientation: Upright presentation with crisp focus on the tumbler artwork and lid construction.';
  }
}

/**
 * Builds the complete photography prompt for Travel Tumblers.
 * Edit this template to adjust lid structures, taper silhouettes, or laser engraving.
 */
export function generateTumblerPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getTumblerOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Do not add loose plastic straws, coffee spills, liquid puddles, or steam unless explicitly requested',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical travel tumbler itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium travel tumbler or insulated beverage tumbler faithfully reproducing the conical/cylindrical taper, splash-proof lid, and printed artwork from the reference image.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT PHYSICAL FORM: Preserve the specific taper, cup-holder compatible base, upper diameter, and rim lip geometry from the reference tumbler.
• LID & DRINKING SPOUT ACCURACY: Accurately reproduce the clear Tritan or acrylic press-in lid, magnetic slider, sipping aperture, and silicone gasket ring without inventing different lid models.
• PRESERVE PRINTED & ENGRAVED ARTWORK: Faithfully maintain the scale, color, typography, fine line weights, and placement of all printed graphics, logos, and scientific diagrams.
• AUTHENTIC FINISH: Accurately depict the exterior finish—whether durable powder-coat texture, smooth semi-gloss enamel, or raw brushed stainless steel.
• NO UNINVITED STRAWS OR SPILLS: Do not add loose straws, coffee spills, or steam unless explicitly requested.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Double-walled vacuum insulated steel body with tactile powder-coat finish, crystal-clear acrylic lid with subtle internal light refraction, and soft ambient ground shadow.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const tumblerPromptTemplate: ProductImagePromptTemplate = {
  productType: 'tumbler',
  displayName: 'Tumbler',
  uiGuidance: 'Preserves conical taper, splash-proof lid structure, drinking spout, and printed/engraved artwork.',
  generatePrompt: generateTumblerPrompt,
};
