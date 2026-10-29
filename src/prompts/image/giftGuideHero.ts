import {
  CameraAngle,
  GiftGuideHeroPromptOptions,
  HeroProductCategory,
  HeroProductReference,
  HeroPropDensity,
} from '../types';
import {
  getBackgroundPromptText,
  getLightingPromptText,
  getSurfacePromptText,
} from '../shared/options';

export interface HeroCategoryMetadata {
  id: HeroProductCategory;
  label: string;
  isPlanarOrFlat: boolean;
  isUpright3D: boolean;
  arrangementRule: string;
  fidelityDetail: string;
}

export const HERO_PRODUCT_CATEGORIES: Record<HeroProductCategory, HeroCategoryMetadata> = {
  tshirt: {
    id: 'tshirt',
    label: 'T-shirt',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Arrange flat on the surface or fold neatly in a clean retail fold, keeping the main printed chest design completely exposed and facing the camera. Avoid folds, creases, or overlaps that obscure or warp the artwork.',
    fidelityDetail:
      'cotton jersey silhouette, ribbed crewneck collar, sleeve proportions, fabric color, and exact chest artwork/lettering',
  },
  sweatshirt: {
    id: 'sweatshirt',
    label: 'Sweatshirt',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Arrange flat or fold neatly with realistic fleece thickness, keeping the main printed chest graphic completely exposed and unobstructed without adding a hood or drawstrings.',
    fidelityDetail:
      'heavyweight crewneck fleece structure, ribbed collar/cuffs/hem, fabric tone, and exact printed chest artwork',
  },
  hoodie: {
    id: 'hoodie',
    label: 'Hoodie',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Use a natural flat-lay or neat boutique fold on the surface, keeping the double-layer hood arranged naturally behind or above the collar, drawstrings plausible, and the front chest design clearly visible where practical.',
    fidelityDetail:
      'heavyweight fleece hood shape, drawstrings, kangaroo pocket, ribbed cuffs, and exact chest/front graphic',
  },
  mug: {
    id: 'mug',
    label: 'Mug',
    isPlanarOrFlat: false,
    isUpright3D: true,
    arrangementRule:
      'Stand upright resting firmly on its solid ceramic base upon the surface; orient the handle visibly at a natural three-quarter angle and keep the printed graphic surface facing the camera.',
    fidelityDetail:
      'cylindrical ceramic proportions, rim profile, handle geometry, glaze finish, and wrap-around printed illustration',
  },
  glass: {
    id: 'glass',
    label: 'Glass',
    isPlanarOrFlat: false,
    isUpright3D: true,
    arrangementRule:
      'Stand upright resting firmly on its heavy sham base upon the surface, keeping the printed or etched front graphic facing the camera with clean glass transparency.',
    fidelityDetail:
      'glass tumbler silhouette, heavy base sham, optical clarity, and exact printed/etched surface artwork',
  },
  waterBottle: {
    id: 'waterBottle',
    label: 'Water bottle',
    isPlanarOrFlat: false,
    isUpright3D: true,
    arrangementRule:
      'Position standing upright on its base or resting at a gentle, physically stable angle on the surface, with the label or printed design facing forward toward the viewer.',
    fidelityDetail:
      'insulated bottle cylinder silhouette, cap/lid construction, matte powder-coat finish, and front artwork/engraving',
  },
  tumbler: {
    id: 'tumbler',
    label: 'Tumbler',
    isPlanarOrFlat: false,
    isUpright3D: true,
    arrangementRule:
      'Position standing upright on its base with the lid intact and the printed graphic panel facing forward toward the camera.',
    fidelityDetail:
      'tapered or cylindrical tumbler profile, splash-proof lid/straw geometry, and wrapped graphic design',
  },
  poster: {
    id: 'poster',
    label: 'Poster',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Display lying flat on the surface, leaning at a gentle angle against the rear studio plane, or in its simple reference frame. Keep the entire artwork visible and avoid severe perspective distortion.',
    fidelityDetail:
      'paper or frame proportions, fine-art illustration, typography, border margins, and original frame/mat finish',
  },
  toteBag: {
    id: 'toteBag',
    label: 'Tote bag',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Arrange naturally on the surface with soft canvas texture, keeping the printed front panel completely exposed and the carry handles arranged plausibly without crossing over the artwork.',
    fidelityDetail:
      'canvas tote proportions, stitched web/fabric handles, natural weave, and centered front graphic print',
  },
  notebook: {
    id: 'notebook',
    label: 'Notebook',
    isPlanarOrFlat: true,
    isUpright3D: false,
    arrangementRule:
      'Lay flat or gently angled on the surface with the front cover artwork, foil stamping, and binding clearly visible and zero invented spine creases.',
    fidelityDetail:
      'hardcover/softcover dimensions, cover illustration, metallic foil or debossed lettering, elastic band, and ribbon marker',
  },
  other: {
    id: 'other',
    label: 'Other merchandise',
    isPlanarOrFlat: false,
    isUpright3D: false,
    arrangementRule:
      'Determine a natural, physically plausible display orientation based on the actual object in the reference image so its primary face and visible features are clearly presented toward the camera.',
    fidelityDetail:
      'exact physical shape, materials, proportions, colors, and all printed or engraved graphics',
  },
};

