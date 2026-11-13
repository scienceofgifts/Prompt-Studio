import {
  PromptOptions,
  ProductImagePromptTemplate,
  ProductOrientation,
  ShotType,
} from '../types';
import { buildMasterPhotographyPrompt } from '../shared/options';

function getWaterBottleOrientationText(orientation: ProductOrientation, shotType?: ShotType): string {
  if (shotType === 'design-close-up') {
    return 'Standing upright while the camera frames closely around the printed or laser-etched artwork across the cylindrical body (~70–85% artwork coverage across the primary front face where proportions allow), retaining genuine bottle finish, curvature, and subtle shoulder/body context rather than full-height negative space.';
  }
  switch (orientation) {
    case 'upright':
      return 'Standing tall and upright on its base at an eye-level hero perspective, highlighting the full vertical profile, sleek cap finish, and frontal artwork.';
    case 'naturally-arranged':
      return 'Angled naturally at a 20-degree tilt in an editorial studio setup, casting a long soft shadow and catching a continuous specular highlight along the bottle shoulder.';
    case 'flat-lay':
      return 'Overhead flat-lay alignment resting horizontally on the staging surface, parallel to the composition axis with balanced negative space.';
    case 'folded':
    default:
      return 'Upright presentation showcasing the primary branded artwork and cap craftsmanship.';
  }
}

export function generateWaterBottlePrompt(options: PromptOptions): string {
  return buildMasterPhotographyPrompt(options, {
    productTypeName: 'Water Bottle / Insulated Flask',
    productDescription: 'A premium reusable water bottle / insulated flask faithfully reproducing the exact metallic silhouette, cap construction, and printed or laser-etched artwork from the reference product.',
    productOrientationText: getWaterBottleOrientationText(options.orientation, options.shotType),
    productFidelityDirectives: [
      'PRESERVE EXACT PHYSICAL FORM: Preserve the exact bottle proportions, cylindrical taper, shoulder radius, neck geometry, and base bevel from the reference image.',
      'CAP & LID MECHANISM: Faithfully retain the specific lid construction (screw cap, wooden inlay, stainless steel carry loop, or sports spout) exactly as shown without inventing alternative closures.',
      'PRESERVE PRINTED & ETCHED ARTWORK: Replicate all laser-etched equations, diagrams, screen-printed illustrations, brand logos, and capacity markings with precise scale, alignment, and crisp definition.',
      'ACCURATE MATERIAL FINISH: Accurately render the surface texture—whether matte powder-coated, brushed stainless steel, anodized aluminum, or satin finish—with authentic light diffusion.',
      'NO RANDOM OUTDOOR GEAR: Do not add climbing clips, gym bags, carabiners, or droplets unless explicitly requested in props.',
    ],
    productSpecificExclusions: [
      'Do not add climbing clips, carabiners, gym gear, artificial water splashes, or condensation drops unless explicitly requested',
    ],
  });
}

export const waterBottlePromptTemplate: ProductImagePromptTemplate = {
  productType: 'waterBottle',
  displayName: 'Water bottle',
  uiGuidance: 'Preserves bottle shape, lid construction, material finish, and laser-etched or screen-printed graphics.',
  generatePrompt: generateWaterBottlePrompt,
};
