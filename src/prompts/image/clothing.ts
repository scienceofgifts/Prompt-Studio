import {
  CameraAngle,
  ClothingPresentation,
  ClothingPresentationGroup,
  ProductOrientation,
  ProductType,
  PromptOptions,
} from '../types';
import { buildMasterPhotographyPrompt } from '../shared/options';

export type ClothingGarmentType = 'tshirt' | 'sweatshirt' | 'hoodie';

export interface ClothingPresentationPresetMetadata {
  id: ClothingPresentation;
  label: string;
  group: ClothingPresentationGroup;
  baseOrientation: ProductOrientation;
  shortDescription: string;
  supportedGarments: ClothingGarmentType[];
  compatibleCameraAngles: CameraAngle[];
  defaultCameraAngle: CameraAngle;
  cameraConstraintNote: string;
  requiresVerticalStudioStaging?: boolean;
  requiresEditorialProps?: boolean;
}

export const CLOTHING_PRESENTATION_PRESETS: Record<
  ClothingPresentation,
  ClothingPresentationPresetMetadata
> = {
  // ==========================================
  // A. Flat-lay presentations
  // ==========================================
  'classic-symmetrical-flat-lay': {
    id: 'classic-symmetrical-flat-lay',
    label: 'Classic symmetrical flat lay',
    group: 'flat-lay',
    baseOrientation: 'flat-lay',
    shortDescription:
      'Garment lies flat and centered with sleeves arranged evenly and front graphic fully visible.',
    supportedGarments: ['tshirt', 'sweatshirt'],
    compatibleCameraAngles: ['gentle-overhead'],
    defaultCameraAngle: 'gentle-overhead',
    cameraConstraintNote: 'Requires a direct 90° overhead camera angle.',
  },
  'diagonal-flat-lay': {
    id: 'diagonal-flat-lay',
    label: 'Diagonal flat lay',
    group: 'flat-lay',
    baseOrientation: 'flat-lay',
    shortDescription:
      'Garment rotated 15–30° relative to the frame edges in a natural, balanced overhead composition.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['gentle-overhead'],
    defaultCameraAngle: 'gentle-overhead',
    cameraConstraintNote: 'Requires a direct 90° overhead camera angle.',
  },
  'relaxed-natural-flat-lay': {
    id: 'relaxed-natural-flat-lay',
    label: 'Relaxed natural flat lay',
    group: 'flat-lay',
    baseOrientation: 'flat-lay',
    shortDescription:
      'Natural fabric drape and gentle folds with loosely arranged sleeves and unobstructed graphic.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['gentle-overhead'],
    defaultCameraAngle: 'gentle-overhead',
    cameraConstraintNote: 'Requires a direct 90° overhead camera angle.',
  },
  'asymmetrical-sleeve-flat-lay': {
    id: 'asymmetrical-sleeve-flat-lay',
    label: 'Asymmetrical sleeve arrangement',
    group: 'flat-lay',
    baseOrientation: 'flat-lay',
    shortDescription:
      'One sleeve positioned differently from the other for visual variety while keeping the graphic fully visible.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['gentle-overhead'],
    defaultCameraAngle: 'gentle-overhead',
    cameraConstraintNote: 'Requires a direct 90° overhead camera angle.',
  },
  'editorial-flat-lay-with-props': {
    id: 'editorial-flat-lay-with-props',
    label: 'Editorial flat lay with props',
    group: 'flat-lay',
    baseOrientation: 'flat-lay',
    shortDescription:
      'Hero garment flat lay paired with 1–2 restrained props that never overlap the printed design.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['gentle-overhead'],
    defaultCameraAngle: 'gentle-overhead',
    cameraConstraintNote:
      'Requires a direct 90° overhead camera angle; props remain clear of the printed artwork.',
    requiresEditorialProps: true,
  },

  // ==========================================
  // B. Folded presentations
  // ==========================================
  'folded-full-graphic': {
    id: 'folded-full-graphic',
    label: 'Folded with full graphic visible',
    group: 'folded',
    baseOrientation: 'folded',
    shortDescription:
      'Neatly folded rectangular presentation with the printed chest panel completely exposed.',
    supportedGarments: ['tshirt', 'sweatshirt'],
    compatibleCameraAngles: [
      'slightly-elevated',
      'three-quarter',
      'high-three-quarter',
      'gentle-overhead',
      'natural-perspective',
    ],
    defaultCameraAngle: 'slightly-elevated',
    cameraConstraintNote:
      'Uses an elevated near-front or overhead angle so the folded chest graphic stays fully visible.',
  },
  'compact-boutique-fold': {
    id: 'compact-boutique-fold',
    label: 'Compact boutique fold',
    group: 'folded',
    baseOrientation: 'folded',
    shortDescription:
      'Compact retail fold highlighting realistic fabric thickness, clean edges, collar, and graphic.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: [
      'three-quarter',
      'high-three-quarter',
      'slightly-elevated',
      'natural-perspective',
    ],
    defaultCameraAngle: 'high-three-quarter',
    cameraConstraintNote:
      'Uses an elevated three-quarter viewpoint to show both the top graphic and folded edge thickness.',
  },
  'hoodie-hood-displayed': {
    id: 'hoodie-hood-displayed',
    label: 'Hoodie with hood displayed',
    group: 'folded',
    baseOrientation: 'folded',
    shortDescription:
      'Neatly folded body with the hood arranged naturally behind or above the unobstructed chest panel.',
    supportedGarments: ['hoodie'],
    compatibleCameraAngles: [
      'three-quarter',
      'high-three-quarter',
      'slightly-elevated',
      'gentle-overhead',
      'natural-perspective',
    ],
    defaultCameraAngle: 'high-three-quarter',
    cameraConstraintNote:
      'Uses an elevated three-quarter view to keep the chest design, hood, and drawstrings clearly visible.',
  },
  'layered-folded-stack': {
    id: 'layered-folded-stack',
    label: 'Layered folded stack',
    group: 'folded',
    baseOrientation: 'folded',
    shortDescription:
      'Two or three folded garments with slight offsets; top hero garment shows its full printed design.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: [
      'three-quarter',
      'high-three-quarter',
      'slightly-elevated',
      'natural-perspective',
    ],
    defaultCameraAngle: 'three-quarter',
    cameraConstraintNote:
      'Uses an elevated three-quarter angle so the top hero graphic and stacked layers are clearly visible.',
  },

  // ==========================================
  // C. Other garment presentations
  // ==========================================
  'three-quarter-tabletop': {
    id: 'three-quarter-tabletop',
    label: 'Three-quarter tabletop presentation',
    group: 'other',
    baseOrientation: 'naturally-arranged',
    shortDescription:
      'Garment arranged naturally on a flat surface with the camera elevated 30–45° and undistorted graphic.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: [
      'three-quarter',
      'high-three-quarter',
      'slightly-elevated',
      'natural-perspective',
    ],
    defaultCameraAngle: 'high-three-quarter',
    cameraConstraintNote: 'Uses an elevated 30°–45° three-quarter tabletop camera angle.',
  },
  'low-angle-tabletop': {
    id: 'low-angle-tabletop',
    label: 'Low-angle tabletop presentation',
    group: 'other',
    baseOrientation: 'naturally-arranged',
    shortDescription:
      'Camera positioned close to the surface looking slightly across the garment to emphasize fabric thickness and texture.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['near-eye-level', 'slightly-lowered', 'slightly-elevated'],
    defaultCameraAngle: 'near-eye-level',
    cameraConstraintNote:
      'Uses a low, near-surface angle looking slightly across the garment without extreme perspective distortion.',
  },
  'hanger-presentation': {
    id: 'hanger-presentation',
    label: 'Hanger presentation',
    group: 'other',
    baseOrientation: 'upright',
    shortDescription:
      'Garment hangs naturally from a simple, unobtrusive hanger against a clean studio background with full graphic visible.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['straight-on', 'three-quarter', 'natural-perspective'],
    defaultCameraAngle: 'straight-on',
    cameraConstraintNote:
      'Requires a front-facing vertical studio camera angle; replaces flat-lay/tabletop surface directions.',
    requiresVerticalStudioStaging: true,
  },
  'ghost-mannequin': {
    id: 'ghost-mannequin',
    label: 'Ghost mannequin',
    group: 'other',
    baseOrientation: 'upright',
    shortDescription:
      'Natural three-dimensional clothing silhouette with realistic collar, shoulders, and sleeves; no visible person or mannequin.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['straight-on', 'three-quarter', 'natural-perspective'],
    defaultCameraAngle: 'straight-on',
    cameraConstraintNote:
      'Requires a front-facing catalog camera angle at chest height; replaces tabletop surface directions.',
    requiresVerticalStudioStaging: true,
  },
  'front-and-back': {
    id: 'front-and-back',
    label: 'Front-and-back presentation',
    group: 'other',
    baseOrientation: 'upright',
    shortDescription:
      'Front and back views arranged side by side, preserving the actual design on each side without inventing back graphics.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: ['straight-on', 'gentle-overhead'],
    defaultCameraAngle: 'straight-on',
    cameraConstraintNote:
      'Uses a perpendicular straight-on or overhead catalog angle to keep front and back views evenly aligned.',
  },
  'close-up-detail': {
    id: 'close-up-detail',
    label: 'Close-up detail',
    group: 'other',
    baseOrientation: 'naturally-arranged',
    shortDescription:
      'Close macro crop of the actual print, fabric weave, collar, or stitching with faithful reproduction of the supplied design.',
    supportedGarments: ['tshirt', 'sweatshirt', 'hoodie'],
    compatibleCameraAngles: [
      'straight-on',
      'three-quarter',
      'slightly-elevated',
      'high-three-quarter',
      'gentle-overhead',
      'natural-perspective',
    ],
    defaultCameraAngle: 'slightly-elevated',
    cameraConstraintNote:
      'Uses close macro detail framing focused on the actual print, fabric texture, collar, or stitching.',
  },
};

