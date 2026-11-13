import {
  BackgroundStyle,
  CameraAngle,
  ColorPalette,
  LightingStyle,
  PhotographyTheme,
  ProductOrientation,
  ProductType,
  ShadowCharacter,
  SurfaceStyle,
} from '../types';
import { GenerationSettings } from '../../types';
import {
  CLOTHING_PRESENTATION_PRESETS,
  isClothingProduct,
  resolveClothingCamera,
  resolveClothingPresentation,
} from '../image/clothing';
import { normalizeAspectRatio } from './studioOptions';

export type ProductFormFactor =
  | 'flat-accessory'
  | 'garment'
  | 'vessel'
  | 'book-or-notebook'
  | 'wall-art-print'
  | 'three-dimensional-object';

export interface ProductRecognitionResult {
  productType: ProductType;
  customProductType: string;
  detectedLabel: string;
  surfaceFormFactor: ProductFormFactor;
  confidence: 'high' | 'medium' | 'low';
  briefNotes: string;
}

const FLAT_ACCESSORY_KEYWORDS = [
  'desk mat',
  'deskmat',
  'mousepad',
  'mouse pad',
  'laptop sleeve',
  'tablet sleeve',
  'placemat',
  'coaster',
  'sticker',
  'bookmark',
  'tote',
  'pouch',
  'mat',
  'pad',
  'sleeve',
  'patch',
];

const WALL_ART_KEYWORDS = ['poster', 'print', 'canvas', 'wall art', 'framed art', 'chart'];

function inferFormFactorForOther(customLabel: string, fallback: ProductFormFactor): ProductFormFactor {
  const lower = customLabel.toLowerCase();
  if (FLAT_ACCESSORY_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'flat-accessory';
  }
  if (WALL_ART_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'wall-art-print';
  }
  if (lower.includes('notebook') || lower.includes('journal') || lower.includes('book')) {
    return 'book-or-notebook';
  }
  return fallback;
}

/**
 * Applies Gemini product recognition to photography settings while preserving
 * user-controlled frame constraints (aspectRatio, additionalInstructions, websiteCropSafe)
 * and honoring all existing clothing compatibility rules.
 */
