import { PromptOptions } from '../types';
import { buildImagePrompt } from '../image';

/**
 * Builds a prompt optimized for ChatGPT / DALL-E 3 / GPT-4o image generation and editing.
 */
export function buildChatGPTPhotoPrompt(options: PromptOptions): string {
  const basePrompt = buildImagePrompt(options);

  return `[CHATGPT IMAGE GENERATION & EDITING PROMPT (DALL-E 3 / GPT-4O OPTIMIZED)]

${basePrompt}

[CHATGPT EXECUTION DIRECTIVES]
• Treat the attached reference product image as the authoritative source of truth for the physical item, artwork, typography, and color palette.
• Strictly separate immutable product design elements from background, lighting, and surface staging.
• Ensure crisp visual clarity, natural depth, and professional commercial staging matching the requested aspect ratio (${options.aspectRatio}).`;
}

function getDetailedOrientationDesc(productType: string, orientation: string): string {
  switch (orientation) {
    case 'folded':
      if (productType === 'tshirt' || productType === 'hoodie') {
        return 'Neatly folded and resting flat on the tabletop surface, with the front printed graphic facing upward toward the camera and neatly centered in the frame with soft, natural fabric folds.';
      }
      if (productType === 'notebook') {
        return 'Neatly closed and resting flat on the tabletop surface with crisp corners and cover artwork facing upward.';
      }
      return 'Neatly folded and resting flat on the supporting tabletop surface, with the primary design facing upward.';

    case 'flat-lay':
      return 'Architectural 90-degree overhead flat-lay view, lying completely flat on the tabletop surface with generous negative space and precise planar alignment.';

    case 'naturally-arranged':
      return 'Naturally resting on the tabletop surface at a graceful editorial angle, with relaxed drape and organic positioning.';

    case 'upright':
    default:
      if (
        productType === 'mug' ||
        productType === 'glass' ||
        productType === 'waterBottle' ||
        productType === 'tumbler'
      ) {
        return 'Standing upright and resting firmly on its solid base upon the tabletop surface, with no suspension or invisible support, showing the frontal design and profile clearly.';
      }
      if (productType === 'poster') {
        return 'Framed and standing upright on a tabletop display easel or leaning steadily against the studio backwall surface.';
      }
      return 'Standing upright and resting firmly on the solid surface, supported naturally by its base.';
  }
}

function getDetailedCameraDesc(
  angle?: string,
  shot?: string,
  ratio: string = '1:1',
  orientation?: string,
  productType?: string
): string {
  let angleInstruction =
    'Camera positioned at a product-first catalog perspective (approximately 75 to 85 degrees elevation) looking down at the product resting on the surface';
  if (angle === 'straight-on') {
    angleInstruction =
      'Camera positioned directly straight-on at eye level, perpendicular to the product resting on the surface';
  } else if (angle === 'gentle-overhead' || orientation === 'flat-lay') {
    angleInstruction =
      'Overhead 90-degree flat-lay camera looking straight down at the product resting flat on the tabletop surface';
  } else if (orientation === 'folded' || orientation === 'flat-lay') {
    angleInstruction =
      'Product-first editorial framing using a moderately elevated to near-overhead viewpoint (approximately 80-90 degrees relative to the horizontal surface), keeping the product aligned with the central axis and occupying approximately 75 to 85 percent of image width for catalogue-ready thumbnail clarity';
  } else if (angle === 'slightly-elevated') {
    angleInstruction =
      'Camera positioned at a slightly elevated 25-degree angle looking down at the product resting on the surface';
  } else if (angle === 'three-quarter') {
    angleInstruction =
      'Camera positioned at a classic three-quarter viewpoint looking down at the product resting on the surface';
  }

  const shotText = shot ? shot.replace(/-/g, ' ') : 'hero product framing';
  return `${angleInstruction}, ${shotText}, crisp edge definition, ${ratio} aspect ratio, gentle organic depth of field.`;
}