export const CLOTHING_PRESENTATION_LIST: ClothingPresentationPresetMetadata[] = Object.values(
  CLOTHING_PRESENTATION_PRESETS
);

export const CLOTHING_PRESENTATION_GROUPS: {
  id: ClothingPresentationGroup;
  label: string;
  presets: ClothingPresentationPresetMetadata[];
}[] = [
  {
    id: 'flat-lay',
    label: 'Flat-lay presentations',
    presets: CLOTHING_PRESENTATION_LIST.filter((p) => p.group === 'flat-lay'),
  },
  {
    id: 'folded',
    label: 'Folded presentations',
    presets: CLOTHING_PRESENTATION_LIST.filter((p) => p.group === 'folded'),
  },
  {
    id: 'other',
    label: 'Other garment presentations',
    presets: CLOTHING_PRESENTATION_LIST.filter((p) => p.group === 'other'),
  },
];

export function isClothingProduct(productType?: ProductType | string): productType is ClothingGarmentType {
  return productType === 'tshirt' || productType === 'sweatshirt' || productType === 'hoodie';
}

export function isPresetSupportedForGarment(
  presetId: ClothingPresentation,
  productType: ProductType
): boolean {
  if (!isClothingProduct(productType)) return false;
  const preset = CLOTHING_PRESENTATION_PRESETS[presetId];
  return Boolean(preset && preset.supportedGarments.includes(productType));
}

