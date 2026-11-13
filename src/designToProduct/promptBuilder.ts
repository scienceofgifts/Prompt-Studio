import { resolveBackgroundTreatment, resolveColorTreatment } from './adaptationRules';
import {
  DesignAdaptationOptions,
  DesignAnalysisResult,
  MerchandiseProductProfile,
} from './types';

function getProductSpecificLayoutInstructions(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile,
  resolvedBgMode: 'transparent' | 'full-background'
): string {
  const id = profile.id;

  if (profile.category === 'apparel') {
    const styleHint =
      analysis.compositionType === 'badge' || analysis.compositionType === 'emblem'
        ? 'centered chest emblem/badge'
        : analysis.compositionType === 'slogan' || analysis.compositionType === 'typography'
        ? 'balanced chest-print typography lockup'
        : 'cohesive front chest-print composition';

    return `- Apparel Chest-Print Adaptation (${profile.name}): Compose the attached artwork as an intentional ${styleHint} suited for the front chest area.
- Maintain crisp readable letterforms and balanced breathing room between text and illustrations.
${
  resolvedBgMode === 'transparent'
    ? '- Strip away any unnecessary solid canvas or rectangular backdrop so the graphic integrates organically onto the fabric rather than looking like a square sticker pasted onto clothing.'
    : '- Keep the artwork’s intentional framed graphic treatment clean along outer edges without adding awkward blank margins.'
}${
      id === 'hoodie'
        ? '\n- Ensure vertical proportions sit comfortably on upper/mid chest without forcing tall dangling bottom elements that collide with a hoodie pocket.'
        : id === 'tank-top'
        ? '\n- Compact any wide horizontal spans slightly inward so the design sits cleanly between narrower tank-top armholes and neckline.'
        : ''
    }`;
  }

  if (id === 'ceramic-mug') {
    return `- Ceramic Mug Adaptation: Optimize the layout for a curved ceramic mug side print where the focal concept must read clearly at arm’s length.
- Rebalance typography scale and spacing so secondary text is not microscopic, simplify excessive hairlines if needed, and keep the composition compact horizontally so key wording does not disappear around the curve.`;
  }

  if (id === 'beer-glass' || id === 'whiskey-glass' || id === 'cocktail-glass') {
    return `- Clear Glassware Adaptation (${profile.name}): Prioritize bold, crisp graphic shapes and clear silhouettes that stay readable on a transparent curved glass filled with different beverage tones.
- Keep the composition compact${id === 'whiskey-glass' ? ' vertically to fit a short rocks glass face' : ' within the primary viewing face'}, avoiding ultra-fine micro-text or muddy translucent fades.
- Manufacturing Verification Note: Account for the glass’s decoration method (${profile.printingMethod}). Do NOT assume opaque white ink or full-color gradients are supported without confirming the production blank’s printing or etching process.`;
  }

  if (id === 'water-bottle' || id === 'insulated-tumbler') {
    return `- Cylindrical Drinkware Adaptation (${profile.name}): Arrange key typography and illustrations into a compact, vertically balanced column or badge that reads comfortably on a curved cylindrical surface.
- Avoid wide horizontal banners that wrap out of sight or placing crucial text near the top rim or bottom taper.`;
  }

  if (id === 'notebook' || id === 'journal') {
    const coverApproach =
      resolvedBgMode === 'full-background'
        ? 'intentional full-cover book composition with cohesive framing'
        : 'refined centered cover emblem or typographic title treatment';

    return `- Notebook / Journal Cover Adaptation (${profile.name}): Format as a ${coverApproach} proportioned for a vertical front book cover.
- Maintain clear visual hierarchy and leave safe margin near the left binding/spine edge and outer cover trim.`;
  }

  if (id === 'poster' || id === 'art-print') {
    return `- Poster / Fine Art Print Adaptation (${profile.name}): Preserve the original artistic intent as a complete, gallery-ready rectangular composition.
- Retain intentional backgrounds, subtle paper/ink atmosphere, borders, visual hierarchy, and balanced outer margins rather than stripping the background out.`;
  }

  if (id === 'desk-mat' || id === 'mousepad') {
    return `- ${profile.name} Wide-Format Adaptation: Adapt the composition cleanly into a landscape rectangular desk surface without stretching or distorting the original artwork’s typography or illustrations.
- Where wider horizontal space is needed, extend the background smoothly using complementary textures, subtle atmospheric gradients, or understated motifs directly derived from the original design.
- Keep primary focal illustrations and readable text cleanly balanced inside stitched-edge safe zones.`;
  }

  if (id === 'laptop-sleeve') {
    return `- Laptop Sleeve Adaptation: Compose cleanly for a horizontal rectangular front panel with generous perimeter margin inside zipper/stitching seams so important details are never clipped.
- ${
      resolvedBgMode === 'full-background'
        ? 'Extend the artwork’s backdrop seamlessly to edge bleed without stretching primary subjects.'
        : 'Keep the isolated emblem/illustration crisp and centered cleanly.'
    }`;
  }

  if (id === 'tote-bag') {
    return `- Tote Bag Adaptation: Present as a cohesive, mid-upper bag spot graphic with strong readable linework and medium-to-bold typography suited to woven cotton canvas.`;
  }

  // Fallback for custom user-added merchandise profiles
  return `- ${profile.name} Adaptation: Tailor the composition for this product’s surface (${profile.printSurfaceCharacteristics}) using its preferred layout: ${profile.preferredComposition}`;
}