export const HERO_PRODUCT_CATEGORY_LIST: HeroCategoryMetadata[] = Object.values(
  HERO_PRODUCT_CATEGORIES
);

export const HERO_PROP_DENSITY_OPTIONS: {
  id: HeroPropDensity;
  label: string;
  badge?: string;
  shortDescription: string;
}[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    shortDescription:
      'No decorative props by default, or at most one subtle accent. Products receive almost all visual attention with generous negative space.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    badge: 'Default',
    shortDescription:
      'A small number of carefully selected complementary props that add depth and interest without competing with the products.',
  },
  {
    id: 'rich',
    label: 'Rich',
    shortDescription:
      'A more layered editorial still life with supporting elements while maintaining clear visual hierarchy and unobstructed product visibility.',
  },
];

/**
 * Infers a sensible HeroProductCategory from an uploaded file name or product title.
 */
export function inferHeroProductCategoryFromName(name: string): HeroProductCategory {
  const lower = name.toLowerCase();
  if (lower.includes('hoodie') || lower.includes('hooded')) return 'hoodie';
  if (lower.includes('sweatshirt') || lower.includes('crewneck')) return 'sweatshirt';
  if (
    lower.includes('tshirt') ||
    lower.includes('t-shirt') ||
    lower.includes('tee') ||
    lower.includes('shirt')
  ) {
    return 'tshirt';
  }
  if (lower.includes('mug') || lower.includes('cup') || lower.includes('coffee')) return 'mug';
  if (lower.includes('bottle') || lower.includes('flask') || lower.includes('canteen')) {
    return 'waterBottle';
  }
  if (lower.includes('tumbler')) return 'tumbler';
  if (lower.includes('glass') || lower.includes('pint')) return 'glass';
  if (lower.includes('poster') || lower.includes('print') || lower.includes('art')) return 'poster';
  if (lower.includes('tote') || lower.includes('bag')) return 'toteBag';
  if (lower.includes('notebook') || lower.includes('journal') || lower.includes('atlas')) {
    return 'notebook';
  }
  return 'other';
}

export interface ResolvedHeroCameraPerspective {
  mode: 'overhead-flat' | 'elevated-three-quarter';
  effectiveAngle: CameraAngle;
  summaryLabel: string;
  promptInstruction: string;
}

/**
 * Intelligently determines the camera perspective based on the supplied products:
 * - Uses an overhead perspective when all supplied products are flat/planar (e.g. folded garments, flat lays, posters, totes).
 * - Prefers a consistent elevated three-quarter tabletop perspective when upright/3D items (mugs, bottles) or mixed categories are present.
 */