export function getSupportedPresetsForGarment(
  productType: ProductType
): ClothingPresentationPresetMetadata[] {
  if (!isClothingProduct(productType)) return [];
  return CLOTHING_PRESENTATION_LIST.filter((p) => p.supportedGarments.includes(productType));
}

/**
 * Maps a base ProductOrientation to a sensible garment-compatible ClothingPresentation
 * when no clothingPresentation is explicitly provided or when an orientation button is clicked.
 */
export function getDefaultPresentationForOrientation(
  productType: ProductType,
  orientation: ProductOrientation = 'flat-lay'
): ClothingPresentation {
  const isHoodie = productType === 'hoodie';
  switch (orientation) {
    case 'flat-lay':
      return isHoodie ? 'relaxed-natural-flat-lay' : 'classic-symmetrical-flat-lay';
    case 'folded':
      return isHoodie ? 'hoodie-hood-displayed' : 'folded-full-graphic';
    case 'naturally-arranged':
      return 'three-quarter-tabletop';
    case 'upright':
    default:
      return 'ghost-mannequin';
  }
}

/**
 * Deterministically resolves a ClothingPresentation for a given garment type.
 * If the provided preset is undefined or incompatible with the garment type,
 * resolves to the closest compatible presentation for that garment.
 */
export function resolveClothingPresentation(
  productType: ProductType,
  clothingPresentation?: ClothingPresentation,
  orientation: ProductOrientation = 'flat-lay'
): ClothingPresentation {
  if (!isClothingProduct(productType)) {
    return clothingPresentation || 'classic-symmetrical-flat-lay';
  }

  if (clothingPresentation && CLOTHING_PRESENTATION_PRESETS[clothingPresentation]) {
    const preset = CLOTHING_PRESENTATION_PRESETS[clothingPresentation];
    if (preset.supportedGarments.includes(productType)) {
      return clothingPresentation;
    }

    // Deterministic fallback for garment-incompatible presets:
    if (clothingPresentation === 'hoodie-hood-displayed') {
      return 'folded-full-graphic';
    }
    if (clothingPresentation === 'folded-full-graphic' && productType === 'hoodie') {
      return 'hoodie-hood-displayed';
    }
    if (clothingPresentation === 'classic-symmetrical-flat-lay' && productType === 'hoodie') {
      return 'relaxed-natural-flat-lay';
    }

    return getDefaultPresentationForOrientation(productType, preset.baseOrientation);
  }

  return getDefaultPresentationForOrientation(productType, orientation);
}

export interface ResolvedClothingCamera {
  presentation: ClothingPresentation;
  preset: ClothingPresentationPresetMetadata;
  effectiveCameraAngle: CameraAngle;
  wasCameraOverridden: boolean;
  cameraConstraintNote: string;
}

/**
 * Precedence rule for clothing presentation vs camera angle:
 * 1. The selected presentation determines the essential physical arrangement.
 * 2. Its required camera geometry takes precedence when a different camera angle would make that presentation impossible.
 * 3. Compatible existing camera settings continue to apply.
 * 4. Incompatible settings are resolved deterministically without contradictory directions.
 */
export function resolveClothingCamera(options: PromptOptions): ResolvedClothingCamera {
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );
  const preset = CLOTHING_PRESENTATION_PRESETS[presentation];
  const requestedAngle = options.cameraAngle;

  const isCompatible =
    Boolean(requestedAngle) && preset.compatibleCameraAngles.includes(requestedAngle as CameraAngle);

  const effectiveCameraAngle: CameraAngle = isCompatible
    ? (requestedAngle as CameraAngle)
    : preset.defaultCameraAngle;

  const wasCameraOverridden = Boolean(
    requestedAngle && !preset.compatibleCameraAngles.includes(requestedAngle)
  );

  return {
    presentation,
    preset,
    effectiveCameraAngle,
    wasCameraOverridden,
    cameraConstraintNote: preset.cameraConstraintNote,
  };
}

function getGarmentNoun(productType: ProductType): string {
  if (productType === 'hoodie') return 'heavyweight hoodie';
  if (productType === 'sweatshirt') return 'crewneck sweatshirt';
  return 'T-shirt';
}

/**
 * Generates the physical arrangement instruction for the Master / ChatGPT prompt.
 */