function getCleanEnvDesc(
  bg: string,
  surface: string,
  lighting?: string,
  props?: string,
  propLevel?: string,
  orientation?: string
): string {
  const bgClean = bg.replace(/-/g, ' ');
  const surfaceClean = surface.replace(/-/g, ' ');
  const lightingClean = lighting ? lighting.replace(/-/g, ' ') : 'large soft studio lighting';

  let tableConstruction = `Construct a physically coherent studio scene with a substantial, solid tabletop or platform made from ${surfaceClean}. Give it believable thickness, authentic material texture (such as stone grain, pores, veining, or wood grain), and physically plausible edge geometry with a subtle bevel or rounded profile appropriate to the material.`;
  if (orientation === 'flat-lay') {
    tableConstruction = `Construct a continuous, physically coherent tabletop or platform surface made from ${surfaceClean} with authentic material texture (stone grain, pores, veining, or wood grain) viewed from an overhead flat-lay perspective where the outer edge extends naturally beyond the framing.`;
  }

  let propText = 'uncluttered staging with generous negative space';
  if (props && props !== 'none') {
    const isMinimal = propLevel === 'minimal';
    const propCountGuidance = isMinimal
      ? 'Prefer two distinct, complementary secondary props placed naturally in different areas of the scene with balanced scale and visual weight.'
      : 'Include curated secondary props.';

    propText = `${propCountGuidance} Secondary props must be non-intrusive, positioned strictly without obstructing the hero product. REALISTIC PROP FIDELITY & STRICT TEXT EXCLUSION: Secondary props must be believable physical objects with convincing material texture (such as natural leather grain, paper edges, ceramic glaze, metal patina, or plant leaf structure), natural highlights, realistic seams, and consistent lighting. Strictly prohibit any invented text, gibberish lettering, fake book titles, logos, labels, inscriptions, or watermarks. All secondary objects must remain unbranded, plain, and visually subordinate to the hero product`;
  }

  const sciencePaletteNote =
    bg.includes('blue') || bg.includes('mint') || bg.includes('science') || bg.includes('gradient')
      ? ' The surrounding studio wall features a visibly rich, softly illuminated powder-blue (#99BFF9) and seafoam-mint (#C3F3DF) cyclorama that continues naturally beyond the tabletop rear edge with consistent perspective, lighting, and contact shadows, forming one coherent physical scene.'
      : ` The surrounding studio wall or cyclorama continues naturally beyond the tabletop rear edge with consistent perspective, lighting, and contact shadows, forming one coherent physical scene.`;

  return `${tableConstruction}${sciencePaletteNote} Illuminated by ${lightingClean} with soft directional studio light creating clean dimension, moderately increased contrast with rich tonal separation, deep clean blacks retaining realistic fabric texture and detail, clear highlights, well-defined midtones, and subtle contact shadows grounding the object naturally. ${propText}.`;
}

/**
 * Builds a concise, directive, visually precise prompt optimized for Google Gemini
 * image generation, reference grounding, and multimodal editing across all 9 product categories.
 */
