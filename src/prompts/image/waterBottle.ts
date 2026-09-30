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

function getWaterBottleOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'upright':
      return 'Orientation: Standing tall and upright on its base at an eye-level hero perspective, highlighting the full vertical profile, sleek cap finish, and frontal artwork.';
    case 'naturally-arranged':
      return 'Orientation: Angled naturally at a 20-degree tilt in an editorial studio setup, casting a long soft shadow and catching a continuous specular highlight along the bottle shoulder.';
    case 'flat-lay':
      return 'Orientation: Overhead flat-lay alignment resting horizontally on the staging surface, parallel to the composition axis with balanced negative space.';
    case 'folded':
    default:
      return 'Orientation: Upright presentation showcasing the primary branded artwork and cap craftsmanship.';
  }
}

/**
 * Builds the complete photography prompt for Water Bottles and Flasks.
 * Edit this template to adjust metal finishes, cap textures, or laser etchings.
 */
export function generateWaterBottlePrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getWaterBottleOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Do not add climbing clips, carabiners, gym gear, artificial water splashes, or condensation drops unless explicitly requested',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical water bottle / insulated flask itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium reusable water bottle / insulated flask faithfully reproducing the exact metallic silhouette, cap construction, and printed or laser-etched artwork from the reference product.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT PHYSICAL FORM: Preserve the exact bottle proportions, cylindrical taper, shoulder radius, neck geometry, and base bevel from the reference image.
• CAP & LID MECHANISM: Faithfully retain the specific lid construction (screw cap, wooden inlay, stainless steel carry loop, or sports spout) exactly as shown without inventing alternative closures.
• PRESERVE PRINTED & ETCHED ARTWORK: Replicate all laser-etched equations, diagrams, screen-printed illustrations, brand logos, and capacity markings with precise scale, alignment, and crisp definition.
• ACCURATE MATERIAL FINISH: Accurately render the surface texture—whether matte powder-coated, brushed stainless steel, anodized aluminum, or satin finish—with authentic light diffusion.
• NO RANDOM OUTDOOR GEAR: Do not add climbing clips, gym bags, carabiners, or droplets unless explicitly requested in props.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: 18/8 food-grade stainless steel with powder-coat micro-texture or brushed metal grain, illuminated by a large diffused softbox creating a smooth vertical gradient highlight along the bottle curvature.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const waterBottlePromptTemplate: ProductImagePromptTemplate = {
  productType: 'waterBottle',
  displayName: 'Water bottle',
  uiGuidance: 'Preserves bottle shape, lid construction, material finish, and laser-etched or screen-printed graphics.',
  generatePrompt: generateWaterBottlePrompt,
};