export function getClothingOrientationPromptText(options: PromptOptions): string {
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );
  const garment = getGarmentNoun(options.productType);
  const isHoodie = options.productType === 'hoodie';
  const isSweatshirt = options.productType === 'sweatshirt';

  switch (presentation) {
    case 'classic-symmetrical-flat-lay':
      return `Classic Symmetrical Flat-Lay Presentation: The ${garment} lies completely flat and centered on the surface, with both sleeves arranged evenly and symmetrically. The ribbed crewneck collar and hem are cleanly aligned, the front graphic is 100% visible and unobstructed, and the camera is positioned directly overhead at 90 degrees.`;

    case 'diagonal-flat-lay':
      return `Diagonal Flat-Lay Presentation: The ${garment} lies flat on the surface, rotated approximately 15–30 degrees relative to the image frame edges in a natural, balanced diagonal composition.${
        isHoodie
          ? ' The double-layer hood rests smoothly above the neckline without bunching.'
          : ''
      } The front graphic remains fully visible and undistorted, shot from directly overhead at 90 degrees.`;

    case 'relaxed-natural-flat-lay':
      return `Relaxed Natural Flat-Lay Presentation: The ${garment} lies flat on the surface with organic fabric drape and gentle, tactile folds. Sleeves are arranged loosely and naturally without excessive wrinkling or stiff symmetry.${
        isHoodie
          ? ' The heavyweight fleece body, kangaroo pocket, drawstrings, and hood rest in an unforced, sculptural posture.'
          : isSweatshirt
          ? ' The crewneck fleece body and ribbed cuffs rest with soft, natural textile weight.'
          : ''
      } The printed chest graphic remains completely unobstructed and legible, photographed from directly overhead at 90 degrees.`;

    case 'asymmetrical-sleeve-flat-lay':
      return `Asymmetrical Sleeve Flat-Lay Presentation: The ${garment} lies flat on the surface with one sleeve positioned differently from the other (for example, one sleeve extended naturally while the other is softly angled or gently folded back), introducing subtle visual variety while retaining a balanced garment silhouette.${
        isHoodie ? ' The hood rests neatly at the top without obscuring the neckline.' : ''
      } The front printed graphic remains completely visible and unobstructed, captured from directly overhead at 90 degrees.`;

    case 'editorial-flat-lay-with-props':
      return `Editorial Flat-Lay Presentation with Restrained Props: The ${garment} lies flat on the surface as the primary hero subject, accompanied by one or two restrained, contextually appropriate editorial props positioned in the surrounding space. Props must strictly stay clear of the garment body and must NEVER overlap or obscure the printed graphic design. Photographed from directly overhead at 90 degrees.`;

    case 'folded-full-graphic':
      return `Folded Presentation with Full Graphic Visible: The ${garment} is neatly folded into a clean rectangular retail presentation resting flat on the tabletop surface, with the sleeves tucked cleanly underneath so the printed chest panel remains completely exposed and facing upward. Captured from a slightly elevated, near-front diagonal or elevated catalog camera angle.`;

    case 'compact-boutique-fold':
      return `Compact Boutique Fold Presentation: The ${garment} is arranged in a compact, carefully proportioned boutique fold resting on the surface, showcasing realistic fabric thickness, folded side edges, and clean construction.${
        isHoodie
          ? ' The hood is tucked neatly behind the top fold edge without bulkiness.'
          : ''
      } The collar area and as much of the front printed graphic as possible remain clearly visible and unobstructed on the top face, viewed from an elevated three-quarter angle.`;

    case 'hoodie-hood-displayed':
      return `Folded Hoodie with Hood Displayed: The heavyweight hoodie body is folded neatly in a rectangular presentation on the surface, while the double-layer hood is arranged naturally behind or just above the chest panel. Drawstrings remain naturally visible where present on the reference garment, and the printed chest design remains completely unobstructed and flat, captured from an elevated three-quarter view.`;

    case 'layered-folded-stack':
      return `Layered Folded Stack Presentation: Two or three neatly folded ${garment}s are arranged in a curated stack with slight, deliberate offsets on the surface. The top ${garment} is the hero product with its full printed chest design completely visible and facing upward. The lower folded garments provide subtle coordinated depth underneath and must NEVER obscure the hero garment's main design.`;

    case 'three-quarter-tabletop':
      return `Three-Quarter Tabletop Presentation: The ${garment} is arranged naturally on a flat tabletop surface with realistic fabric depth, dimensional textile folds, and soft contact shadows.${
        isHoodie
          ? ' The hood and sleeves rest in a calm, balanced tabletop arrangement.'
          : ''
      } Photographed with the camera elevated approximately 30–45 degrees so the front graphic remains completely undistorted and clearly legible.`;

    case 'low-angle-tabletop':
      return `Low-Angle Tabletop Presentation: The ${garment} rests naturally on a flat tabletop surface while the camera is positioned close to the surface, looking slightly across the garment to emphasize fabric thickness, knit weave, collar ribbing, and seam construction. Maintain controlled optical perspective to avoid extreme perspective distortion and keep the design recognizable.`;

    case 'hanger-presentation':
      return `Hanger Presentation: The ${garment} hangs naturally in a vertical front-facing presentation from a simple, unobtrusive, unbranded hanger against a clean studio background. Realistic gravity-driven fabric drape across the shoulders and torso${
        isHoodie ? ' with the hood resting naturally behind the collar' : ''
      }, no visible person or mannequin, and the front printed graphic completely visible and undistorted.`;

    case 'ghost-mannequin':
      return `Ghost Mannequin Presentation: The ${garment} is presented in a natural, three-dimensional hollow clothing silhouette (invisible ghost-mannequin catalog style) with realistic collar shape, structured shoulders, natural hanging sleeves, and authentic fabric construction${
        isHoodie ? ', including natural 3D hood volume and kangaroo pocket structure' : ''
      }. Strictly no visible person, body, mannequin hardware, or hanger. Suitable for standardized e-commerce catalog photography.`;

    case 'front-and-back':
      return `Front-and-Back Side-by-Side Presentation: Both the front view and the back view of the ${garment} are arranged side by side in a balanced dual catalog layout. Faithfully preserve the garment's actual supplied design on each side, and strictly do NOT invent back graphics, logos, lettering, or decorative details when they are not supplied.`;

    case 'close-up-detail':
      return `Close-Up Detail Presentation: Tight macro detail crop of the ${garment} focusing on the actual printed graphic, ink or embroidery texture, fabric weave, collar ribbing${
        isHoodie ? ', drawstring eyelets,' : ''
      } and seam stitching. Prioritize 100% faithful reproduction of the supplied design without inventing any lettering, graphic elements, or product features.`;
  }
}

/**
 * Generates the non-contradictory CAMERA & VIEWPOINT DIRECTION block for clothing presets.
 */
