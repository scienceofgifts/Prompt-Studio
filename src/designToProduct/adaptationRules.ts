import {
  BackgroundTreatmentOption,
  ColorTreatmentOption,
  DesignAnalysisResult,
  MerchandiseProductProfile,
  ResolvedBackgroundDecision,
  ResolvedColorDecision,
} from './types';

function isDarkProductColor(colorName: string): boolean {
  const lower = colorName.toLowerCase();
  return /\b(black|charcoal|navy|midnight|dark|espresso|burgundy|maroon|forest|olive|slate)\b/.test(
    lower
  );
}

function isLightProductColor(colorName: string): boolean {
  const lower = colorName.toLowerCase();
  return /\b(white|cream|ivory|ecru|natural|sand|alabaster|light|off-white|paper|heather gray)\b/.test(
    lower
  );
}

function isClearGlassProduct(profile: MerchandiseProductProfile): boolean {
  return (
    profile.id === 'beer-glass' ||
    profile.id === 'whiskey-glass' ||
    profile.id === 'cocktail-glass' ||
    profile.supportedProductColors.some((c) => c.toLowerCase().includes('clear glass'))
  );
}

function isLikelyEngravedProfile(profile: MerchandiseProductProfile): boolean {
  const method = profile.printingMethod.toLowerCase();
  return method.includes('laser engrav') && !method.includes('verify') && !method.includes('vs');
}

/**
 * Intelligently determines whether finished adapted artwork should have a genuinely
 * transparent alpha background or an intentional full-bleed background, respecting user overrides
 * without blindly linking square shape -> opaque.
 */
export function resolveBackgroundTreatment(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile,
  userChoice: BackgroundTreatmentOption
): ResolvedBackgroundDecision {
  if (userChoice === 'transparent') {
    return {
      mode: 'transparent',
      source: 'user-override',
      rationale: `User explicitly selected a genuinely transparent PNG background for ${profile.name}.`,
    };
  }

  if (userChoice === 'full-background') {
    return {
      mode: 'full-background',
      source: 'user-override',
      rationale: `User explicitly selected a full-background composition for ${profile.name}.`,
    };
  }

  // AI Decides based on intended product + design treatment (never purely image shape)
  if (profile.id === 'poster' || profile.id === 'art-print') {
    return {
      mode: 'full-background',
      source: 'ai-decision',
      rationale: `${profile.name} requires a complete intentional rectangular background with cohesive framing/margins rather than stripping the canvas.`,
    };
  }

  if (profile.id === 'desk-mat' || profile.id === 'mousepad') {
    return {
      mode: 'full-background',
      source: 'ai-decision',
      rationale: `${profile.name} prints edge-to-edge across a landscape desk surface; extending a cohesive background avoids awkward sticker borders.`,
    };
  }

  if (profile.id === 'laptop-sleeve') {
    const useFull =
      analysis.compositionType === 'poster' ||
      analysis.compositionType === 'pattern' ||
      analysis.currentBackground === 'full-scene-illustration' ||
      analysis.expandableToWideOrFullBleed;

    return {
      mode: useFull ? 'full-background' : 'transparent',
      source: 'ai-decision',
      rationale: useFull
        ? 'Artwork benefits from a coordinated full-panel background extended safely to the sleeve seams.'
        : 'Isolated emblem/graphic works cleanly on a transparent layer for placement on a solid sleeve tone.',
    };
  }

  if (profile.id === 'notebook' || profile.id === 'journal') {
    const keepFullCover =
      analysis.compositionType === 'poster' ||
      analysis.compositionType === 'pattern' ||
      analysis.currentBackground === 'full-scene-illustration' ||
      (!analysis.prefersTransparentBackground && analysis.expandableToWideOrFullBleed);

    return {
      mode: keepFullCover ? 'full-background' : 'transparent',
      source: 'ai-decision',
      rationale: keepFullCover
        ? `Treats the ${profile.name.toLowerCase()} as a cohesive full-cover illustration preserving the artwork's scene backdrop.`
        : `Isolates the graphic cleanly with transparent edges so it prints cleanly as an emblem or title block on the ${profile.name.toLowerCase()} cover.`,
    };
  }

  // Apparel, Ceramic Mug, Clear Glassware, Bottles/Tumblers, Tote Bag
  if (profile.defaultBackgroundTreatment === 'transparent' || profile.category === 'apparel' || profile.category === 'drinkware') {
    const keepFramingBoxOnApparel =
      profile.category === 'apparel' &&
      analysis.compositionType === 'poster' &&
      !analysis.prefersTransparentBackground &&
      analysis.currentBackground === 'full-scene-illustration';

    if (keepFramingBoxOnApparel) {
      return {
        mode: 'full-background',
        source: 'ai-decision',
        rationale:
          'Artwork is a complete self-contained poster scene; preserve its intentional framed backdrop while keeping clean outer edges without adding a mismatched white box.',
      };
    }

    return {
      mode: 'transparent',
      source: 'ai-decision',
      rationale: `Standalone graphic for ${profile.name} requires a genuine transparent PNG so fabric, ceramic, or clear glass surfaces integrate naturally without a pasted rectangle.`,
    };
  }

  // Custom / Other products fallback
  const preferTransparent =
    profile.defaultBackgroundTreatment !== 'full-background' &&
    analysis.prefersTransparentBackground;
  return {
    mode: preferTransparent ? 'transparent' : 'full-background',
    source: 'ai-decision',
    rationale: preferTransparent
      ? `Artwork isolates cleanly onto ${profile.name} with true transparent background.`
      : `Full-background composition keeps ${profile.name} visually cohesive.`,
  };
}