export function applySmartSetupToSettings(
  recognition: ProductRecognitionResult,
  currentSettings: GenerationSettings
): GenerationSettings {
  const productType = recognition.productType;
  const customProductType =
    productType === 'other' ? recognition.customProductType.trim() : undefined;

  const basePreserved: GenerationSettings = {
    ...currentSettings,
    aspectRatio: normalizeAspectRatio(currentSettings.aspectRatio, '3:4'),
    productType,
    customProductType,
  };

  if (isClothingProduct(productType)) {
    // T-shirts, sweatshirts, hoodies default to flat-lay overhead with front artwork fully visible
    const desiredPresentation =
      productType === 'hoodie' ? 'relaxed-natural-flat-lay' : 'classic-symmetrical-flat-lay';
    const resolvedPresentation = resolveClothingPresentation(
      productType,
      desiredPresentation,
      'flat-lay'
    );
    const preset = CLOTHING_PRESENTATION_PRESETS[resolvedPresentation];
    const resolvedCamera = resolveClothingCamera({
      ...basePreserved,
      orientation: preset.baseOrientation,
      clothingPresentation: resolvedPresentation,
      cameraAngle: preset.defaultCameraAngle,
    });

    return {
      ...basePreserved,
      orientation: preset.baseOrientation,
      clothingPresentation: resolvedPresentation,
      cameraAngle: resolvedCamera.effectiveCameraAngle,
      shotType: 'hero-product',
      perspective: 'natural',
      focalLength: 'normal-editorial',
      depthOfField: 'gentle-falloff',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  if (productType === 'notebook') {
    return {
      ...basePreserved,
      clothingPresentation: undefined,
      orientation: 'flat-lay',
      cameraAngle: 'gentle-overhead',
      shotType: 'hero-product',
      perspective: 'natural',
      focalLength: 'normal-editorial',
      depthOfField: 'deep-clarity',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  if (
    productType === 'mug' ||
    productType === 'glass' ||
    productType === 'waterBottle' ||
    productType === 'tumbler'
  ) {
    return {
      ...basePreserved,
      clothingPresentation: undefined,
      orientation: 'upright',
      cameraAngle: 'three-quarter',
      shotType: 'hero-product',
      perspective: 'natural',
      focalLength: 'normal-editorial',
      depthOfField: 'gentle-falloff',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  if (productType === 'poster') {
    return {
      ...basePreserved,
      clothingPresentation: undefined,
      orientation: 'upright',
      cameraAngle: 'straight-on',
      shotType: 'hero-product',
      perspective: 'slightly-compressed',
      focalLength: 'normal-editorial',
      depthOfField: 'deep-clarity',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  // productType === 'other'
  const effectiveFormFactor = inferFormFactorForOther(
    recognition.customProductType || recognition.detectedLabel || '',
    recognition.surfaceFormFactor
  );

  if (effectiveFormFactor === 'flat-accessory' || effectiveFormFactor === 'book-or-notebook') {
    return {
      ...basePreserved,
      clothingPresentation: undefined,
      orientation: 'flat-lay',
      cameraAngle: 'gentle-overhead',
      shotType: 'hero-product',
      perspective: 'natural',
      focalLength: 'normal-editorial',
      depthOfField: 'deep-clarity',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  if (effectiveFormFactor === 'wall-art-print') {
    return {
      ...basePreserved,
      clothingPresentation: undefined,
      orientation: 'upright',
      cameraAngle: 'straight-on',
      shotType: 'hero-product',
      perspective: 'slightly-compressed',
      focalLength: 'normal-editorial',
      depthOfField: 'deep-clarity',
      compositionStyle: 'centered',
      negativeSpace: 'balanced',
      productPosition: 'centered',
      productPresentation: 'editorial',
    };
  }

  // vessel or three-dimensional-object
  return {
    ...basePreserved,
    clothingPresentation: undefined,
    orientation: 'upright',
    cameraAngle: 'three-quarter',
    shotType: 'hero-product',
    perspective: 'natural',
    focalLength: 'normal-editorial',
    depthOfField: 'gentle-falloff',
    compositionStyle: 'centered',
    negativeSpace: 'balanced',
    productPosition: 'centered',
    productPresentation: 'editorial',
  };
}

/**
 * Formats a compact human-readable presentation summary for the UI badge.
 */
export function formatPresentationSummary(settings: GenerationSettings): string {
  const orientationLabel = settings.orientation.replace(/-/g, ' ');
  if (isClothingProduct(settings.productType)) {
    const pres = resolveClothingPresentation(
      settings.productType,
      settings.clothingPresentation,
      settings.orientation
    );
    const preset = CLOTHING_PRESENTATION_PRESETS[pres];
    const cam = resolveClothingCamera(settings);
    const angleText =
      cam.effectiveCameraAngle === 'gentle-overhead'
        ? '90° overhead'
        : cam.effectiveCameraAngle.replace(/-/g, ' ');
    return `${preset.label} • ${angleText}`;
  }

  const angleLabel = (settings.cameraAngle || 'three-quarter').replace(/-/g, ' ');
  return `${orientationLabel} • ${angleLabel}`;
}

// ==========================================
// Curated Editorial Studio Looks (Next Look)
// ==========================================

export interface CuratedStudioLook {
  id: string;
  name: string;
  subtitle: string;
  colorFamily: string;
  background: BackgroundStyle;
  surface: SurfaceStyle;
  colorPalette: ColorPalette;
  lightingStyle: LightingStyle;
  shadowCharacter: ShadowCharacter;
  theme: PhotographyTheme;
  preferredAngleVariant: 'primary' | 'elevated';
}

export const CURATED_STUDIO_LOOKS: CuratedStudioLook[] = [
  {
    id: 'powder-blue-limestone',
    name: 'Powder Blue & Light Limestone',
    subtitle: 'Muted powder-blue backwall with honed limestone',
    colorFamily: 'cool-blue',
    background: 'blue-wall-neutral-surface',
    surface: 'light-stone',
    colorPalette: 'powder-blue',
    lightingStyle: 'soft-daylight',
    shadowCharacter: 'soft',
    theme: 'editorial-still-life',
    preferredAngleVariant: 'primary',
  },
  {
    id: 'warm-ivory-white-oak',
    name: 'Warm Ivory & White Oak',
    subtitle: 'Alabaster daylight wall with pale white oak',
    colorFamily: 'warm-wood',
    background: 'warm-ivory',
    surface: 'light-wood',
    colorPalette: 'neutral-editorial',
    lightingStyle: 'warm-editorial',
    shadowCharacter: 'soft',
    theme: 'warm-minimal',
    preferredAngleVariant: 'elevated',
  },
  {
    id: 'seafoam-mint-pale-stone',
    name: 'Seafoam Mint & Pale Stone',
    subtitle: 'Soothing seafoam-mint backdrop on pale stone',
    colorFamily: 'cool-mint',
    background: 'mint-wall-neutral-surface',
    surface: 'light-stone',
    colorPalette: 'seafoam-mint',
    lightingStyle: 'gentle-window',
    shadowCharacter: 'soft',
    theme: 'natural-editorial',
    preferredAngleVariant: 'primary',
  },
  {
    id: 'soft-neutral-archival-paper',
    name: 'Soft Neutral & Archival Paper',
    subtitle: 'Clean neutral studio over 300 GSM cotton paper',
    colorFamily: 'neutral-paper',
    background: 'neutral-editorial',
    surface: 'paper-archival',
    colorPalette: 'neutral-editorial',
    lightingStyle: 'large-soft-studio',
    shadowCharacter: 'very-soft',
    theme: 'quiet-luxury',
    preferredAngleVariant: 'elevated',
  },
  {
    id: 'deep-editorial-slate',
    name: 'Deep Editorial Slate',
    subtitle: 'Sculpted studio light over charcoal slate',
    colorFamily: 'dark-slate',
    background: 'dark-editorial',
    surface: 'dark-matte',
    colorPalette: 'deep-editorial',
    lightingStyle: 'sculpted-studio',
    shadowCharacter: 'moderate',
    theme: 'sophisticated-dark',
    preferredAngleVariant: 'primary',
  },
  {
    id: 'branded-architectural-linen',
    name: 'Architectural Blue & Raw Linen',
    subtitle: '3D architectural studio with draped unbleached linen',
    colorFamily: 'linen-blue',
    background: 'branded-editorial-environment',
    surface: 'soft-fabric',
    colorPalette: 'blue-ivory',
    lightingStyle: 'side-lit-editorial',
    shadowCharacter: 'defined-natural',
    theme: 'contemporary',
    preferredAngleVariant: 'elevated',
  },
  {
    id: 'science-gradient-travertine',
    name: 'Science Blue-Mint & Travertine',
    subtitle: 'Signature blue-mint wall with honed travertine slab',
    colorFamily: 'signature-gradient',
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    colorPalette: 'science-blue-mint',
    lightingStyle: 'large-soft-studio',
    shadowCharacter: 'soft',
    theme: 'scientific',
    preferredAngleVariant: 'primary',
  },
  {
    id: 'luminous-cyclorama-oak',
    name: 'Luminous Cyclorama & Pale Oak',
    subtitle: 'Soft blue-to-mint cyclorama over matte white oak',
    colorFamily: 'cyclorama-oak',
    background: 'science-gradient',
    surface: 'light-wood',
    colorPalette: 'mint-ivory',
    lightingStyle: 'soft-daylight',
    shadowCharacter: 'very-soft',
    theme: 'intellectual',
    preferredAngleVariant: 'elevated',
  },
];

function resolveCompatibleAngleForLook(
  settings: GenerationSettings,
  variant: 'primary' | 'elevated'
): CameraAngle {
  const currentAngle = settings.cameraAngle || 'three-quarter';

  if (isClothingProduct(settings.productType)) {
    const pres = resolveClothingPresentation(
      settings.productType,
      settings.clothingPresentation,
      settings.orientation
    );
    const preset = CLOTHING_PRESENTATION_PRESETS[pres];
    if (preset.compatibleCameraAngles.length <= 1) {
      return preset.defaultCameraAngle;
    }

    // For vertical hanger/ghost-mannequin or front-and-back, keep front-facing stability
    if (
      pres === 'hanger-presentation' ||
      pres === 'ghost-mannequin' ||
      pres === 'front-and-back'
    ) {
      return preset.defaultCameraAngle;
    }

    // For folded / three-quarter tabletop clothing, allow only safe elevated variants
    const safeElevatedAngles = preset.compatibleCameraAngles.filter(
      (a) => a === 'three-quarter' || a === 'high-three-quarter' || a === 'slightly-elevated'
    );
    if (safeElevatedAngles.length <= 1) {
      return preset.defaultCameraAngle;
    }
    return variant === 'primary'
      ? safeElevatedAngles[0]
      : safeElevatedAngles.find((a) => a !== currentAngle) || safeElevatedAngles[1];
  }

  // Flat-lay items must always stay 90-degree overhead
  if (settings.orientation === 'flat-lay') {
    return 'gentle-overhead';
  }

  // Front-facing posters must stay straight-on so artwork isn't skewed
  if (settings.productType === 'poster' && settings.orientation === 'upright') {
    return 'straight-on';
  }

  // Upright 3D drinkware / objects can alternate smoothly between three-quarter and slightly-elevated
  if (settings.orientation === 'upright') {
    return variant === 'primary' ? 'three-quarter' : 'slightly-elevated';
  }

  if (settings.orientation === 'naturally-arranged') {
    return variant === 'primary' ? 'three-quarter' : 'slightly-elevated';
  }

  if (settings.orientation === 'folded') {
    return variant === 'primary' ? 'slightly-elevated' : 'high-three-quarter';
  }

  return currentAngle;
}

export interface NextLookResult {
  look: CuratedStudioLook;
  nextSettings: GenerationSettings;
  nextUsedLookIds: string[];
  didResetCycle: boolean;
  lookNumber: number;
  totalLooks: number;
}

/**
 * Selects the next visually distinct, coordinated studio look without repeating
 * until all looks are exhausted, and without altering product identity, orientation,
 * aspect ratio, or user-defined fidelity constraints.
 */
export function getNextStudioLook(
  currentSettings: GenerationSettings,
  usedLookIds: string[],
  currentLookId?: string | null
): NextLookResult {
  const usedSet = new Set(usedLookIds);

  // Also identify if currentSettings already matches a curated look (e.g. default settings)
  const matchingCurrentLook = CURATED_STUDIO_LOOKS.find(
    (look) =>
      look.id === currentLookId ||
      (look.background === currentSettings.background &&
        look.surface === currentSettings.surface &&
        look.colorPalette === currentSettings.colorPalette)
  );

  if (matchingCurrentLook) {
    usedSet.add(matchingCurrentLook.id);
  }

  let candidates = CURATED_STUDIO_LOOKS.filter((look) => !usedSet.has(look.id));
  let didResetCycle = false;

  if (candidates.length === 0) {
    // Exhausted all looks: start a fresh cycle, excluding the immediate current look
    didResetCycle = true;
    usedSet.clear();
    if (matchingCurrentLook) {
      usedSet.add(matchingCurrentLook.id);
    }
    candidates = CURATED_STUDIO_LOOKS.filter(
      (look) => look.id !== matchingCurrentLook?.id
    );
  }

  // Prefer a look whose background and surface both differ from currentSettings for clear visual contrast
  const highContrastCandidate = candidates.find(
    (look) =>
      look.background !== currentSettings.background &&
      look.surface !== currentSettings.surface &&
      look.colorFamily !== matchingCurrentLook?.colorFamily
  );

  const chosenLook = highContrastCandidate || candidates[0];

  const nextUsedLookIds = didResetCycle
    ? [chosenLook.id]
    : [...Array.from(new Set([...usedLookIds, ...(matchingCurrentLook ? [matchingCurrentLook.id] : [])])), chosenLook.id];

  const nextCameraAngle = resolveCompatibleAngleForLook(
    currentSettings,
    chosenLook.preferredAngleVariant
  );

  const nextSettings: GenerationSettings = {
    ...currentSettings,
    aspectRatio: normalizeAspectRatio(currentSettings.aspectRatio, '3:4'),
    background: chosenLook.background,
    surface: chosenLook.surface,
    colorPalette: chosenLook.colorPalette,
    lightingStyle: chosenLook.lightingStyle,
    shadowCharacter: chosenLook.shadowCharacter,
    theme: chosenLook.theme,
    cameraAngle: nextCameraAngle,
  };

  const lookIndex = CURATED_STUDIO_LOOKS.findIndex((l) => l.id === chosenLook.id);

  return {
    look: chosenLook,
    nextSettings,
    nextUsedLookIds,
    didResetCycle,
    lookNumber: lookIndex + 1,
    totalLooks: CURATED_STUDIO_LOOKS.length,
  };
}