export function getClothingCameraPromptText(options: PromptOptions): string {
  const { presentation, effectiveCameraAngle, wasCameraOverridden } = resolveClothingCamera(options);
  const perspective = options.perspective || 'natural';
  const focal = options.focalLength || 'normal-editorial';
  const dof = options.depthOfField || 'gentle-falloff';

  let shotDesc =
    'Hero garment composition featuring complete, unobstructed product and graphic visibility.';
  if (presentation === 'close-up-detail') {
    shotDesc =
      'Close-up macro detail framing highlighting fine garment craftsmanship, actual print registration, collar construction, and textile micro-weave as a secondary e-commerce detail image.';
  } else if (presentation === 'front-and-back') {
    shotDesc =
      'Dual front-and-back e-commerce catalog framing showing both sides of the garment side by side at equal scale.';
  } else if (presentation === 'ghost-mannequin' || presentation === 'hanger-presentation') {
    shotDesc =
      'Standardized high-clarity vertical e-commerce catalog framing capturing the full hanging or 3D garment silhouette cleanly.';
  } else if (options.shotType === 'standard-catalog') {
    shotDesc = 'Standard high-clarity e-commerce catalog shot with balanced, clean garment framing.';
  } else if (options.shotType === 'detail-oriented') {
    shotDesc =
      'Detail-oriented garment framing highlighting tactile cotton/fleece weave, seams, and crisp artwork reproduction.';
  }

  let angleDesc = '';
  switch (presentation) {
    case 'classic-symmetrical-flat-lay':
    case 'diagonal-flat-lay':
    case 'relaxed-natural-flat-lay':
    case 'asymmetrical-sleeve-flat-lay':
    case 'editorial-flat-lay-with-props':
      angleDesc =
        'Camera positioned directly overhead at a true 90-degree perpendicular flat-lay angle looking straight down at the horizontal garment plane. Do not use low, eye-level, or oblique angles that would foreshorten the flat lay.';
      break;

    case 'folded-full-graphic':
      if (effectiveCameraAngle === 'gentle-overhead') {
        angleDesc =
          'Camera positioned at a near-overhead 80–90 degree catalog viewpoint looking straight down at the neatly folded garment so the entire chest graphic is flat and legible.';
      } else {
        angleDesc =
          'Camera positioned at a slightly elevated, near-front diagonal viewpoint (approximately 30–45 degrees looking down at the tabletop) so the entire folded chest panel and printed graphic remain completely exposed and undistorted.';
      }
      break;

    case 'compact-boutique-fold':
      angleDesc =
        'Camera positioned at an elevated three-quarter viewpoint (approximately 35–45 degrees elevation) revealing both the exposed collar/graphic on the top fold plane and the realistic thickness and clean edges of the folded fabric.';
      break;

    case 'hoodie-hood-displayed':
      angleDesc =
        'Camera positioned at an elevated three-quarter viewpoint (approximately 35–50 degrees elevation) looking down at the folded hoodie so the chest graphic, drawstrings, and hood arranged behind or above the chest panel are all clearly visible without obstruction.';
      break;

    case 'layered-folded-stack':
      angleDesc =
        'Camera positioned at an elevated three-quarter viewpoint (approximately 30–45 degrees elevation) capturing the full printed graphic on the top hero garment while revealing the slightly offset folded garments stacked beneath it.';
      break;

    case 'three-quarter-tabletop':
      angleDesc =
        'Camera elevated approximately 30–45 degrees in a balanced three-quarter tabletop perspective, capturing natural fabric depth and soft shadows while keeping the front graphic undistorted.';
      break;

    case 'low-angle-tabletop':
      angleDesc =
        'Camera positioned low and close to the tabletop surface (approximately 10–20 degrees elevation), looking slightly across the garment to emphasize fabric thickness, seam height, and textile texture while strictly avoiding extreme wide-angle perspective distortion.';
      break;

    case 'hanger-presentation':
      angleDesc =
        effectiveCameraAngle === 'three-quarter'
          ? 'Camera positioned at a subtle front-facing three-quarter eye-level studio perspective perpendicular to the hanging garment, keeping the front graphic completely visible and undistorted.'
          : 'Camera positioned directly straight-on at eye level, perpendicular to the hanging garment for a clean, front-facing studio presentation with zero perspective skew.';
      break;

    case 'ghost-mannequin':
      angleDesc =
        effectiveCameraAngle === 'three-quarter'
          ? 'Camera positioned at a subtle three-quarter catalog perspective at chest level, highlighting the three-dimensional hollow garment silhouette and front graphic.'
          : 'Camera positioned straight-on at chest level, perpendicular to the three-dimensional ghost-mannequin garment silhouette for standardized e-commerce catalog uniformity.';
      break;

    case 'front-and-back':
      angleDesc =
        effectiveCameraAngle === 'gentle-overhead'
          ? 'Camera positioned directly overhead at 90 degrees above the side-by-side front and back garments, ensuring identical scale and zero distortion.'
          : 'Camera positioned directly straight-on and perpendicular to the side-by-side front and back garments, ensuring even framing and zero perspective distortion across both views.';
      break;

    case 'close-up-detail':
      angleDesc =
        'Camera positioned close to the garment at a clean perpendicular or gently elevated macro angle focused tightly on the actual print, collar ribbing, stitching, and fabric weave.';
      break;
  }

  const overrideNote = wasCameraOverridden
    ? `\n• Camera Precedence Note: Presentation camera geometry (${effectiveCameraAngle}) takes precedence over incompatible angle settings to ensure the ${CLOTHING_PRESENTATION_PRESETS[presentation].label.toLowerCase()} arrangement is physically coherent and the artwork remains clearly visible.`
    : '';

  let perspectiveDesc = 'Natural optical perspective with zero wide-angle distortion.';
  if (perspective === 'slightly-compressed') {
    perspectiveDesc =
      'Slightly compressed optical perspective for clean garment lines and accurate proportions.';
  } else if (perspective === 'moderate-perspective') {
    perspectiveDesc =
      'Moderate optical perspective providing tangible three-dimensional textile depth.';
  } else if (perspective === 'intimate-close' || presentation === 'close-up-detail') {
    perspectiveDesc =
      'Intimate close optical perspective drawing the viewer directly to tactile fabric weave and print ink detail.';
  }

  let focalDesc = 'Medium format 80mm prime lens rendering true-to-life garment geometry.';
  if (presentation === 'close-up-detail' || focal === 'macro-detail') {
    focalDesc =
      '120mm macro lens character rendering razor-sharp textile micro-weave, stitching, and screen-print detail.';
  } else if (focal === 'short-telephoto' || presentation === 'low-angle-tabletop') {
    focalDesc =
      '100mm short telephoto lens character for crisp edge definition and controlled perspective without foreshortening distortion.';
  } else if (focal === 'portrait-like') {
    focalDesc = '85mm portrait lens character delivering elegant subject isolation.';
  } else if (focal === 'longer-compressed') {
    focalDesc = '150mm compressed perspective lens character for calm, orderly studio composition.';
  }

  let dofDesc =
    'f/5.6 aperture providing tack-sharp clarity across the entire garment and printed graphic with gentle, organic depth falloff in the background.';
  if (dof === 'deep-clarity' || presentation === 'front-and-back') {
    dofDesc =
      'f/8 deep depth of field keeping the entire garment silhouette, edges, and printed artwork in tack-sharp clarity.';
  } else if (dof === 'moderate-depth') {
    dofDesc =
      'f/4.5 moderate depth of field keeping the main printed chest face sharp with soft, natural background falloff.';
  } else if (dof === 'shallow-editorial') {
    dofDesc =
      'f/2.8 shallow editorial depth of field focusing tack-sharp on the primary printed artwork and collar details while background elements melt into soft bokeh.';
  }

  return `CAMERA & VIEWPOINT DIRECTION (PRESENTATION-ALIGNED):
• Shot Type: ${shotDesc}
• Angle & Viewpoint: ${angleDesc}${overrideNote}
• Optical Perspective: ${perspectiveDesc}
• Focal Character: ${focalDesc}
• Depth of Field: ${dofDesc}`;
}