function getLayoutModificationDirective(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile
): string {
  const needsAspectShift =
    (profile.typicalOrientation === 'horizontal' &&
      analysis.aspectProfile !== 'landscape' &&
      analysis.aspectProfile !== 'wide-panoramic') ||
    (profile.typicalOrientation === 'vertical' && analysis.aspectProfile === 'wide-panoramic');

  if (
    analysis.worksWithoutModification &&
    !needsAspectShift &&
    !(profile.category === 'drinkware' && analysis.detailLevel === 'intricate')
  ) {
    return `- Minimal Redesign Needed: The existing artwork composition already suits ${profile.name}. Focus on preserving the exact layout and proportions while cleaning edges, preparing the background treatment cleanly, and ensuring crisp production readability—avoid forcing unnecessary rearrangements.`;
  }

  const actions: string[] = [];
  if (needsAspectShift) {
    actions.push(
      `recompose smoothly toward a ${profile.typicalOrientation} format suited to ${profile.name} by adjusting spacing, arrangement, or background margins rather than stretching the art`
    );
  }
  if (profile.category === 'drinkware' && (analysis.detailLevel === 'intricate' || analysis.textDensity === 'high')) {
    actions.push(
      'cleanly simplify minor peripheral clutter and strengthen secondary text legibility so the core message stays sharp on a compact curved surface'
    );
  }
  if (actions.length === 0) {
    actions.push(profile.recommendedDesignAdjustments);
  }

  return `- Targeted Composition Adjustments: ${actions.join('; ')}. Keep every adjustment faithful to the original artwork’s aesthetic without inventing unrelated objects or decorative props.`;
}

