import {
  BackgroundStyle,
  SurfaceStyle,
  PropsStyle,
  AspectRatio,
  PromptOptions,
} from '../types';

export function getBackgroundPromptText(bg: BackgroundStyle, surface?: SurfaceStyle): string {
  switch (bg) {
    case 'neutral-editorial':
      return 'Neutral Editorial Studio: A realistic, light neutral studio environment with clean, understated background tones (warm alabaster, soft off-white, or gentle pale concrete). Soft, diffused natural studio illumination with subtle light falloff. The background provides generous, calm negative space that keeps the product firmly as the central focal point.';

    case 'science-gradient':
      return 'Science of Gifts Gradient Studio Backdrop: A deliberate photographic studio cyclorama or physical curved wall bathed in soft physical studio lighting that transitions subtly from calming powder blue (#A8C5DA / #8EAEC8) into delicate seafoam mint (#BCE3D8 / #A8D5C8). This must appear as authentic physical studio lighting on a tangible matte surface with natural light falloff, diffuse ambient glow, and organic shadow gradation—STRICTLY avoiding flat digital vector fills or artificial neon saturation.';

    case 'gradient-wall-neutral-surface':
      return `Gradient Wall + Neutral Surface: A realistic editorial studio photograph featuring two distinct, physically grounded environmental zones:
  - Upper / Background Zone: The vertical studio wall incorporates the signature Science of Gifts soft powder-blue into seafoam-mint palette (#A8C5DA transitioning gently to #BCE3D8), behaving as a real painted, softly illuminated, or professionally designed studio backwall with subtle textural depth and gentle ambient falloff.
  - Lower Ground Zone: A tangible, realistic neutral physical surface (such as a natural stone slab, honed limestone, or pale matte wood tabletop) where the product firmly rests with authentic contact shadows and ambient occlusion.
  - Natural Photographic Transition: The boundary between the vertical gradient wall and the horizontal neutral tabletop must feel physically real and optical (a real tabletop resting in front of an illuminated studio wall), NOT a simple geometric division, flat color split, or 70%/30% vector line. The product remains the tack-sharp visual focus.`;

    case 'blue-wall-neutral-surface':
      return 'Blue Wall + Neutral Surface: A realistic studio setting featuring a soft, muted powder-blue vertical backwall (#A8C5DA / #93B5CF) with subtle matte architectural texture and gentle directional light falloff, paired with a realistic neutral physical tabletop or surface in the foreground. The neutral surface grounds the product with authentic contact shadows while the refined soft blue wall provides tranquil, elegant depth.';

    case 'mint-wall-neutral-surface':
      return 'Mint Wall + Neutral Surface: A realistic studio setting featuring a soft, muted seafoam-mint vertical backwall (#BCE3D8 / #A8D5C8) with subtle matte architectural texture and gentle ambient light gradation, paired with a realistic neutral physical tabletop or surface in the foreground. The neutral surface grounds the product with authentic contact shadows while the soothing mint wall provides a fresh, sophisticated editorial backdrop.';

    case 'branded-editorial-environment':
      return 'Branded Editorial Environment: A sophisticated three-dimensional editorial environment integrating the Science of Gifts blue and mint palette subtly throughout the background architecture, lighting, and soft atmospheric accents, while retaining realistic neutral physical surfaces and materials. The signature colors are woven quietly into soft ambient bounces and environmental depths rather than a single flat backdrop, creating a premium lifestyle catalog aesthetic where the product remains the undisputed hero.';

    case 'dark-editorial':
      return 'Dark Editorial Studio: A sophisticated darker studio environment utilizing deep muted charcoal, subtle graphite, and velvety soft shadows with restrained, sculpted key lighting. Realistic physical materials and surfaces with rich contrast, subtle rim illumination, and dramatic yet quiet luxury.';

    case 'custom':
      return 'Custom Background Environment: The background environment is custom-configured according to the specific directions provided in the Additional Instructions section below. The scene must maintain authentic photographic studio lighting, natural depth of field, and physical material realism that keeps the hero product in sharp, prominent focus.';

    default:
      return 'Clean minimalist studio backdrop with soft, diffused illumination.';
  }
}

