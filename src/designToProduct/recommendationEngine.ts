import {
  DesignAnalysisResult,
  MerchandiseProductProfile,
  ProductRecommendation,
  ProductRecommendationSet,
} from './types';

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function getEffortForDesignAndProduct(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile
): 'minimal' | 'moderate' | 'tailored' {
  if (
    analysis.worksWithoutModification &&
    ((profile.category === 'paper-wall-art' && analysis.aspectProfile === 'portrait') ||
      (profile.defaultBackgroundTreatment === 'transparent' &&
        analysis.currentBackground === 'transparent-clean'))
  ) {
    return 'minimal';
  }

  if (
    (profile.id === 'desk-mat' &&
      analysis.aspectProfile !== 'landscape' &&
      analysis.aspectProfile !== 'wide-panoramic') ||
    (profile.category === 'drinkware' && analysis.detailLevel === 'intricate')
  ) {
    return 'tailored';
  }

  return 'moderate';
}

function buildFallbackReason(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile
): string {
  if (profile.category === 'apparel') {
    return `Clean ${analysis.compositionType} layout translates naturally into a wearable chest print for ${analysis.intendedAudience || 'gift recipients'}.`;
  }
  if (profile.id === 'ceramic-mug') {
    return `Compact, readable ${analysis.compositionType} framing gives this concept everyday desk and morning-coffee appeal.`;
  }
  if (
    profile.id === 'beer-glass' ||
    profile.id === 'whiskey-glass' ||
    profile.id === 'cocktail-glass'
  ) {
    return `Barware format complements the "${analysis.themeOrTopic}" concept with strong gift utility.`;
  }
  if (profile.id === 'poster' || profile.id === 'art-print') {
    return `Generous flat print area preserves the artwork’s ${analysis.detailLevel} detail and complete composition cleanly.`;
  }
  if (profile.id === 'desk-mat') {
    return `Wide workspace format showcases intricate visual detail and visual reference elements without cramming.`;
  }
  if (profile.id === 'notebook' || profile.id === 'journal') {
    return `Editorial cover layout fits thoughtful, intellectual gifting around ${analysis.themeOrTopic}.`;
  }
  return `Suits the "${analysis.conceptSummary}" concept with practical everyday utility.`;
}