/**
 * Intelligently evaluates palette contrast against the selected product & color
 * without casually recoloring artwork or inventing unverified ink capabilities.
 */
export function resolveColorTreatment(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile,
  userChoice: ColorTreatmentOption,
  userProductColor: string
): ResolvedColorDecision {
  const clearGlass = isClearGlassProduct(profile);
  const targetProductColor =
    userProductColor.trim() ||
    (clearGlass
      ? 'Clear Glass'
      : analysis.recommendedDefaultProductColor ||
        profile.supportedProductColors[0] ||
        'Balanced Neutral');

  const requiresInkVerification =
    clearGlass ||
    profile.printingMethod.toLowerCase().includes('unverified') ||
    profile.printingMethod.toLowerCase().includes('verify');

  if (userChoice === 'preserve-original') {
    const adjustments: string[] = [];
    if (clearGlass) {
      adjustments.push(
        'Note for clear glass: verify whether the blank supports full-color opaque white ink, single-color ink, or etching before finalizing production.'
      );
    }
    return {
      mode: 'preserve-original',
      source: 'user-override',
      targetProductColor,
      requiresInkVerification,
      rationale: 'User selected Preserve Original Colors; keep exact palette fidelity intact.',
      adjustments,
    };
  }

  const adjustments: string[] = [];
  const dominantStr = analysis.dominantColors.join(' ').toLowerCase();
  const hasDarkDominant = /\b(black|charcoal|navy|dark|deep)\b/.test(dominantStr);
  const hasLightDominant = /\b(white|cream|ivory|yellow|pale|pastel|light)\b/.test(dominantStr);

  if (clearGlass) {
    adjustments.push(
      'Strengthen figure-ground separation and clean line/shape definition so the artwork remains clearly readable against both light beverages (pale lager/champagne) and dark beverages (stout/cola/whiskey).'
    );
    adjustments.push(
      'Do NOT assume full-color opaque white underbase printing is supported—verify whether this glassware uses full-color transfer, single-color ink, or laser etching before ordering.'
    );
  } else if (isLikelyEngravedProfile(profile)) {
    adjustments.push(
      'Prepare crisp high-contrast tonal shapes because engraved mark appearance is determined by the physical product material rather than multi-color ink.'
    );
  } else if (isDarkProductColor(targetProductColor) && hasDarkDominant) {
    adjustments.push(
      `Because the target product color is "${targetProductColor}", lighten dark typography/outlines to crisp cream, off-white, or bright high-contrast ink while preserving meaningful accent colors.`
    );
  } else if (isLightProductColor(targetProductColor) && hasLightDominant) {
    adjustments.push(
      `Because the target product color is "${targetProductColor}", deepen pale typography or add clean dark contrast strokes so fine elements read sharply against light stock.`
    );
  } else if (
    analysis.contrastRiskNotes &&
    (userChoice === 'adapt-for-product' || !analysis.worksWithoutModification)
  ) {
    adjustments.push(`Address print contrast consideration: ${analysis.contrastRiskNotes}`);
  }

  if (userChoice === 'adapt-for-product' && adjustments.length === 0) {
    adjustments.push(
      `Optimize contrast balance subtly for ${profile.name} (${targetProductColor}) while preserving the artwork’s recognizable palette and identity.`
    );
  }

  const shouldAdapt = adjustments.length > 0;
  return {
    mode: shouldAdapt ? 'targeted-adaptation' : 'preserve-original',
    source: userChoice === 'adapt-for-product' ? 'user-override' : 'ai-decision',
    targetProductColor,
    requiresInkVerification,
    rationale: shouldAdapt
      ? `Targeted legibility/contrast guidance applied for ${profile.name} (${targetProductColor}) without casually recoloring the core visual identity.`
      : `Original palette (${analysis.dominantColors.slice(0, 3).join(', ') || 'as-is'}) already reads cleanly on ${targetProductColor} without recoloring.`,
    adjustments,
  };
}