export function buildGeminiPhotoPrompt(options: PromptOptions): string {
  const isRef = options.hasReferenceImage;
  const refText = isRef
    ? `[REFERENCE PRODUCT ATTACHED${
        options.referenceImageName ? `: ${options.referenceImageName}` : ''
      }]: Use the uploaded product image as the absolute definitive source of truth for the physical object, exact artwork, typography, and color palette.`
    : `[SOURCE OF TRUTH]: Treat the reference product as the definitive standard for all design, artwork, and physical construction.`;

  let productLabel = 'Product';
  let keyFidelity = '';
  let keyExclusions = '';

  switch (options.productType) {
    case 'tshirt':
      productLabel = 'Apparel / T-shirt';
      keyFidelity =
        'Faithfully preserve authentic ring-spun cotton jersey texture, ribbed crewneck collar, and printed graphic artwork. Apply moderately enhanced color vibrancy and rich, distinct artwork colors without altering or recoloring the original palette. Render deep, clean blacks with visible fabric weave and texture.';
      keyExclusions = 'No human models, no visible necks, no mannequins, no warped lettering, no gray faded blacks.';
      break;

    case 'hoodie':
      productLabel = 'Apparel / Heavyweight Hoodie';
      keyFidelity =
        'Preserve authentic heavyweight fleece texture, double-layer hood, matching cotton drawstrings, kangaroo pocket, ribbed cuffs, and precise chest graphic placement with enhanced tonal contrast and rich artwork color vibrancy.';
      keyExclusions = 'No human models, no mannequins, no stiff cardboard appearance.';
      break;

    case 'notebook':
      productLabel = 'Archival Notebook / Journal';
      keyFidelity =
        'Preserve exact hardcover/softcover artwork, celestial/scientific illustrations, debossed gold foil stamping (rendered with warm, luminous golds), elastic closure band, and silk ribbon marker. Absolutely DO NOT invent a spine crease or fold.';
      keyExclusions = 'DO NOT invent a spine fold, crease, or bend; do not scatter random stationery clutter.';
      break;

    case 'mug':
      productLabel = 'Ceramic Drinkware / Mug';
      keyFidelity =
        'Preserve cylindrical proportions, wall thickness, rim profile, base curve, exact handle geometry, and wrap-around printed graphics with rich color registration and authentic ceramic semi-gloss glaze highlights.';
      keyExclusions = 'Do not add unrequested handles, lids, spoons, coasters, saucers, or steam.';
      break;

    case 'glass':
      productLabel = 'Glassware Tumbler';
      keyFidelity =
        'Preserve precise cylindrical silhouette, heavy base sham, polished rim, and printed/etched graphics. Render realistic optical light refraction, crystal-clear glass transparency, and clean specular highlights without excessive contrast that makes glass look opaque.';
      keyExclusions = 'No fingerprints, no dust specks, no opaque glass treatment.';
      break;

    case 'waterBottle':
      productLabel = 'Insulated Water Bottle';
      keyFidelity =
        'Preserve cylindrical stainless steel silhouette, insulated cap/lid construction, textured powder-coat finish, and printed wrap artwork with natural metallic highlights and rich color vibrancy.';
      keyExclusions = 'Do not distort cylindrical perspective; preserve cap and spout geometry exactly.';
      break;

    case 'tumbler':
      productLabel = 'Travel Tumbler with Lid';
      keyFidelity =
        'Preserve insulated tumbler silhouette, splash-proof lid structure, optional straw, textured matte coating, and wrapped graphic artwork with precise alignment and crisp tonal separation.';
      keyExclusions = 'Do not distort lid or straw proportions; maintain correct vertical scale.';
      break;

    case 'poster':
      productLabel = 'Fine Art Poster / Framed Print';
      keyFidelity =
        'Preserve archival paper texture, fine art ink typography, exact print proportions, and the original frame/mat style from the reference image with rich contrast and vivid ink colors. Never substitute a different frame material or color.';
      keyExclusions = 'Do not warp paper, do not alter frame color or matting, do not blur typography.';
      break;

    case 'other':
    default:
      productLabel = 'Science of Gifts Product';
      keyFidelity =
        'Faithfully preserve exact product design, materials, colors, logos, and physical construction from the reference image with rich tonal contrast and vivid color definition.';
      keyExclusions = 'Do not alter true product colors, proportions, or logos.';
      break;
  }

  const orientationDesc = getDetailedOrientationDesc(options.productType, options.orientation);
  const cameraDesc = getDetailedCameraDesc(
    options.cameraAngle,
    options.shotType,
    options.aspectRatio,
    options.orientation,
    options.productType
  );
  const envDesc = getCleanEnvDesc(
    options.background,
    options.surface,
    options.lightingStyle,
    options.props,
    options.propLevel,
    options.orientation
  );
  const addText = options.additionalInstructions
    ? `• Custom Staging Note: ${options.additionalInstructions}`
    : '';

  const plantInstruction = options.includePottedPlant
    ? '• Potted Plant Styling: Include one small, photorealistic potted plant as a secondary styling element, positioned naturally near a rear corner of the composition where appropriate. Use believable green foliage with naturally varied leaves and a tactile ceramic or stoneware pot with subtle glaze variation and authentic material texture. Ensure realistic proportions, lighting, perspective, and contact shadows. Keep the plant away from the hero product\'s important details and artwork. Allow the plant species, pot shape, and exact placement to vary naturally between photographs. No invented text, logos, or decorative graphics on the pot.\n'
    : '';

  return `[GEMINI PRODUCT PHOTOGRAPHY PROMPT]
${refText}

• Product Category: ${productLabel}
• Composition & Orientation: ${orientationDesc}
• Product Fidelity & Color Treatment: ${keyFidelity}
• Environment & Lighting: ${envDesc}
• Prop Fidelity & Realistic Material Rendering: Secondary props (when present) must be believable physical objects with authentic material textures (grain, patina, glaze), natural highlights, and zero invented text, gibberish lettering, fake titles, logos, or labels.
${plantInstruction}${addText ? `${addText}\n` : ''}• Camera & Format: ${cameraDesc}
• Quality Objective: Pristine, magazine-grade commercial still-life photography with rich tonal richness, deep clean blacks, luminous highlights, vivid artwork colors, and calm editorial elegance.
• Explicit Exclusions: ${keyExclusions} No low-resolution artifacts, no unrequested props, no artificial distortion of product artwork, no invented text, logos, or gibberish lettering on any secondary prop.`;
}