function computeProductScore(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile
): { score: number; rawScore: number; reason: string } {
  const combinedConcept = normalizeText(
    `${analysis.conceptSummary} ${analysis.themeOrTopic} ${analysis.intendedAudience} ${analysis.exactVisibleText}`
  );
  let score = 25;

  // 1. Seed from Gemini's direct semantic fit analysis if present for this catalog item
  const semanticMatch = analysis.suggestedProductFits.find(
    (fit) => fit.productId === profile.id
  );
  let reason = semanticMatch?.reason?.trim() || '';
  if (semanticMatch) {
    score += semanticMatch.conceptFitScore * 0.28 + semanticMatch.visualFitScore * 0.2;
  }

  // 2. Thematic / Conceptual Gift Affinity Rules (Meaning over pure dimensions)
  const isCoffeeTea =
    /\b(coffee|espresso|caffeine|latte|roast|barista|coffeehouse|cafe|tea|mug|brew|roastery)\b/.test(
      combinedConcept
    );
  const isCocktailSpirit =
    /\b(cocktail|martini|negroni|old fashioned|manhattan|bourbon|whiskey|whisky|scotch|gin|mixology|bartender|aperitif|bitters)\b/.test(
      combinedConcept
    );
  const isBeerPub = /\b(beer|ale|ipa|lager|stout|brewery|pint|hops|pub|taproom)\b/.test(
    combinedConcept
  );
  const isWine = /\b(wine|vino|sommelier|vineyard|chardonnay|pinot|cabernet|merlot)\b/.test(
    combinedConcept
  );
  const isMapOrChart =
    analysis.compositionType === 'infographic' ||
    /\b(map|atlas|chart|diagram|taxonomy|periodic|blueprint|schema|constellation|anatomy|field guide|timeline)\b/.test(
      combinedConcept
    );
  const isDeskTech =
    /\b(code|developer|programmer|keyboard|desk|engineer|algorithm|math|physics|circuit|terminal)\b/.test(
      combinedConcept
    );
  const isBookishAcademic =
    /\b(library|book|writer|journal|notes|observe|astronomy|botany|lab|notebook|study|sketch)\b/.test(
      combinedConcept
    );
  const isOutdoorsActive =
    /\b(trail|hike|mountain|camp|run|hydration|bike|field|national park|expedition)\b/.test(
      combinedConcept
    );

  if (isCoffeeTea) {
    if (profile.id === 'ceramic-mug') score += 26;
    if (profile.id === 'tshirt' || profile.id === 'sweatshirt' || profile.id === 'tote-bag') {
      score += 10;
    }
  }

  if (isCocktailSpirit) {
    if (profile.id === 'cocktail-glass' || profile.id === 'whiskey-glass') score += 28;
    if (profile.id === 'ceramic-mug') score -= 4;
  }

  if (isBeerPub) {
    if (profile.id === 'beer-glass') score += 28;
    if (profile.id === 'tshirt' || profile.id === 'hoodie') score += 10;
  }

  if (isWine) {
    if (profile.id === 'wine-tumbler') score += 26;
  }

  if (isMapOrChart) {
    if (profile.id === 'poster' || profile.id === 'art-print') score += 22;
    if (profile.id === 'desk-mat') score += 20;
    if (profile.id === 'notebook' || profile.id === 'journal') score += 12;
  }

  if (isDeskTech) {
    if (profile.id === 'desk-mat') score += 18;
    if (profile.id === 'mousepad' || profile.id === 'laptop-sleeve') score += 12;
    if (profile.id === 'ceramic-mug' || profile.id === 'tshirt') score += 8;
  }

  if (isBookishAcademic) {
    if (profile.id === 'notebook' || profile.id === 'journal') score += 18;
    if (profile.id === 'tote-bag' || profile.id === 'ceramic-mug') score += 12;
    if (profile.id === 'poster' || profile.id === 'art-print') score += 10;
  }

  if (isOutdoorsActive) {
    if (profile.id === 'water-bottle' || profile.id === 'insulated-tumbler') score += 18;
    if (profile.id === 'tshirt' || profile.id === 'hoodie') score += 10;
  }

  // 3. Visual Composition & Printability Constraints (Prevent genuinely bad pairings)
  if (!analysis.suitableForSmallPrint || analysis.detailLevel === 'intricate') {
    if (
      profile.id === 'whiskey-glass' ||
      profile.id === 'cocktail-glass' ||
      profile.id === 'beer-glass' ||
      profile.id === 'wine-tumbler'
    ) {
      score -= 28;
    }
    if (profile.id === 'ceramic-mug') {
      score -= 14;
    }
    if (
      profile.id === 'poster' ||
      profile.id === 'art-print' ||
      profile.id === 'desk-mat' ||
      profile.id === 'tote-bag'
    ) {
      score += 14;
    }
    if (profile.id === 'tshirt' || profile.id === 'hoodie') {
      score += 6;
    }
  }

  // High text density or detailed infographic is tough on curved narrow bottles/glasses
  if (analysis.textDensity === 'high') {
    if (profile.category === 'drinkware') {
      score -= 20;
    }
    if (profile.id === 'poster' || profile.id === 'art-print' || profile.id === 'desk-mat') {
      score += 12;
    }
  }

  // Short slogan / badge / logo shines on apparel, mugs, totes, and compact drinkware
  if (
    analysis.compositionType === 'slogan' ||
    analysis.compositionType === 'badge' ||
    analysis.compositionType === 'emblem' ||
    analysis.compositionType === 'logo' ||
    analysis.compositionType === 'typography'
  ) {
    if (profile.id === 'tshirt' || profile.id === 'hoodie' || profile.id === 'sweatshirt') {
      score += 14;
    }
    if (profile.id === 'ceramic-mug' || profile.id === 'tote-bag') {
      score += 11;
    }
    if (profile.id === 'desk-mat' && !analysis.expandableToWideOrFullBleed) {
      score -= 10;
    }
  }

  // Full-scene artwork / fine art poster compositions belong naturally on posters, art prints, notebooks, or desk mats
  if (
    analysis.compositionType === 'poster' ||
    analysis.currentBackground === 'full-scene-illustration'
  ) {
    if (profile.id === 'poster' || profile.id === 'art-print') {
      score += 16;
    }
    if (profile.id === 'notebook' || profile.id === 'journal' || profile.id === 'laptop-sleeve') {
      score += 9;
    }
    if (profile.id === 'tank-top' || profile.id === 'sweater') {
      score -= 8;
    }
  }

  // Wide panoramic artwork gets natural affinity for desk mats / laptop sleeves
  if (
    (analysis.aspectProfile === 'wide-panoramic' || analysis.aspectProfile === 'landscape') &&
    analysis.expandableToWideOrFullBleed
  ) {
    if (profile.id === 'desk-mat' || profile.id === 'mousepad' || profile.id === 'laptop-sleeve') {
      score += 12;
    }
  }

  // Glassware sanity check for multi-color complex scenes without clear silhouette
  if (
    (profile.id === 'beer-glass' ||
      profile.id === 'whiskey-glass' ||
      profile.id === 'cocktail-glass') &&
    !isCocktailSpirit &&
    !isBeerPub &&
    analysis.detailLevel !== 'minimal'
  ) {
    score -= 6;
  }

  const rawScore = Math.round(score * 10) / 10;
  const finalScore = Math.max(1, Math.min(99, Math.round(score)));
  if (!reason) {
    reason = buildFallbackReason(analysis, profile);
  }

  return { score: finalScore, rawScore, reason };
}