/**
 * Generates surface staging text for clothing, ensuring vertical presentations (hanger, ghost mannequin)
 * are never contradictorily described as resting on a tabletop.
 */
export function getClothingSurfaceOverride(options: PromptOptions): string | null {
  if (!isClothingProduct(options.productType)) return null;
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );

  if (presentation === 'hanger-presentation') {
    return 'Vertical Hanger Staging: The garment hangs freely in vertical studio space from a simple, unobtrusive, unbranded hanger against the clean studio backdrop, with no tabletop surface cutting across or supporting the garment.';
  }
  if (presentation === 'ghost-mannequin') {
    return 'Three-Dimensional Studio Suspension: The garment is presented upright in clean studio space with a natural 3D hollow torso silhouette and soft ambient studio grounding, rather than resting on a tabletop surface.';
  }
  return null;
}

/**
 * Generates composition overrides for specialized clothing presentations (diagonal, front-and-back, close-up, stack).
 */
export function getClothingCompositionNote(options: PromptOptions): string {
  if (!isClothingProduct(options.productType)) return '';
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );

  switch (presentation) {
    case 'diagonal-flat-lay':
      return '\n• Garment Alignment: Rotate the garment approximately 15–30 degrees relative to the frame edges while keeping the composition balanced and the front graphic completely legible.';
    case 'front-and-back':
      return '\n• Dual-View Layout: Arrange the front view on the left and the back view on the right with even horizontal spacing, identical garment scale, and clean negative space around both views.';
    case 'close-up-detail':
      return '\n• Macro Detail Cropping: Frame tightly on the actual printed graphic, fabric texture, collar, or stitching so the craftsmanship and exact design details fill the composition cleanly.';
    case 'layered-folded-stack':
      return '\n• Stacked Alignment: Offset the 2–3 folded garments slightly to reveal the layered edges while keeping the top hero garment and its full printed design centered and unobstructed.';
    default:
      return '';
  }
}

/**
 * Generates shared + garment-specific product fidelity directives reinforcing Requirement 5.
 */
export function getClothingFidelityDirectives(
  options: PromptOptions,
  garmentSpecificDirectives: string[]
): string[] {
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );

  const universalClothingDirectives: string[] = [
    ...garmentSpecificDirectives,
    'PRESERVE ORIGINAL ARTWORK & LETTERING: Faithfully preserve the supplied artwork, lettering, exact spelling, colors, proportions, and placement. Do NOT redesign, reinterpret, or regenerate the graphic.',
    'NO INVENTED GRAPHICS OR EMBELLISHMENTS: Do not add invented text, logos, neck labels, sleeve tags, embellishments, or decorative elements anywhere on the garment.',
    presentation === 'close-up-detail'
      ? 'FAITHFUL CLOSE-UP REPRODUCTION: Reproduce the exact ink/print texture, typography, fabric weave, collar ribbing, and stitching of the supplied design without inventing any new graphic details.'
      : 'UNOBSTRUCTED & UNDISTORTED GRAPHIC: Keep the printed graphic completely visible, unobstructed, and undistorted across the chest/garment panel.',
    'REALISTIC GARMENT CONSTRUCTION & DRAPE: Maintain authentic garment construction, seams, collar shape, sleeves, folds, and realistic fabric texture. Avoid excessive wrinkles, malformed sleeves, implausible garment geometry, and distracting props.',
    'DO NOT INVENT BACK DETAILS: Do not invent graphics, text, seams, or details on the back of the garment when they are not supplied in the reference.',
  ];

  if (presentation === 'hanger-presentation') {
    universalClothingDirectives.push(
      'HANGER PRESENTATION RULES: Hang the garment naturally from a single simple, unobtrusive, unbranded hanger with realistic shoulder support and vertical fabric drape. No visible person or mannequin.'
    );
  } else if (presentation === 'ghost-mannequin') {
    universalClothingDirectives.push(
      'GHOST MANNEQUIN RULES: Render a natural three-dimensional hollow clothing silhouette with realistic collar opening, shoulder structure, and sleeves. Strictly no visible person, body, mannequin neck-block, or hanger.'
    );
  } else {
    universalClothingDirectives.push(
      'STANDALONE PRODUCT STAGING: Render strictly as a standalone physical garment with no human models, visible necks, hands, mannequins, or hangers.'
    );
  }

  return universalClothingDirectives;
}

