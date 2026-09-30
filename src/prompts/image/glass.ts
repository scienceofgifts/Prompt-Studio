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

function getGlassOrientationText(orientation: ProductOrientation): string {
  switch (orientation) {
    case 'upright':
      return 'Orientation: Standing upright on its heavy glass base at an eye-level studio perspective (10-15 degree downward angle), catching clean rim highlights and showing printed artwork legibly.';
    case 'naturally-arranged':
      return 'Orientation: Naturally styled at a subtle quarter-angle, allowing light to transmit through the clear glass walls and highlight both front and translucent back planes.';
    case 'flat-lay':
      return 'Orientation: Stylized flat-lay or top-down rim orientation with balanced shadows and crisp silhouette definition.';
    case 'folded':
    default:
      return 'Orientation: Upright presentation in clean editorial studio alignment.';
  }
}

/**
 * Builds the complete photography prompt for Glassware.
 * Edit this template to adjust optical refraction, caustic highlights, or glassware silhouettes.
 */
export function generateGlassPrompt(options: PromptOptions): string {
  const referenceHeader = formatReferenceHeader(options.hasReferenceImage, options.referenceImageName);
  const orientationText = getGlassOrientationText(options.orientation);
  const backgroundText = getBackgroundPromptText(options.background);
  const surfaceText = getSurfacePromptText(options.surface);
  const propsText = getPropsPromptText(options.props);
  const technicalSettings = formatTechnicalSettings(options.aspectRatio);
  const negativeExclusions = formatNegativeExclusions([
    'Do NOT add handles, lids, straws, ice cubes, fruit slices, or beverages unless explicitly specified',
    'No fingerprints, dust specks, or murky liquid reflections',
  ]);
  const additionalInstructions = formatAdditionalInstructions(options.additionalInstructions);

  return `Commercial Editorial Product Photograph — Science of Gifts

${referenceHeader}

CORE OBJECTIVE:
Transform the uploaded product image into a realistic, premium editorial e-commerce photograph for the boutique brand "Science of Gifts". The physical glassware product itself is the single most important element. Preserve the actual product design, artwork, text, logos, colors, proportions, shape, and construction as accurately as possible. Do NOT redesign, recolor, distort, or reinterpret the product.

PRODUCT DESCRIPTION:
Hero product: A premium glassware tumbler or drinking glass faithfully reproducing the physical silhouette, glass clarity, and printed artwork from the reference image.

PRODUCT FIDELITY DIRECTIVES:
• PRESERVE EXACT PHYSICAL FORM: Preserve the precise cylindrical or tapered silhouette, base sham weight, wall thickness, and polished rim contour from the reference glass.
• PRESERVE PRINTED & ETCHED ARTWORK: Faithfully replicate all screen-printed graphics, enamel typography, frosted etchings, measurements, and logos with razor-sharp precision and correct curvature wrap around the glass.
• NO UNINVITED ADDITIONS: Do NOT add handles, lids, straws, ice cubes, fruit slices, or beverages unless explicitly specified.
• OPTICAL REFRACTION & CAUSTICS: Render realistic optical light refraction, subtle crystal-clear highlights, genuine glass transparency, and soft caustic light pooling on the surface beneath.
• CLEAN SURFACE: The glass should appear pristine, polished, lint-free, and fingerprint-free, reflecting soft diffused studio lightboxes.

STAGING & COMPOSITION:
• ${orientationText}
• Background: ${backgroundText}
• Surface: ${surfaceText}
• ${propsText}

MATERIAL & LIGHTING SPECIFICATIONS:
• Material rendering: Soda-lime or lead-free crystal glass with realistic index of refraction (IOR ~1.52), soft twin strip-light reflections along the outer edges, and subtle diffuse contact shadow.
• Lighting Style: Soft, diffused north-facing daylight augmented by a large studio softbox key light. Subtle gradations, zero harsh specular hotspots, and authentic natural contact shadows.
• Visual Aesthetic: Sophisticated, minimalist, restrained editorial luxury. Generous negative space, calm balanced framing, tactile realism.

${technicalSettings}

${negativeExclusions}
${additionalInstructions}
FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries.`;
}

export const glassPromptTemplate: ProductImagePromptTemplate = {
  productType: 'glass',
  displayName: 'Glass',
  uiGuidance: 'Preserves optical glass clarity, physical silhouette, and printed/etched artwork with caustic reflections.',
  generatePrompt: generateGlassPrompt,
};