/**
 * Ranks all merchandise catalog items for a single analyzed design and picks
 * 1 strong primary recommendation + 2 distinct alternatives.
 */
export function recommendProductsForDesign(
  analysis: DesignAnalysisResult,
  catalog: MerchandiseProductProfile[]
): ProductRecommendationSet {
  const rankedWithRaw = catalog.map((profile) => {
    const { score, rawScore, reason } = computeProductScore(analysis, profile);
    return {
      rawScore,
      rec: {
        productId: profile.id,
        productName: profile.name,
        category: profile.category,
        score,
        reason,
        adaptationEffort: getEffortForDesignAndProduct(analysis, profile),
      } satisfies ProductRecommendation,
    };
  });

  rankedWithRaw.sort((a, b) => b.rawScore - a.rawScore);
  const scored: ProductRecommendation[] = rankedWithRaw.map((item) => item.rec);

  const primary = scored[0];
  const alternatives: ProductRecommendation[] = [];

  for (const candidate of scored.slice(1)) {
    if (alternatives.length < 2) {
      alternatives.push(candidate);
    } else {
      break;
    }
  }

  return {
    primary,
    alternatives,
    allRanked: scored,
  };
}

/**
 * Batch-aware selection: evaluates each design strictly on merit first, applying only
 * a very small tie-break nudge when two top products are practically tied (<= 4 points)
 * so batch variety never overrides genuine product suitability.
 */
export function selectBatchRecommendedProductId(
  recommendations: ProductRecommendationSet,
  assignedCategoryCounts: Record<string, number>
): string {
  const primary = recommendations.primary;
  const second = recommendations.alternatives[0];

  if (!second) {
    return primary.productId;
  }

  const primaryCount = assignedCategoryCounts[primary.category] || 0;
  const secondCount = assignedCategoryCounts[second.category] || 0;

  // Only diversify when primary & runner-up are essentially tied in suitability AND differ in category
  if (
    primary.category !== second.category &&
    primary.score - second.score <= 3 &&
    primaryCount >= secondCount + 2
  ) {
    return second.productId;
  }

  return primary.productId;
}