/**
 * Generates clothing-specific negative exclusions that never conflict with hanger or ghost-mannequin presets.
 */
export function getClothingNegativeExclusions(options: PromptOptions): string[] {
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );

  const exclusions: string[] = [
    'Do NOT redesign, reinterpret, regenerate, warp, or stretch the supplied artwork, lettering, or spelling',
    'Do NOT add invented text, logos, embellishments, decorative elements, or unrequested back prints/details',
    'Avoid excessive wrinkles, messy crumpling, malformed sleeves, or implausible garment geometry',
    'No distracting props overlapping or obscuring the garment graphic',
  ];

  if (presentation === 'hanger-presentation') {
    exclusions.push(
      'No human models, no visible necks, no hands, no mannequins; use only one simple, unobtrusive, unbranded hanger'
    );
  } else if (presentation === 'ghost-mannequin') {
    exclusions.push(
      'No human models, no visible skin or necks, no visible mannequin plastic/hardware/stands, no hangers'
    );
  } else {
    exclusions.push(
      'No human models, no visible necks, no mannequins, no hangers'
    );
  }

  if (options.productType === 'hoodie') {
    exclusions.push('Do not flatten or crumple the hood into an unnatural or rigid lump');
  }

  return exclusions;
}

/**
 * Generates the Gemini-optimized orientation & arrangement description for clothing products.
 */
export function getClothingGeminiOrientationDesc(options: PromptOptions): string {
  const presentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );
  const garment = getGarmentNoun(options.productType);

  switch (presentation) {
    case 'classic-symmetrical-flat-lay':
      return `Classic symmetrical flat-lay view (${presentation}): Architectural 90-degree overhead flat-lay view, with the ${garment} lying completely flat and centered on the tabletop surface, sleeves arranged evenly and symmetrically, and the front printed graphic fully visible and unobstructed.`;

    case 'diagonal-flat-lay':
      return `Diagonal flat-lay view (${presentation}): Architectural 90-degree overhead flat-lay view, with the ${garment} lying flat on the tabletop surface rotated approximately 15 to 30 degrees relative to the image edges in a natural, balanced composition with the front printed graphic fully visible.`;

    case 'relaxed-natural-flat-lay':
      return `Relaxed natural flat-lay view (${presentation}): Architectural 90-degree overhead flat-lay view, with the ${garment} lying flat on the tabletop surface with natural fabric drape, gentle folds, and loosely arranged sleeves without excessive wrinkling, keeping the front graphic completely unobstructed.`;

    case 'asymmetrical-sleeve-flat-lay':
      return `Asymmetrical sleeve flat-lay view (${presentation}): Architectural 90-degree overhead flat-lay view, with the ${garment} lying flat on the tabletop surface and one sleeve positioned differently from the other for visual variety while retaining a balanced silhouette and keeping the front graphic completely visible.`;

    case 'editorial-flat-lay-with-props':
      return `Editorial flat-lay with props (${presentation}): Architectural 90-degree overhead flat-lay view, with the ${garment} lying flat on the tabletop surface as the main hero subject accompanied by one or two restrained, contextually appropriate props placed strictly clear of the garment so they never overlap the printed design.`;

    case 'folded-full-graphic':
      return `Folded with full graphic visible (${presentation}): Neatly folded rectangular presentation and resting flat on the tabletop surface, with the front printed graphic facing upward toward the camera, the printed chest panel completely exposed, and soft, natural fabric folds.`;

    case 'compact-boutique-fold':
      return `Compact boutique fold (${presentation}): Compact, carefully arranged boutique fold resting flat on the tabletop surface with realistic fabric thickness and clean edges, keeping the collar and as much of the front printed graphic as possible clearly visible facing upward.`;

    case 'hoodie-hood-displayed':
      return `Hoodie with hood displayed (${presentation}): Neatly folded heavyweight hoodie body resting flat on the tabletop surface with the hood arranged naturally behind or above the chest panel, drawstrings visible where applicable, and the front printed graphic facing upward and completely unobstructed.`;

    case 'layered-folded-stack':
      return `Layered folded stack (${presentation}): Two or three neatly folded ${garment}s arranged in an offset stack resting flat on the tabletop surface; the top ${garment} is the hero product with its full front printed graphic facing upward and completely visible, while lower garments never obscure the main design.`;

    case 'three-quarter-tabletop':
      return `Three-quarter tabletop presentation (${presentation}): Naturally arranged on the flat tabletop surface with realistic fabric depth, gentle contours, and soft contact shadows, keeping the front printed graphic undistorted and clearly visible.`;

    case 'low-angle-tabletop':
      return `Low-angle tabletop presentation (${presentation}): Naturally arranged on the flat tabletop surface and viewed from a low, near-surface angle looking slightly across the ${garment} to emphasize fabric thickness, weave, and seam construction while avoiding extreme perspective distortion.`;

    case 'hanger-presentation':
      return `Hanger presentation (${presentation}): Hanging naturally in a front-facing vertical presentation from a simple, unobtrusive, unbranded hanger against a clean studio background with realistic fabric draping, no visible person, and the front printed graphic fully visible.`;

    case 'ghost-mannequin':
      return `Ghost mannequin presentation (${presentation}): Natural three-dimensional hollow clothing silhouette with realistic collar, shoulders, sleeves, and fabric construction, with no visible person, mannequin hardware, or hanger, displaying the front printed graphic clearly.`;

    case 'front-and-back':
      return `Front-and-back presentation (${presentation}): Front and back views of the ${garment} arranged cleanly side by side, preserving the actual supplied design on each side without inventing any unrequested back graphics or details.`;

    case 'close-up-detail':
      return `Close-up detail presentation (${presentation}): Tight close-up detail crop of the actual print, fabric weave, collar ribbing, or stitching on the ${garment}, prioritizing faithful reproduction of the supplied design without inventing lettering or features.`;
  }
}

