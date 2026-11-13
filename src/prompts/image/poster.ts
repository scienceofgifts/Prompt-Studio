import {
  PromptOptions,
  ProductImagePromptTemplate,
  ProductOrientation,
  ShotType,
} from '../types';
import { buildMasterPhotographyPrompt } from '../shared/options';

function getPosterOrientationText(orientation: ProductOrientation, shotType?: ShotType): string {
  if (shotType === 'design-close-up') {
    return 'Tight, parallel, distortion-free close-up photograph directly facing the printed poster artwork (~70–85% artwork coverage when proportions allow), keeping fine archival paper tooth, subtle raking light, and minimal edge/mat/surface context visible so it reads unmistakably as a physical print rather than a digital graphic file; outer blank paper margins or frame edges may sit near or crop at the frame border.';
  }
  switch (orientation) {
    case 'flat-lay':
      return 'Overhead 90-degree flat-lay, lying flat and square to the camera with generous negative space framing all four outer margins evenly.';
    case 'upright':
      return 'Standing upright against the backdrop or lightly propped in a subtle architectural lean, catching gentle raking light across the archival paper texture.';
    case 'naturally-arranged':
      return 'Naturally arranged at a soft 15-degree angle resting on the editorial surface, with gentle natural paper weight and subtle contact shadows.';
    case 'folded':
    default:
      return 'Planar flat presentation highlighting crisp typographic details and balanced margins.';
  }
}

export function generatePosterPrompt(options: PromptOptions): string {
  const isCloseUp = options.shotType === 'design-close-up';

  return buildMasterPhotographyPrompt(options, {
    productTypeName: 'Art Poster / Fine Art Print',
    productDescription: 'A fine art poster or archival scientific print faithfully reproducing the entire graphic layout, typography, borders, illustrations, and paper craftsmanship from the reference image.',
    productOrientationText: getPosterOrientationText(options.orientation, options.shotType),
    productFidelityDirectives: [
      isCloseUp
        ? 'PRESERVE CORE PRINTED ARTWORK & PROPORTIONS: Faithfully retain all essential illustration details, diagrams, star charts, scientific annotations, typography, and exact ink colors with razor-sharp focus and zero graphic redesign or stretching.'
        : 'PRESERVE COMPLETE ARTWORK & LAYOUT: Faithfully retain the entire composition, margins, borders, typography, diagrams, star charts, scientific annotations, and color palette from the reference poster.',
      isCloseUp
        ? 'TIGHT ACCURATE PHYSICAL PRINT FRAMING: Frame tightly on the printed artwork itself while allowing outer blank margins or outer frame edges to sit near or slightly outside the frame border—never alter fonts, redraw artwork, or turn the shot into a flat digital export.'
        : 'NO ARBITRARY CROPPING OR REDESIGN: Do not crop out edges, do not alter fonts, do not re-draw illustrations, and do not introduce new text or decorative elements.',
      'AUTHENTIC PAPER TEXTURE & WEIGHT: Depict heavyweight 310 GSM archival cotton rag, matte velvet fine-art paper, or smooth museum-grade stock with subtle natural paper tooth and realistic tactile presence.',
      'EDGE FIDELITY: Show crisp, clean paper surfaces and edges without artificial tears, creases, or curling unless explicitly requested.',
      isCloseUp
        ? 'PHYSICAL PRINT CONTEXT: Maintain subtle raking studio light across the archival paper surface and minimal frame/surface context so it clearly reads as a photographed physical art print.'
        : 'PRESENTATION PURITY: Display either cleanly resting flat on the staging surface or in a minimal thin gallery frame (if requested), avoiding distracting clips or oversized furniture.',
    ],
    productSpecificExclusions: [
      isCloseUp
        ? 'Do not alter poster fonts, do not invent new decorative borders, and do not make the photograph look like a raw flat digital file'
        : 'Do not crop out margins, do not alter poster fonts, and do not invent new decorative borders',
      'No artificial paper tears, bent dog-eared corners, or distracting binder clips unless explicitly requested',
    ],
  });
}

export const posterPromptTemplate: ProductImagePromptTemplate = {
  productType: 'poster',
  displayName: 'Poster',
  uiGuidance: 'Preserves complete poster layout, margins, typography, and paper texture with authentic paper weight.',
  generatePrompt: generatePosterPrompt,
};