export function resolveHeroCameraPerspective(
  options: GiftGuideHeroPromptOptions
): ResolvedHeroCameraPerspective {
  const products = options.products || [];

  if (options.cameraAngle === 'gentle-overhead') {
    return {
      mode: 'overhead-flat',
      effectiveAngle: 'gentle-overhead',
      summaryLabel: 'Overhead Perspective (80°–90°)',
      promptInstruction:
        'Use a consistent overhead to near-overhead studio perspective (approximately 80–90 degrees looking down at the tabletop plane) that accommodates flat garments, posters, and stationery cleanly without perspective foreshortening. Maintain a single unified optical viewpoint across the entire scene using an 80mm–100mm medium-format lens character with zero wide-angle distortion.',
    };
  }

  const hasProducts = products.length > 0;
  const allPlanarOrFlat =
    hasProducts &&
    products.every((p) => HERO_PRODUCT_CATEGORIES[p.category]?.isPlanarOrFlat === true);

  if (allPlanarOrFlat && !options.cameraAngle) {
    return {
      mode: 'overhead-flat',
      effectiveAngle: 'gentle-overhead',
      summaryLabel: 'Overhead Perspective (Flat-Product Optimized)',
      promptInstruction:
        'Use a high overhead studio perspective (approximately 80–90 degrees looking straight down at the surface) specifically chosen to accommodate flat and folded garments, posters, or tote bags so every printed chest design and illustration lies squarely toward the viewer without foreshortening. Maintain a single unified optical perspective across all items and avoid wide-angle distortion.',
    };
  }

  return {
    mode: 'elevated-three-quarter',
    effectiveAngle: options.cameraAngle || 'high-three-quarter',
    summaryLabel: 'Elevated Three-Quarter Tabletop (35°–45°)',
    promptInstruction:
      'Use a consistent elevated three-quarter tabletop perspective (approximately 35–45 degrees elevation looking across the studio surface) that comfortably accommodates both upright three-dimensional products (such as mugs and water bottles) and flat or neatly folded items (such as T-shirts, hoodies, posters, and notebooks) in one coherent physical scene. Use a single unified 85mm–100mm medium-format optical perspective with natural depth, avoiding extreme wide-angle distortion, severe foreshortening, or inconsistent camera angles between individual objects.',
  };
}

export function getHeroPropDensityPromptText(density: HeroPropDensity): string {
  switch (density) {
    case 'minimal':
      return `Minimal Prop Density:
• Include no decorative props by default, or at most one understated, unbranded tactile accent if needed for visual grounding.
• Reserve nearly 100% of visual attention for the uploaded gift-guide products, surrounded by calm, generous negative space.
• Best for clean, high-clarity product arrangements where the merchandise stands entirely on its own.`;

    case 'rich':
      return `Rich Editorial Prop Density:
• Compose a more layered editorial still life incorporating a few tasteful, contextually appropriate supporting elements (such as architectural stone risers, unbranded cloth-bound volumes, natural botanical stems, or warm studio textures) that complement the gift-guide theme.
• Maintain a strict visual hierarchy where the uploaded reference products remain the unmistakable primary subjects.
• Keep generous clearance around all product silhouettes and printed graphics; never turn the image into a crowded or cluttered arrangement, and never invent text, book titles, or branding on supporting props.`;

    case 'balanced':
    default:
      return `Balanced Prop Density (Default):
• Include a small number of carefully selected, complementary, unbranded studio props (such as a low travertine riser, raw linen texture, or a subtle organic accent) that add physical depth and editorial interest without competing with the products.
• Maintain generous spacing between items so every important product design and silhouette remains completely visible and legible.
• Product images remain the primary subjects; supporting props must never obscure product artwork or contain invented text, labels, or logos.`;
  }
}

/**
 * Builds the complete, structured 7-section Gift Guide Hero Image prompt.
 * Every product in `options.products` is explicitly accounted for in both the
 * reference-fidelity inventory and the category-specific arrangement plan
 * with zero truncation.
 */
