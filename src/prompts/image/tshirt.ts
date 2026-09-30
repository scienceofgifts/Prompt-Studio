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

function getTshirtOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'folded':
      return 'Orientation: Elegantly and neatly folded in a boutique retail presentation with soft, natural fabric folds, positioning the central printed graphic artwork prominently on top.';
    case 'flat-lay':
      return 'Orientation: Architectural top-down 90-degree flat-lay, smoothed neatly with subtle organic fabric contours and balanced sleeve placement.';
    case 'naturally-arranged':
      return 'Orientation: Naturally arranged with gentle editorial movement—relaxed torso drape, soft rolled sleeve cuff, and organic fabric ripples that convey soft tactile luxury.';
    case 'upright':
    default:
      return 'Orientation: Formally laid out or lightly pinned upright with soft natural body and realistic fabric gravity, displaying the complete frontal print without distortion.';
  }
}

/**
 * Builds the complete photography prompt for T-shirts.
 * Edit this template to adjust textile drape, print fidelity, or styling rules.
 */
export function generateTshirtPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getTshirtOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'No human models, no visible necks, no mannequins, no wooden hangers unless explicitly requested',
    'Do NOT warp or stretch the printed graphic illegibly across textile folds',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical apparel t-shirt itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium apparel t-shirt faithfully showcasing the exact fabric tone, neckline construction, and printed graphic artwork from the reference garment.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE ACTUAL GARMENT & FABRIC: Retain the authentic garment silhouette, ring-spun combed cotton knit texture, ribbed crewneck or v-neck collar ribbing, shoulder taping, and hem stitching.
• PRESERVE EXACT PRINTED ARTWORK: The graphic illustration, typography, screen print, embroidery, or front design must match the reference image exactly in proportion, placement across the chest, font styling, and color palette.
• NO WARPING OF ARTWORK: Textile folds should organically interact with the artwork without illegibly mutilating, stretching, or altering the text or graphics.
• NO GHOST MANNEQUIN OR DISTRACTING MODELS: No human bodies, visible mannequins, hands, or hangers unless explicitly requested; style as a standalone physical product.
• AUTHENTIC TEXTILE WEIGHT: Render genuine cotton jersey weight, micro-weave texture, natural soft drape, and realistic fabric ambient shadows.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: 100% premium heavyweight combed cotton with authentic matte yarn texture, soft directional key lighting highlighting the knit weave, and delicate shadow gradation within fabric creases.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const tshirtPromptTemplate: ProductImagePromptTemplate = {
  productType: 'tshirt',
  displayName: 'T-shirt',
  uiGuidance: 'Preserves actual garment, fabric weave, collar construction, color, and printed artwork without warping.',
  generatePrompt: generateTshirtPrompt,
};