export function getSurfacePromptText(surface: SurfaceStyle): string {
  switch (surface) {
    case 'editorial-tabletop':
      return 'Editorial tabletop: resting firmly on a honed pale travertine limestone slab or natural light white oak surface, featuring subtle tactile texture, realistic micro-bevels, and soft, natural contact shadows.';
    case 'light-stone':
      return 'Light stone surface: resting on a pale honed limestone or fine-grain architectural terrazzo surface with subtle organic mineral specks and soft ambient occlusion.';
    case 'dark-matte':
      return 'Dark matte surface: resting on a deep charcoal matte slate or dark honed stone surface with subtle rim light reflection and rich, grounded contact shadows.';
    case 'soft-fabric':
      return 'Soft fabric surface: resting upon naturally draped heavyweight unbleached raw linen with gentle organic folds and tactile textile weave.';
    case 'no-visible-surface':
      return 'No visible surface: the product floats seamlessly in atmospheric negative space with subtle diffuse glow, zero floor boundary, and soft ethereal presence.';
    default:
      return 'Pristine neutral tabletop surface with natural contact shadows.';
  }
}

export function getPropsPromptText(props: PropsStyle): string {
  switch (props) {
    case 'none':
      return 'Props: Strictly none. Pure minimalist hero composition with generous negative space, keeping 100% of viewer attention on the product.';
    case 'minimal-subtle':
      return 'Props: Minimal subtle props—a single delicate dry botanical stem or one pale geometric ceramic block softly blurred in the background (f/4 shallow depth of field).';
    case 'subtle-historical':
      return 'Props: Subtle historical props reflecting Science of Gifts intellectual heritage—a vintage brass caliper, a small antique astronomical chart fragment, or an archival brass magnifying glass placed quietly in the soft background with shallow depth of field.';
    case 'books-ephemera':
      return 'Props: Books and paper ephemera—two antique cloth-bound scientific volumes with gilded lettering or deckle-edge archival cotton paper sketches placed discreetly in the soft background.';
    case 'seasonal-subtle':
      return 'Props: Seasonal subtle props—understated organic accents such as dried eucalyptus pods, subtle pressed archival leaves, or delicate pine cones arranged with utmost restraint.';
    default:
      return 'Props: Strictly none. Pure minimalist composition.';
  }
}

export function formatReferenceHeader(hasReferenceImage?: boolean, referenceImageName?: string): string {
  if (hasReferenceImage) {
    const filenameInfo = referenceImageName ? ` (${referenceImageName})` : '';
    return `[REFERENCE PRODUCT ATTACHED${filenameInfo}: Use the uploaded product image as the absolute, definitive source of truth for the physical object.]`;
  }
  return `[SOURCE OF TRUTH DIRECTIVE: Treat the reference product as the definitive standard for all design, typography, and construction.]`;
}

export function formatTechnicalSettings(aspectRatio: AspectRatio): string {
  return `TECHNICAL & CAMERA SETTINGS:
• Shot on: Medium format digital camera (Hasselblad H6D-100c / Phase One XF IQ4)
• Lens: 80mm prime macro lens at f/5.6 for tack-sharp product focus with gentle, natural depth of field falloff in the background
• Color Grading: Clean, authentic color reproduction matching the reference product accurately, true-to-life white balance, soft contrast curve
• Aspect Ratio: ${aspectRatio}`;
}

export function formatNegativeExclusions(extraExclusions: string[] = []): string {
  const defaultExclusions = [
    'No human models, no visible hands, no people, no phantom mannequins',
    'No artificial watermarks, no copyright text, no promotional badges, no floating graphic overlays',
    'No 3D CGI cartoon look, no oversaturated illustration style, no plastic skinning',
    'No flat digital gradients, no vector graphic color fills, no artificial color blocks',
    'No excessive color saturation; the background must never overpower the hero product',
    'Do NOT redesign, replace, or invent new graphics or text on the product',
  ];

  const allExclusions = [...defaultExclusions, ...extraExclusions];
  return `STRICT EXCLUSIONS (NEGATIVE PROMPTS):
${allExclusions.map((item) => `• ${item}`).join('\n')}`;
}

export function formatAdditionalInstructions(instructions?: string): string {
  if (!instructions || !instructions.trim()) {
    return '';
  }
  return `\nADDITIONAL INSTRUCTIONS:\n${instructions.trim()}\n`;
}