export function buildDesignAdaptationPrompt(
  analysis: DesignAnalysisResult,
  profile: MerchandiseProductProfile,
  options: DesignAdaptationOptions
): string {
  const bgDecision = resolveBackgroundTreatment(
    analysis,
    profile,
    options.backgroundTreatment
  );
  const colorDecision = resolveColorTreatment(
    analysis,
    profile,
    options.colorTreatment,
    options.productColor
  );

  const exactTextInstruction = analysis.exactVisibleText
    ? `Preserve the exact text wording and spelling verbatim: "${analysis.exactVisibleText}". Do NOT rewrite the joke, alter words, or distort letterforms.`
    : 'Preserve all original lettering, labels, or visual symbols cleanly without inventing new slogans or gibberish text.';

  const preserveList =
    analysis.elementsToPreserve.length > 0
      ? analysis.elementsToPreserve
      : analysis.importantElements;

  const preservationLine =
    preserveList.length > 0
      ? `Core visual motifs & elements to retain intact: ${preserveList.join(', ')}.`
      : 'Keep the original illustration subject, line quality, and visual motifs intact.';

  const backgroundBlock =
    bgDecision.mode === 'transparent'
      ? `4. BACKGROUND & TRANSPARENCY (TRUE ALPHA PNG):
- Output the adapted artwork on a GENUINELY TRANSPARENT BACKGROUND (PNG with true alpha channel transparency).
- Keep outer edges clean, sharp, and anti-aliased with zero white fringe or haloing.
- STRICT PROHIBITION: No solid background box, no white canvas fill, no fake checkerboard grid, no simulated transparency pattern, and no physical product mockup or background scene.`
      : `4. BACKGROUND & COMPOSITION FILL (FULL-BACKGROUND):
- Deliver a complete, cohesive FULL-BACKGROUND composition filling the ${profile.typicalOrientation === 'horizontal' ? 'landscape rectangular' : profile.typicalOrientation === 'vertical' ? 'vertical rectangular' : 'intended'} print area cleanly.
- Preserve the artwork’s original backdrop atmosphere (${analysis.currentBackground.replace(/-/g, ' ')}) or extend it seamlessly with matching texture/tone—never leave awkward blank white scanner borders or uncoordinated margins.`;

  const colorLines = [
    `- Target Product Context: ${profile.name} (${colorDecision.targetProductColor}).`,
    `- Printing Process Context: ${profile.printingMethod}.`,
  ];

  if (colorDecision.mode === 'preserve-original') {
    colorLines.push(
      `- Color Preservation: Keep the original color palette intact (${analysis.dominantColors.join(', ') || 'original tones'}) without altering meaningful brand or illustration colors.`
    );
  } else {
    colorLines.push(
      `- Targeted Contrast & Color Harmony: Preserve the artwork’s recognizable palette (${analysis.dominantColors.join(', ') || 'original palette'}) and visual identity; make ONLY targeted contrast/legibility refinements:`
    );
  }

  for (const adj of colorDecision.adjustments) {
    colorLines.push(`  • ${adj}`);
  }

  if (profile.exactPrintSpecifications?.trim()) {
    colorLines.push(`- Custom Print Specifications: ${profile.exactPrintSpecifications.trim()}`);
  }

  if (profile.additionalInstructions?.trim()) {
    colorLines.push(`- Profile Guidance: ${profile.additionalInstructions.trim()}`);
  }

  const customUserNotesBlock = options.customNotes?.trim()
    ? `\n\nADDITIONAL ART-DIRECTION NOTES:\n- ${options.customNotes.trim()}`
    : '';

  return `Use the attached original artwork as the strict visual source of truth and adapt it specifically for production printing on a ${profile.name} (${profile.category.replace(/-/g, ' ')}).

1. ORIGINAL ARTWORK IDENTITY & STRICT PRESERVATION:
- Design Concept & Meaning: ${analysis.conceptSummary} (Theme: ${analysis.themeOrTopic}; Aesthetic: ${analysis.visualIdentity}; Format: ${analysis.compositionType}).
- ${exactTextInstruction}
- ${preservationLine}
- Do NOT replace the artwork with a generic redesign, add unrelated objects, or change the artistic style.

2. TARGET PRODUCT & PRINT SURFACE (${profile.name.toUpperCase()}):
- Physical Surface Context: ${profile.printSurfaceCharacteristics}
${getProductSpecificLayoutInstructions(analysis, profile, bgDecision.mode)}

3. LAYOUT & COMPOSITION ADJUSTMENTS:
${getLayoutModificationDirective(analysis, profile)}
- Recommended Adaptation Target: ${profile.preferredComposition}

${backgroundBlock}

5. COLOR, CONTRAST & PRODUCTION PREPARATION:
${colorLines.join('\n')}${customUserNotesBlock}

6. FINAL OUTPUT REQUIREMENTS (ARTWORK FILE ONLY):
- Produce ONLY the finished adapted flat graphic artwork itself, ready for further print-file preparation.
- DO NOT render a physical ${profile.name.toLowerCase()}, ecommerce mockup, lifestyle background, studio tabletop, drop shadow cast onto a wall, or hand holding the product.
- Keep edges clean, typography sharp and legible, and proportions undistorted (final pixel resolution and supplier print specs should still be verified separately before publishing).`;
}
