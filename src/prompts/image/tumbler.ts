import {
  PromptOptions,
  ProductImagePromptTemplate,
  ProductOrientation,
  ShotType,
} from '../types';
import { buildMasterPhotographyPrompt } from '../shared/options';

function getTumblerOrientationText(orientation: ProductOrientation, shotType?: ShotType): string {
  if (shotType === 'design-close-up') {
    return 'Standing firmly upright while the camera moves significantly closer to prominently frame the printed or engraved design on the curved insulated surface (~70–85% artwork coverage where wrap geometry allows). Retain authentic cylinder curvature, powder-coat or enamel finish, and subtle rim/lid context without glare hiding text.';
  }
  switch (orientation) {
    case 'upright':
      return 'Standing upright at a slight 15-degree downward angle, revealing both the frontal printed artwork and the clean architectural contour of the transparent lid.';
    case 'naturally-arranged':
      return 'Naturally arranged at a subtle three-quarter angle, catching soft ambient light across the cylindrical taper and metallic lip ring.';
    case 'flat-lay':
      return 'Top-down flat-lay or high-angle product layout resting on the surface with balanced editorial spacing.';
    case 'folded':
    default:
      return 'Upright presentation with crisp focus on the tumbler artwork and lid construction.';
  }
}

export function generateTumblerPrompt(options: PromptOptions): string {
  return buildMasterPhotographyPrompt(options, {
    productTypeName: 'Travel Tumbler',
    productDescription: 'A premium travel tumbler or insulated beverage tumbler faithfully reproducing the conical/cylindrical taper, splash-proof lid, and printed artwork from the reference image.',
    productOrientationText: getTumblerOrientationText(options.orientation, options.shotType),
    productFidelityDirectives: [
      'PRESERVE EXACT PHYSICAL FORM: Preserve the specific taper, cup-holder compatible base, upper diameter, and rim lip geometry from the reference tumbler.',
      'LID & DRINKING SPOUT ACCURACY: Accurately reproduce the clear Tritan or acrylic press-in lid, magnetic slider, sipping aperture, and silicone gasket ring without inventing different lid models.',
      'PRESERVE PRINTED & ENGRAVED ARTWORK: Faithfully maintain the scale, color, typography, fine line weights, and placement of all printed graphics, logos, and scientific diagrams.',
      'AUTHENTIC FINISH: Accurately depict the exterior finish—whether durable powder-coat texture, smooth semi-gloss enamel, or raw brushed stainless steel.',
      'NO UNINVITED STRAWS OR SPILLS: Do not add loose straws, coffee spills, or steam unless explicitly requested.',
    ],
    productSpecificExclusions: [
      'Do not add loose plastic straws, coffee spills, liquid puddles, or steam unless explicitly requested',
    ],
  });
}

export const tumblerPromptTemplate: ProductImagePromptTemplate = {
  productType: 'tumbler',
  displayName: 'Tumbler',
  uiGuidance: 'Preserves conical taper, splash-proof lid structure, drinking spout, and printed/engraved artwork.',
  generatePrompt: generateTumblerPrompt,
};
