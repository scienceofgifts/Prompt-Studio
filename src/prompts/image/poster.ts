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

function getPosterOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'flat-lay':
      return 'Orientation: Overhead 90-degree flat-lay, lying flat and square to the camera with generous negative space framing all four outer margins evenly.';
    case 'upright':
      return 'Orientation: Standing upright against the backdrop or lightly propped in a subtle architectural lean, catching gentle raking light across the archival paper texture.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged at a soft 15-degree angle resting on the editorial surface, with gentle natural paper weight and subtle contact shadows.';
    case 'folded':
    default:
      return 'Orientation: Planar flat presentation highlighting crisp typographic details and balanced margins.';
  }
}

/**
 * Builds the complete photography prompt for Art Posters and Prints.
 * Edit this template to adjust paper textures, cotton rag grain, or gallery lighting.
 */
export function generatePosterPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getPosterOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Do not crop out margins, do not alter poster fonts, and do not invent new decorative borders',
    'No artificial paper tears, bent dog-eared corners, or distracting binder clips unless explicitly requested',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical art poster / print itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A fine art poster or archival scientific print faithfully reproducing the entire graphic layout, typography, borders, illustrations, and paper craftsmanship from the reference image.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE COMPLETE ARTWORK & LAYOUT: Faithfully retain the entire composition, margins, borders, typography, diagrams, star charts, scientific annotations, and color palette from the reference poster.
• NO ARBITRARY CROPPING OR REDESIGN: Do not crop out edges, do not alter fonts, do not re-draw illustrations, and do not introduce new text or decorative elements.
• AUTHENTIC PAPER TEXTURE & WEIGHT: Depict heavyweight 310 GSM archival cotton rag, matte velvet fine-art paper, or smooth museum-grade stock with subtle natural paper tooth and realistic tactile presence.
• EDGE FIDELITY: Show crisp, clean paper edges without artificial tears, creases, or curling unless explicitly requested.
• PRESENTATION PURITY: Display either cleanly resting flat on the staging surface or in a minimal thin gallery frame (if requested), avoiding distracting clips or oversized furniture.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Archival matte cotton rag paper with subtle fiber texture, illuminated with even, diffused cross-polarized studio lighting to eliminate glare while preserving deep ink saturation.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const posterPromptTemplate: ProductImagePromptTemplate = {
  productType: 'poster',
  displayName: 'Poster',
  uiGuidance: 'Preserves complete poster layout, margins, typography, and paper texture with authentic paper weight.',
  generatePrompt: generatePosterPrompt,
};
