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

function getNotebookOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'flat-lay':
      return 'Orientation: Overhead 90-degree flat-lay, lying flat on the surface with generous negative space, highlighting the full planar geometry of the front cover and its artwork.';
    case 'upright':
      return 'Orientation: Standing upright or gently propped at a soft 20-degree angle, displaying the cover face prominently alongside the clean spine edge.';
    case 'naturally-arranged':
      return 'Orientation: Naturally resting on the surface at a graceful 15-degree editorial perspective, with soft ribbon marker gently trailing alongside.';
    case 'folded':
    default:
      return 'Orientation: Cleanly placed on the surface in an editorial still-life composition, emphasizing cover texture and crisp book corners.';
  }
}

/**
 * Builds the complete photography prompt for Notebooks and Journals.
 * Edit this template to adjust bookbinding preservation, gold foil accents, or ribbon styling.
 */
export function generateNotebookPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getNotebookOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'DO NOT invent a fold, spine bend, or artificial crease along the book spine',
    'Do not scatter random pens, sticky notes, paper clips, or stationery clutter unless explicitly requested',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical notebook / journal itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium hardcover or softcover notebook / journal faithfully showcasing the exact cover artwork, typography, and bookbinding construction from the reference product.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT COVER ARTWORK & TITLES: Faithfully reproduce the complete cover illustration, celestial/scientific chart, title typography, author/collection text, foil stamping, debossing, and exact background color from the reference notebook.
• ELASTIC CLOSURE & RIBBON MARKER FIDELITY: If visible in the reference image, accurately preserve the elastic closure band (its width, placement, tension, and color) and the silk/satin ribbon page marker extending gracefully from the binding.
• NEVER INVENT A SPINE CREASE OR FOLD: Absolutely do NOT invent a fold, spine bend, or artificial crease along the book spine. The notebook structure and spine must remain true to its authentic bookbinding construction (flat, crisp, and intact).
• ACCURATE BOOK EDGES & BINDING: Show crisp, clean book block edges (plain, gilded, or stained matching the reference) with precise bookboard corner radii.
• NO RANDOM STATIONERY CLUTTER: Do not scatter pens, sticky notes, or paper clips unless explicitly requested in props.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Fine bookbinding cloth, buckram, or textured matte cardstock with tactile paper grain. Soft raking light that catches subtle metallic foil gleam and creates subtle, realistic contact shadows beneath the book edges.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const notebookPromptTemplate: ProductImagePromptTemplate = {
  productType: 'notebook',
  displayName: 'Notebook',
  uiGuidance: 'Preserves exact cover artwork, elastic closure & ribbon marker. Strictly forbids inventing spine folds or creases.',
  generatePrompt: generateNotebookPrompt,
};