/**
 * Generates the Gemini-optimized camera description for clothing products, respecting camera precedence.
 */
export function getClothingGeminiCameraDesc(options: PromptOptions): string {
  const { presentation, effectiveCameraAngle } = resolveClothingCamera(options);
  const ratio = options.aspectRatio || '1:1';
  const shotText =
    presentation === 'close-up-detail'
      ? 'close-up macro detail framing'
      : options.shotType
      ? options.shotType.replace(/-/g, ' ')
      : 'hero product framing';

  let angleInstruction = '';
  switch (presentation) {
    case 'classic-symmetrical-flat-lay':
    case 'diagonal-flat-lay':
    case 'relaxed-natural-flat-lay':
    case 'asymmetrical-sleeve-flat-lay':
    case 'editorial-flat-lay-with-props':
      angleInstruction =
        'Overhead 90-degree flat-lay camera looking straight down at the product resting flat on the tabletop surface';
      break;

    case 'folded-full-graphic':
      angleInstruction =
        effectiveCameraAngle === 'gentle-overhead'
          ? 'Overhead 85–90 degree catalog camera looking straight down at the folded garment chest panel'
          : 'Slightly elevated, near-front diagonal camera angle (approximately 30–45 degrees elevation) looking down at the folded garment so the full printed chest panel is exposed and undistorted';
      break;

    case 'compact-boutique-fold':
    case 'hoodie-hood-displayed':
    case 'layered-folded-stack':
      angleInstruction =
        'Elevated three-quarter camera view (approximately 35–45 degrees elevation) capturing the exposed front graphic panel alongside realistic folded fabric thickness and clean edges';
      break;

    case 'three-quarter-tabletop':
      angleInstruction =
        'Camera elevated approximately 30–45 degrees in a three-quarter tabletop perspective looking down at the garment with realistic depth and undistorted graphic geometry';
      break;

    case 'low-angle-tabletop':
      angleInstruction =
        'Low-angle tabletop camera positioned close to the surface looking slightly across the garment to emphasize fabric thickness and texture without extreme perspective distortion';
      break;

    case 'hanger-presentation':
      angleInstruction =
        effectiveCameraAngle === 'three-quarter'
          ? 'Front-facing subtle three-quarter studio camera at eye level perpendicular to the hanging garment'
          : 'Camera positioned directly straight-on at eye level perpendicular to the hanging garment';
      break;

    case 'ghost-mannequin':
      angleInstruction =
        effectiveCameraAngle === 'three-quarter'
          ? 'Standardized three-quarter catalog camera at chest level capturing the 3D ghost-mannequin garment silhouette'
          : 'Camera positioned directly straight-on at chest level capturing the 3D ghost-mannequin garment silhouette';
      break;

    case 'front-and-back':
      angleInstruction =
        effectiveCameraAngle === 'gentle-overhead'
          ? 'Overhead 90-degree catalog camera looking straight down at the side-by-side front and back garment views'
          : 'Camera positioned directly straight-on perpendicular to the side-by-side front and back garment views';
      break;

    case 'close-up-detail':
      angleInstruction =
        'Close macro detail camera positioned perpendicular or slightly elevated to capture razor-sharp print, collar, stitching, and fabric weave fidelity';
      break;
  }

  return `${angleInstruction}, ${shotText}, crisp edge definition, ${ratio} aspect ratio, gentle organic depth of field.`;
}

export interface SharedClothingGarmentConfig {
  productTypeName: string;
  productDescription: string;
  garmentSpecificDirectives: string[];
}

export function generateClothingPrompt(
  options: PromptOptions,
  config: SharedClothingGarmentConfig
): string {
  const resolvedPresentation = resolveClothingPresentation(
    options.productType,
    options.clothingPresentation,
    options.orientation
  );
  const { effectiveCameraAngle } = resolveClothingCamera(options);
  const preset = CLOTHING_PRESENTATION_PRESETS[resolvedPresentation];

  const normalizedOptions: PromptOptions = {
    ...options,
    clothingPresentation: resolvedPresentation,
    orientation: preset.baseOrientation,
    cameraAngle: effectiveCameraAngle,
  };

  return buildMasterPhotographyPrompt(normalizedOptions, {
    productTypeName: config.productTypeName,
    productDescription: config.productDescription,
    productOrientationText: getClothingOrientationPromptText(normalizedOptions),
    productFidelityDirectives: getClothingFidelityDirectives(
      normalizedOptions,
      config.garmentSpecificDirectives
    ),
    productSpecificExclusions: getClothingNegativeExclusions(normalizedOptions),
  });
}