export function buildGiftGuideHeroPrompt(options: GiftGuideHeroPromptOptions): string {
  const products = options.products || [];
  const cameraInfo = resolveHeroCameraPerspective(options);
  const propDensityText = getHeroPropDensityPromptText(options.propDensity || 'balanced');
  const backgroundText = getBackgroundPromptText(
    options.background,
    options.surface,
    options.colorPalette
  );
  const surfaceText = getSurfacePromptText(options.surface, options.colorPalette);
  const lightingText = getLightingPromptText(
    options.lightingStyle || 'large-soft-studio',
    options.shadowCharacter || 'soft'
  );
  const aspectRatio = options.aspectRatio || '16:9';

  // Determine primary focal product
  const explicitPrimaryIndex = products.findIndex((p) => p.isPrimaryHero);
  const primaryIndex = explicitPrimaryIndex >= 0 ? explicitPrimaryIndex : 0;

  // Section 2: Reference-image list & fidelity (accounts for 100% of supplied products)
  let referenceListBlock = '';
  let completeAccountingMandate = '';
  if (products.length > 0) {
    const lines = products.map((p, idx) => {
      const catMeta = HERO_PRODUCT_CATEGORIES[p.category] || HERO_PRODUCT_CATEGORIES.other;
      const roleTag = idx === primaryIndex && products.length > 1 ? ' [Primary Focal Product]' : '';
      const label = p.customLabel?.trim() || catMeta.label;
      return `• Reference Image ${idx + 1} of ${products.length} (${p.name} — ${label}${roleTag}): Represent this exact physical product in the final composition, preserving its ${catMeta.fidelityDetail}.`;
    });
    referenceListBlock = `SUPPLIED PRODUCT REFERENCE IMAGES (${products.length} ${
      products.length === 1 ? 'ITEM' : `ITEMS — ALL ${products.length} MUST BE INCLUDED`
    }):\n${lines.join('\n')}\n\n`;
    completeAccountingMandate = `\n• Complete Product Accounting (${products.length} of ${products.length}): Every single one of the ${products.length} supplied reference products listed above must appear in the final hero composition—never omit, drop, merge, or truncate any product.`;
  } else {
    referenceListBlock = `ATTACHED PRODUCT REFERENCES:\n• Treat every attached product image as a definitive reference for an actual physical product that must be included in the final hero composition.\n\n`;
  }

  // Section 3: Product-specific positioning & arrangement (accounts for 100% of supplied products)
  const presentCategories = Array.from(new Set(products.map((p) => p.category)));
  const categoryGuidanceLines: string[] = [];

  if (products.length > 0) {
    products.forEach((p, idx) => {
      const catMeta = HERO_PRODUCT_CATEGORIES[p.category] || HERO_PRODUCT_CATEGORIES.other;
      const isPrimary = idx === primaryIndex && products.length > 1;
      const placementPrefix = isPrimary
        ? 'Primary Hero Anchor (strongest central/foreground placement)'
        : `Supporting Hero Product ${idx + 1} of ${products.length}`;
      categoryGuidanceLines.push(
        `• [${idx + 1}/${products.length}] ${p.name} (${catMeta.label} — ${placementPrefix}): ${catMeta.arrangementRule}`
      );
    });
  } else {
    // Default adaptive rules across mixed gift-guide merchandise when no files are listed yet
    categoryGuidanceLines.push(
      `• T-shirts & Sweatshirts: ${HERO_PRODUCT_CATEGORIES.tshirt.arrangementRule}`,
      `• Hoodies: ${HERO_PRODUCT_CATEGORIES.hoodie.arrangementRule}`,
      `• Mugs & Drinkware: ${HERO_PRODUCT_CATEGORIES.mug.arrangementRule}`,
      `• Water Bottles & Tumblers: ${HERO_PRODUCT_CATEGORIES.waterBottle.arrangementRule}`,
      `• Posters & Prints: ${HERO_PRODUCT_CATEGORIES.poster.arrangementRule}`,
      `• Tote Bags: ${HERO_PRODUCT_CATEGORIES.toteBag.arrangementRule}`,
      `• Other Merchandise: ${HERO_PRODUCT_CATEGORIES.other.arrangementRule}`
    );
  }

  // If all uploaded items were categorized as 'other', also include the core category guidelines
  // so the model adapts properly to garments, mugs, bottles, posters, and totes visible in the images.
  if (products.length > 0 && presentCategories.length === 1 && presentCategories[0] === 'other') {
    categoryGuidanceLines.push(
      `• Adaptive Category Rules: Arrange garments (T-shirts, sweatshirts, hoodies) flat or neatly folded with the chest graphic exposed; stand mugs upright with handles visible and artwork facing the camera; position water bottles upright or at a stable angle with labels forward; display posters flat, gently angled, or framed without severe distortion; arrange tote bags naturally with the printed panel exposed and handles plausible.`
    );
  }

  const multiItemHierarchyNote =
    products.length >= 5
      ? ` With ${products.length} products in the scene, organize the ensemble across staggered foreground, midground, and rear depth planes spanning the width of the tabletop, using subtle architectural risers and height variation so all ${products.length} items remain clearly visible, balanced, and uncrowded.`
      : '';

  const additionalBlock =
    options.additionalInstructions && options.additionalInstructions.trim()
      ? `\n• Additional Curatorial Direction: ${options.additionalInstructions.trim()}`
      : '';

  return `1. OVERALL PHOTOGRAPHIC OBJECTIVE & VISUAL STYLE
Create a single cohesive, publication-grade editorial still-life hero photograph for a "Science of Gifts" gift-guide article. The photograph must unite all supplied products into one believable physical studio scene with a refined, calm boutique aesthetic, accurate material textures, and consistent visual identity—never a flat collage, grid, or composite of separate cutouts.

2. REFERENCE-IMAGE FIDELITY REQUIREMENTS
${referenceListBlock}CORE FIDELITY MANDATES:
• Preserve the exact identity, physical construction, proportions, and colors of every supplied reference product.
• Reproduce all original printed artwork, illustrations, lettering, exact spelling, color palettes, and placement accurately—never redesign, simplify, reinterpret, or regenerate any graphic.
• Preserve product-specific structural details, including bottle shapes and caps, mug handles and rim profiles, garment silhouettes and collar/hood construction, poster framing/margins, and tote bag handles.
• Never substitute a generic lookalike product or invent unrequested product designs.
• Keep every product's primary artwork unobstructed, legible, and free from cropping or warping.
• Include each supplied reference product once; do not duplicate products unless explicitly requested.${completeAccountingMandate}

3. PRODUCT-SPECIFIC POSITIONING & ARRANGEMENT
Arrange the products coherently according to their physical form rather than treating every item as a flat object:
${categoryGuidanceLines.join('\n')}

4. COMPOSITION HIERARCHY & CAMERA PERSPECTIVE
• Visual Hierarchy & Grouping: Establish a clear focal hierarchy where the primary hero product receives the strongest central placement and surrounding products are arranged at varied, physically believable depths and elevations (using subtle surface risers or natural foreground/midground staggering where helpful).${multiItemHierarchyNote}
• Separation & Overlap Discipline: Keep products visually separated enough to remain immediately identifiable. Use slight natural overlaps only at non-essential edges—never concealing any printed artwork, text, or key structural features.
• Physical Plausibility: Avoid implausible stacking, floating objects, distorted geometry, or intersecting product silhouettes. Maintain realistic scale relationships between apparel, drinkware, posters, and accessories.
• Camera Perspective (${cameraInfo.summaryLabel}): ${cameraInfo.promptInstruction} Orient all products so their important printed surfaces face the viewer.

5. SELECTED PROP-DENSITY INSTRUCTIONS
${propDensityText}

6. SELECTED BACKGROUND & LIGHTING CONFIGURATION
• Unified Studio Backdrop: Apply the selected background consistently across the entire composition as one unified studio environment—never assign different backgrounds to individual products.
• Background Treatment: ${backgroundText}
• Supporting Surface: ${surfaceText}
• Studio Illumination: ${lightingText} Maintain clean contrast behind every product so background tones never compete with or discolor the product artwork.

7. FRAMING, REALISM & NEGATIVE CONSTRAINTS
• Aspect Ratio & Framing: ${aspectRatio} landscape hero composition. Keep the entire product arrangement comfortably inside the frame with balanced negative space around the perimeter. Keep all products and printed designs well clear of the outer frame edges so nothing essential is cropped and the composition remains clear when displayed at reduced article-card sizes.${additionalBlock}
• Strict Exclusions: No people, hands, human models, or visible mannequins; no split-screen grids, photo borders, or catalog collage layouts; no duplicated products unless requested; no omitted reference products; no altered, misspelled, or invented product graphics; no fake text or logos on background props; no watermarks, badges, or promotional text overlays.`;
}

