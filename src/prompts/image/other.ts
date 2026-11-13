import {
  PromptOptions,
  ProductImagePromptTemplate,
  ProductOrientation,
  ShotType,
} from '../types';
import { buildMasterPhotographyPrompt } from '../shared/options';

function getOtherOrientationText(
  orientation: ProductOrientation,
  shotType?: ShotType,
  customLabel = 'physical product'
): string {
  if (shotType === 'design-close-up') {
    return `Positioned naturally for a tight Design Close-Up photograph framing the actual visible printed artwork, illustration, or typography on the real ${customLabel} (~70–85% artwork coverage when compatible with design proportions), keeping authentic surrounding physical material texture, seams, and contours visible rather than wide negative space.`;
  }
  switch (orientation) {
    case 'upright':
      return 'Standing upright on its base at an eye-level / 15-degree studio perspective, presenting its primary face with dignity and clarity.';
    case 'flat-lay':
      return 'Overhead 90-degree flat-lay composition, laid flat on the surface with balanced negative space around all sides.';
    case 'naturally-arranged':
      return 'Naturally arranged in an organic editorial staging position, showing depth, authentic materials, and dimensional form.';
    case 'folded':
      return 'Neatly arranged or folded according to the item’s natural construction, highlighting signature details and craftsmanship.';
    default:
      return 'Upright hero staging in balanced editorial lighting.';
  }
}

export function generateOtherPrompt(options: PromptOptions): string {
  const customLabel = options.customProductType?.trim() || 'specialty boutique product';
  const isCloseUp = options.shotType === 'design-close-up';

  return buildMasterPhotographyPrompt(options, {
    productTypeName: customLabel,
    productDescription: `A premium ${customLabel} faithfully reproducing the exact physical construction, materials, colors, logos, and artwork from the reference image.`,
    productOrientationText: getOtherOrientationText(options.orientation, options.shotType, customLabel),
    productFidelityDirectives: [
      'PRESERVE EXACT PHYSICAL IDENTITY: The reference product is the definitive source of truth. Preserve the exact physical shape, proportions, dimensions, geometry, and structural construction.',
      'PRESERVE ARTWORK & BRANDING: All printed artwork, logos, typography, graphics, surface textures, and color values must be reproduced with absolute fidelity without redesign or artistic reinterpretation.',
      'ZERO REDESIGN: Do not alter the form factor, do not invent extra features, buttons, handles, or decorative accoutrements not present on the actual physical product.',
      'AUTHENTIC MATERIAL TEXTURE: Accurately render the natural physical material (wood, metal, ceramic, leather, paper, textile, or resin) with genuine tactile fidelity and appropriate light interaction.',
      isCloseUp
        ? 'CLOSE ARTWORK FOCUS WITH PHYSICAL CONTEXT: Frame the visible printed artwork as the dominant subject while preserving tangible surrounding product texture and studio light so the image unmistakably depicts a real physical object.'
        : 'RESTRAINED EDITORIAL CONTEXT: The product must remain the absolute focal hero of the photograph, supported by clean negative space and natural shadows.',
    ],
  });
}

export const otherPromptTemplate: ProductImagePromptTemplate = {
  productType: 'other',
  displayName: 'Other',
  uiGuidance: 'Treats uploaded product as the definitive source of truth. Zero redesign of artwork, logos, or construction.',
  generatePrompt: generateOtherPrompt,
};
