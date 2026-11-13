import { buildChatGPTPhotoPrompt, buildGeminiPhotoPrompt } from '../modelFormatters';
import {
  CLOTHING_PRESENTATION_LIST,
  CLOTHING_PRESENTATION_PRESETS,
  isPresetSupportedForGarment,
  resolveClothingCamera,
  resolveClothingPresentation,
} from '../../image/clothing';
import {
  buildGiftGuideHeroPrompt,
  HERO_PROP_DENSITY_OPTIONS,
  inferHeroProductCategoryFromName,
  resolveHeroCameraPerspective,
} from '../../image/giftGuideHero';
import { STUDIO_BACKGROUNDS } from '../studioOptions';
import {
  ClothingPresentation,
  GiftGuideHeroPromptOptions,
  HeroProductReference,
  ProductType,
  PromptOptions,
} from '../../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  console.log('Running Prompt Studio Photography & Clothing Presentation Tests...');

  // ==========================================
  // Existing Baseline Tests (Backward Compatibility)
  // ==========================================

  // Test 1: Folded T-shirt orientation (legacy saved config without clothingPresentation)
  const tshirtOptions: PromptOptions = {
    productType: 'tshirt',
    orientation: 'folded',
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '1:1',
    additionalInstructions: '',
    cameraAngle: 'straight-on',
    shotType: 'hero-product',
    lightingStyle: 'large-soft-studio',
  };

  const tshirtPrompt = buildGeminiPhotoPrompt(tshirtOptions);
  if (
    !tshirtPrompt.includes('resting flat on the tabletop surface') ||
    !tshirtPrompt.includes('front printed graphic facing upward')
  ) {
    throw new Error(
      'Test 1 Failed: Folded T-shirt orientation instructions missing flat resting or graphic facing upward'
    );
  }
  console.log('Test 1 Passed: Folded T-shirt orientation staging verified.');

  // Test 2: Upright Mug orientation
  const mugOptions: PromptOptions = {
    productType: 'mug',
    orientation: 'upright',
    background: 'science-gradient',
    surface: 'light-stone',
    props: 'minimal-subtle',
    aspectRatio: '3:4',
    additionalInstructions: '',
    cameraAngle: 'three-quarter',
    shotType: 'hero-product',
    lightingStyle: 'soft-daylight',
  };

  const mugPrompt = buildGeminiPhotoPrompt(mugOptions);
  if (
    !mugPrompt.includes('Standing upright and resting firmly on its solid base') ||
    !mugPrompt.includes('no suspension or invisible support')
  ) {
    throw new Error('Test 2 Failed: Upright Mug orientation missing solid base resting instruction');
  }
  console.log('Test 2 Passed: Upright Mug orientation verified.');

  // Test 3: Flat-lay orientation
  const notebookOptions: PromptOptions = {
    productType: 'notebook',
    orientation: 'flat-lay',
    background: 'warm-ivory',
    surface: 'paper-archival',
    props: 'none',
    aspectRatio: '3:2',
    additionalInstructions: '',
    cameraAngle: 'gentle-overhead',
    shotType: 'standard-catalog',
    lightingStyle: 'diffused-frontal',
  };

  const notebookPrompt = buildGeminiPhotoPrompt(notebookOptions);
  if (
    !notebookPrompt.includes('Architectural 90-degree overhead flat-lay view') ||
    !notebookPrompt.includes('Overhead 90-degree flat-lay camera looking straight down')
  ) {
    throw new Error(
      'Test 3 Failed: Flat-lay orientation or camera angle missing 90-degree overhead instruction'
    );
  }
  console.log('Test 3 Passed: Flat-lay notebook orientation and camera verified.');

  // Test 4: Potted Plant Styling toggle
  const plantOptionsTrue: PromptOptions = {
    ...tshirtOptions,
    includePottedPlant: true,
  };
  const plantPromptTrue = buildGeminiPhotoPrompt(plantOptionsTrue);
  if (!plantPromptTrue.includes('Potted Plant Styling')) {
    throw new Error('Test 4 Failed: includePottedPlant=true did not include plant instruction');
  }

  const plantOptionsFalse: PromptOptions = {
    ...tshirtOptions,
    includePottedPlant: false,
  };
  const plantPromptFalse = buildGeminiPhotoPrompt(plantOptionsFalse);
  if (plantPromptFalse.includes('Potted Plant Styling')) {
    throw new Error(
      'Test 4 Failed: includePottedPlant=false included plant instruction when it should not have'
    );
  }
  console.log('Test 4 Passed: Potted Plant Styling toggle verified.');

  // Test 5: Tabletop construction and minimal prop count
  const tabletopOptions: PromptOptions = {
    ...mugOptions,
    surface: 'travertine',
    props: 'subtle-historical',
    propLevel: 'minimal',
  };
  const tabletopPrompt = buildGeminiPhotoPrompt(tabletopOptions);
  if (
    !tabletopPrompt.includes('substantial, solid tabletop or platform') ||
    !tabletopPrompt.includes('Prefer two distinct, complementary secondary props')
  ) {
    throw new Error(
      'Test 5 Failed: Tabletop construction or minimal prop count guidance missing'
    );
  }
  console.log('Test 5 Passed: Tabletop physical construction and minimal prop count verified.');

  // ==========================================
  // New Clothing Presentation & Garment Tests
  // ==========================================

  // Test 6: Verify all 15 presets exist and are tested with applicable garments
  const expectedPresets: ClothingPresentation[] = [
    'classic-symmetrical-flat-lay',
    'diagonal-flat-lay',
    'relaxed-natural-flat-lay',
    'asymmetrical-sleeve-flat-lay',
    'editorial-flat-lay-with-props',
    'folded-full-graphic',
    'compact-boutique-fold',
    'hoodie-hood-displayed',
    'layered-folded-stack',
    'three-quarter-tabletop',
    'low-angle-tabletop',
    'hanger-presentation',
    'ghost-mannequin',
    'front-and-back',
    'close-up-detail',
  ];

  assert(
    CLOTHING_PRESENTATION_LIST.length === 15,
    `Expected 15 clothing presets, found ${CLOTHING_PRESENTATION_LIST.length}`
  );

  for (const presetId of expectedPresets) {
    const meta = CLOTHING_PRESENTATION_PRESETS[presetId];
    assert(Boolean(meta), `Missing metadata for preset ${presetId}`);
    assert(meta.supportedGarments.length > 0, `Preset ${presetId} has no supported garments`);

    for (const garment of meta.supportedGarments) {
      const opts: PromptOptions = {
        productType: garment,
        orientation: meta.baseOrientation,
        clothingPresentation: presetId,
        background: 'gradient-wall-neutral-surface',
        surface: 'editorial-tabletop',
        props: 'minimal-subtle',
        aspectRatio: '1:1',
        cameraAngle: meta.defaultCameraAngle,
      };
      const chatgpt = buildChatGPTPhotoPrompt(opts);
      const gemini = buildGeminiPhotoPrompt(opts);

      assert(
        gemini.includes(`(${presetId})`),
        `Gemini prompt for ${garment} + ${presetId} did not include preset identifier`
      );
      assert(
        chatgpt.includes('PRESERVE ORIGINAL ARTWORK & LETTERING') &&
          chatgpt.includes('DO NOT INVENT BACK DETAILS'),
        `ChatGPT prompt for ${garment} + ${presetId} missing core artwork preservation directives`
      );
      assert(
        gemini.includes('do not invent details on the back'),
        `Gemini prompt for ${garment} + ${presetId} missing back-detail non-invention rule`
      );
    }
  }
  console.log('Test 6 Passed: All 15 clothing presentation presets verified across supported garments.');

  // Test 7: Verify T-shirt, Sweatshirt, and Hoodie garment-specific construction details
  const garments: ProductType[] = ['tshirt', 'sweatshirt', 'hoodie'];
  for (const garment of garments) {
    const prompt = buildChatGPTPhotoPrompt({
      productType: garment,
      orientation: 'flat-lay',
      clothingPresentation: 'relaxed-natural-flat-lay',
      background: 'science-gradient',
      surface: 'light-stone',
      props: 'none',
      aspectRatio: '3:4',
    });

    if (garment === 'tshirt') {
      assert(
        prompt.includes('Apparel / T-shirt') && prompt.includes('cotton jersey'),
        'T-shirt prompt missing T-shirt category or cotton jersey details'
      );
    } else if (garment === 'sweatshirt') {
      assert(
        prompt.includes('Apparel / Sweatshirt') &&
          prompt.includes('without adding a hood or drawstrings'),
        'Sweatshirt prompt missing Sweatshirt category or no-hood constraint'
      );
    } else if (garment === 'hoodie') {
      assert(
        prompt.includes('Apparel / Hoodie') && prompt.includes('double-layer hood'),
        'Hoodie prompt missing Hoodie category or double-layer hood details'
      );
    }
  }
  console.log('Test 7 Passed: T-shirt, Sweatshirt, and Hoodie garment fidelity verified.');

  // Test 8: Verify garment-aware preset compatibility and switching resolution
  assert(
    !isPresetSupportedForGarment('hoodie-hood-displayed', 'tshirt'),
    'hoodie-hood-displayed should not be supported for tshirt'
  );
  assert(
    !isPresetSupportedForGarment('hoodie-hood-displayed', 'sweatshirt'),
    'hoodie-hood-displayed should not be supported for sweatshirt'
  );
  assert(
    isPresetSupportedForGarment('hoodie-hood-displayed', 'hoodie'),
    'hoodie-hood-displayed should be supported for hoodie'
  );
  assert(
    !isPresetSupportedForGarment('folded-full-graphic', 'hoodie'),
    'folded-full-graphic should be resolved to hoodie-hood-displayed for hoodie'
  );

  assert(
    resolveClothingPresentation('tshirt', 'hoodie-hood-displayed', 'folded') ===
      'folded-full-graphic',
    'Switching from hoodie (hoodie-hood-displayed) to tshirt should resolve to folded-full-graphic'
  );
  assert(
    resolveClothingPresentation('sweatshirt', 'hoodie-hood-displayed', 'folded') ===
      'folded-full-graphic',
    'Switching from hoodie (hoodie-hood-displayed) to sweatshirt should resolve to folded-full-graphic'
  );
  assert(
    resolveClothingPresentation('hoodie', 'folded-full-graphic', 'folded') ===
      'hoodie-hood-displayed',
    'Switching from tshirt (folded-full-graphic) to hoodie should resolve to hoodie-hood-displayed'
  );
  assert(
    resolveClothingPresentation('hoodie', 'classic-symmetrical-flat-lay', 'flat-lay') ===
      'relaxed-natural-flat-lay',
    'Switching from tshirt (classic-symmetrical-flat-lay) to hoodie should resolve to relaxed-natural-flat-lay'
  );
  console.log('Test 8 Passed: Garment-aware compatibility and switching resolution verified.');

  // Test 9: Verify Camera-Angle Conflict Resolution (No contradictory instructions)
  // 9a: Flat-lay with incompatible low/eye-level camera angle
  const flatLayConflictOpts: PromptOptions = {
    productType: 'tshirt',
    orientation: 'flat-lay',
    clothingPresentation: 'diagonal-flat-lay',
    cameraAngle: 'slightly-lowered',
    background: 'neutral-editorial',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '1:1',
  };
  const resolvedFlatLayCam = resolveClothingCamera(flatLayConflictOpts);
  assert(
    resolvedFlatLayCam.effectiveCameraAngle === 'gentle-overhead' &&
      resolvedFlatLayCam.wasCameraOverridden === true,
    'Flat-lay with slightly-lowered camera should override to gentle-overhead'
  );
  const flatLayChatGpt = buildChatGPTPhotoPrompt(flatLayConflictOpts);
  const flatLayGemini = buildGeminiPhotoPrompt(flatLayConflictOpts);
  assert(
    flatLayChatGpt.includes('directly overhead at a true 90-degree') &&
      !flatLayChatGpt.includes('slightly lowered camera perspective'),
    'ChatGPT flat-lay prompt must not contain contradictory slightly lowered camera instructions'
  );
  assert(
    flatLayGemini.includes('Overhead 90-degree flat-lay camera') &&
      !flatLayGemini.includes('slightly lowered'),
    'Gemini flat-lay prompt must not contain contradictory slightly lowered camera instructions'
  );

  // 9b: Hanger presentation with incompatible flat-lay / overhead settings
  const hangerConflictOpts: PromptOptions = {
    productType: 'sweatshirt',
    orientation: 'flat-lay',
    clothingPresentation: 'hanger-presentation',
    cameraAngle: 'gentle-overhead',
    background: 'neutral-editorial',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '3:4',
  };
  const hangerChatGpt = buildChatGPTPhotoPrompt(hangerConflictOpts);
  const hangerGemini = buildGeminiPhotoPrompt(hangerConflictOpts);
  assert(
    hangerChatGpt.includes('Hanger Presentation') &&
      hangerChatGpt.includes('Vertical Hanger Staging') &&
      !hangerChatGpt.includes('Resting firmly on a honed pale travertine limestone slab') &&
      !hangerChatGpt.includes('No human models, no visible necks, no mannequins, no hangers'),
    'ChatGPT hanger prompt must not describe tabletop slab resting or forbid the hanger'
  );
  assert(
    hangerGemini.includes('Hanger presentation (hanger-presentation)') &&
      hangerGemini.includes('perpendicular to the hanging garment') &&
      !hangerGemini.includes('Overhead 90-degree flat-lay camera'),
    'Gemini hanger prompt must not describe a 90-degree flat-lay camera'
  );

  // 9c: Ghost mannequin presentation
  const ghostConflictOpts: PromptOptions = {
    productType: 'hoodie',
    orientation: 'flat-lay',
    clothingPresentation: 'ghost-mannequin',
    cameraAngle: 'gentle-overhead',
    background: 'science-gradient',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '3:4',
  };
  const ghostChatGpt = buildChatGPTPhotoPrompt(ghostConflictOpts);
  assert(
    ghostChatGpt.includes('Ghost Mannequin Presentation') &&
      ghostChatGpt.includes('Three-Dimensional Studio Suspension') &&
      !ghostChatGpt.includes('no phantom mannequins'),
    'Ghost mannequin prompt must not forbid phantom/ghost mannequin silhouette or require tabletop resting'
  );

  // 9d: Editorial flat lay with props when props='none'
  const editorialPropsOpts: PromptOptions = {
    productType: 'tshirt',
    orientation: 'flat-lay',
    clothingPresentation: 'editorial-flat-lay-with-props',
    cameraAngle: 'gentle-overhead',
    background: 'warm-ivory',
    surface: 'light-wood',
    props: 'none',
    propLevel: 'none',
    aspectRatio: '1:1',
  };
  const editorialPropsChatGpt = buildChatGPTPhotoPrompt(editorialPropsOpts);
  assert(
    !editorialPropsChatGpt.includes('Prop Level: None') &&
      editorialPropsChatGpt.includes('NEVER overlap, touch, or obscure the garment\'s printed design'),
    'Editorial flat lay with props must enable restrained non-overlapping props even when propLevel was none'
  );
  console.log('Test 9 Passed: Camera-angle, surface, and prop conflict resolution verified.');

  // ==========================================
  // Gift Guide Hero Image Prompt Generator Tests
  // ==========================================

  // Test 10: Filename category inference
  assert(inferHeroProductCategoryFromName('galileo-tshirt.png') === 'tshirt', 'Should infer tshirt');
  assert(inferHeroProductCategoryFromName('crewneck-sweatshirt.png') === 'sweatshirt', 'Should infer sweatshirt');
  assert(inferHeroProductCategoryFromName('observatory-hoodie.jpg') === 'hoodie', 'Should infer hoodie');
  assert(inferHeroProductCategoryFromName('lunar-ceramic-mug.png') === 'mug', 'Should infer mug');
  assert(inferHeroProductCategoryFromName('insulated-water-bottle.png') === 'waterBottle', 'Should infer waterBottle');
  assert(inferHeroProductCategoryFromName('star-chart-poster.png') === 'poster', 'Should infer poster');
  assert(inferHeroProductCategoryFromName('canvas-tote-bag.png') === 'toteBag', 'Should infer toteBag');
  console.log('Test 10 Passed: Gift Guide Hero filename category inference verified.');

  // Test 11: Clothing-only hero composition uses overhead perspective & garment rules
  const clothingOnlyProducts: HeroProductReference[] = [
    {
      id: 'c1',
      name: 'schrodinger-cat-tshirt.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '18 KB',
      category: 'tshirt',
      isPrimaryHero: true,
    },
    {
      id: 'c2',
      name: 'maxwell-equations-hoodie.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '22 KB',
      category: 'hoodie',
      isPrimaryHero: false,
    },
    {
      id: 'c3',
      name: 'fibonacci-crewneck-sweatshirt.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '20 KB',
      category: 'sweatshirt',
      isPrimaryHero: false,
    },
  ];

  const clothingHeroOptions: GiftGuideHeroPromptOptions = {
    products: clothingOnlyProducts,
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    propDensity: 'balanced',
    aspectRatio: '16:9',
  };

  const clothingCamera = resolveHeroCameraPerspective(clothingHeroOptions);
  assert(
    clothingCamera.mode === 'overhead-flat',
    'Clothing-only hero composition should resolve to overhead-flat perspective'
  );

  const clothingHeroPrompt = buildGiftGuideHeroPrompt(clothingHeroOptions);

  // Verify all 7 sections and all 3 product filenames are present
  assert(
    clothingHeroPrompt.includes('1. OVERALL PHOTOGRAPHIC OBJECTIVE & VISUAL STYLE') &&
      clothingHeroPrompt.includes('2. REFERENCE-IMAGE FIDELITY REQUIREMENTS') &&
      clothingHeroPrompt.includes('3. PRODUCT-SPECIFIC POSITIONING & ARRANGEMENT') &&
      clothingHeroPrompt.includes('4. COMPOSITION HIERARCHY & CAMERA PERSPECTIVE') &&
      clothingHeroPrompt.includes('5. SELECTED PROP-DENSITY INSTRUCTIONS') &&
      clothingHeroPrompt.includes('6. SELECTED BACKGROUND & LIGHTING CONFIGURATION') &&
      clothingHeroPrompt.includes('7. FRAMING, REALISM & NEGATIVE CONSTRAINTS'),
    'Clothing hero prompt must include all 7 required structural sections'
  );
  for (const prod of clothingOnlyProducts) {
    assert(
      clothingHeroPrompt.includes(prod.name),
      `Clothing hero prompt did not account for uploaded product ${prod.name}`
    );
  }
  assert(
    clothingHeroPrompt.includes('80–90 degrees') &&
      clothingHeroPrompt.includes('Primary Hero Anchor'),
    'Clothing hero prompt missing overhead perspective or Primary Hero Anchor instruction'
  );
  console.log('Test 11 Passed: Clothing-only hero composition prompt verified.');

  // Test 12: Mixed composition containing clothing, a mug, a water bottle, and a poster
  const mixedProducts: HeroProductReference[] = [
    {
      id: 'm1',
      name: 'apollo-schematic-tshirt.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '18 KB',
      category: 'tshirt',
      isPrimaryHero: true,
    },
    {
      id: 'm2',
      name: 'galileo-moon-mug.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '14 KB',
      category: 'mug',
    },
    {
      id: 'm3',
      name: 'deep-field-water-bottle.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '16 KB',
      category: 'waterBottle',
    },
    {
      id: 'm4',
      name: 'celestial-atlas-poster.png',
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      size: '24 KB',
      category: 'poster',
    },
  ];

  const mixedHeroOptions: GiftGuideHeroPromptOptions = {
    products: mixedProducts,
    background: 'science-gradient',
    surface: 'light-stone',
    propDensity: 'balanced',
    aspectRatio: '16:9',
  };

  const mixedCamera = resolveHeroCameraPerspective(mixedHeroOptions);
  assert(
    mixedCamera.mode === 'elevated-three-quarter',
    'Mixed composition with 3D vessels must resolve to elevated-three-quarter perspective'
  );

  const mixedHeroPrompt = buildGiftGuideHeroPrompt(mixedHeroOptions);

  for (const prod of mixedProducts) {
    assert(
      mixedHeroPrompt.includes(prod.name),
      `Mixed hero prompt missing uploaded product reference ${prod.name}`
    );
  }
  assert(
    mixedHeroPrompt.includes('35–45 degrees') &&
      mixedHeroPrompt.includes('apollo-schematic-tshirt.png (T-shirt') &&
      mixedHeroPrompt.includes('galileo-moon-mug.png (Mug') &&
      mixedHeroPrompt.includes('deep-field-water-bottle.png (Water bottle') &&
      mixedHeroPrompt.includes('celestial-atlas-poster.png (Poster'),
    'Mixed hero prompt missing elevated three-quarter camera or category-specific positioning for T-shirt, mug, water bottle, or poster'
  );
  assert(
    mixedHeroPrompt.includes('Stand upright resting firmly on its solid ceramic base') &&
      mixedHeroPrompt.includes('Position standing upright on its base or resting at a gentle, physically stable angle') &&
      mixedHeroPrompt.includes('avoid severe perspective distortion'),
    'Mixed hero prompt missing category-specific staging safeguards for drinkware/posters'
  );
  console.log('Test 12 Passed: Mixed composition (clothing, mug, water bottle, poster) verified.');

  // Test 13: Verify all three prop-density settings (minimal, balanced, rich)
  assert(
    HERO_PROP_DENSITY_OPTIONS.length === 3,
    'Expected exactly 3 prop density options (minimal, balanced, rich)'
  );
  for (const densityOpt of HERO_PROP_DENSITY_OPTIONS) {
    const promptWithDensity = buildGiftGuideHeroPrompt({
      products: mixedProducts,
      background: 'gradient-wall-neutral-surface',
      surface: 'editorial-tabletop',
      propDensity: densityOpt.id,
      aspectRatio: '16:9',
    });

    if (densityOpt.id === 'minimal') {
      assert(
        promptWithDensity.includes('Minimal Prop Density:') &&
          promptWithDensity.includes('Include no decorative props by default'),
        'Minimal prop density prompt missing expected concrete instructions'
      );
    } else if (densityOpt.id === 'balanced') {
      assert(
        promptWithDensity.includes('Balanced Prop Density (Default):') &&
          promptWithDensity.includes('Include a small number of carefully selected, complementary, unbranded studio props'),
        'Balanced prop density prompt missing expected concrete instructions'
      );
    } else if (densityOpt.id === 'rich') {
      assert(
        promptWithDensity.includes('Rich Editorial Prop Density:') &&
          promptWithDensity.includes('Compose a more layered editorial still life'),
        'Rich prop density prompt missing expected concrete instructions'
      );
    }
  }
  console.log('Test 13 Passed: All three prop-density settings (Minimal, Balanced, Rich) verified.');

  // Test 14: Verify all supported background configurations in Gift Guide Hero prompt
  for (const bg of STUDIO_BACKGROUNDS) {
    const bgPrompt = buildGiftGuideHeroPrompt({
      products: mixedProducts,
      background: bg.id,
      surface: 'editorial-tabletop',
      propDensity: 'balanced',
      aspectRatio: '16:9',
    });
    assert(
      bgPrompt.includes('Unified Studio Backdrop:') &&
        bgPrompt.includes('Background Treatment:'),
      `Background ${bg.id} did not render background setting or uniform enforcement in hero prompt`
    );
  }
  console.log('Test 14 Passed: All supported studio background configurations verified in Hero mode.');

  // Test 15: Verify adding >= 8 (10) product images, removing individual images, and generating prompt with all remaining 8 products represented
  const tenProducts: HeroProductReference[] = [
    { id: 'p1', name: '01-galileo-telescope-tee.png', category: 'tshirt', isPrimaryHero: true },
    { id: 'p2', name: '02-observatory-fleece-hoodie.png', category: 'hoodie' },
    { id: 'p3', name: '03-orbital-crewneck-sweatshirt.png', category: 'sweatshirt' },
    { id: 'p4', name: '04-fibonacci-ceramic-mug.png', category: 'mug' },
    { id: 'p5', name: '05-quantum-vacuum-water-bottle.png', category: 'waterBottle' },
    { id: 'p6', name: '06-celestial-atlas-poster.png', category: 'poster' },
    { id: 'p7', name: '07-botanical-taxonomy-tote-bag.png', category: 'toteBag' },
    { id: 'p8', name: '08-principia-hardcover-notebook.png', category: 'notebook' },
    { id: 'p9', name: '09-thermodynamics-insulated-tumbler.png', category: 'tumbler' },
    { id: 'p10', name: '10-lab-beaker-etched-glass.png', category: 'glass' },
  ];

  const tenProductPrompt = buildGiftGuideHeroPrompt({
    products: tenProducts,
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    propDensity: 'balanced',
    aspectRatio: '16:9',
  });

  assert(
    tenProductPrompt.includes('SUPPLIED PRODUCT REFERENCE IMAGES (10 ITEMS — ALL 10 MUST BE INCLUDED)') &&
      tenProductPrompt.includes('Complete Product Accounting (10 of 10)'),
    '10-product prompt must explicitly declare all 10 items without truncation'
  );
  for (let i = 0; i < tenProducts.length; i++) {
    const prod = tenProducts[i];
    assert(
      tenProductPrompt.includes(`Reference Image ${i + 1} of 10 (${prod.name}`) &&
        tenProductPrompt.includes(`[${i + 1}/10] ${prod.name}`),
      `10-product prompt failed to include product #${i + 1} (${prod.name}) in both fidelity and arrangement sections`
    );
  }

  // Now simulate removing 2 individual products (p3 and p7), leaving 8 products
  const removedIds = new Set(['p3', 'p7']);
  const remainingEightProducts = tenProducts.filter((p) => !removedIds.has(p.id));
  assert(remainingEightProducts.length === 8, 'Expected 8 remaining products after removing 2 items');

  const eightProductPrompt = buildGiftGuideHeroPrompt({
    products: remainingEightProducts,
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    propDensity: 'balanced',
    aspectRatio: '16:9',
  });

  assert(
    eightProductPrompt.includes('SUPPLIED PRODUCT REFERENCE IMAGES (8 ITEMS — ALL 8 MUST BE INCLUDED)') &&
      eightProductPrompt.includes('Complete Product Accounting (8 of 8)') &&
      eightProductPrompt.includes('With 8 products in the scene, organize the ensemble across staggered foreground, midground, and rear depth planes'),
    '8-product prompt must account for all 8 remaining items and include multi-item depth-plane guidance'
  );

  for (let i = 0; i < remainingEightProducts.length; i++) {
    const prod = remainingEightProducts[i];
    assert(
      eightProductPrompt.includes(`Reference Image ${i + 1} of 8 (${prod.name}`) &&
        eightProductPrompt.includes(`[${i + 1}/8] ${prod.name}`),
      `8-product prompt missing remaining product #${i + 1} (${prod.name})`
    );
  }

  assert(
    !eightProductPrompt.includes('03-orbital-crewneck-sweatshirt.png') &&
      !eightProductPrompt.includes('07-botanical-taxonomy-tote-bag.png'),
    '8-product prompt must not include removed products'
  );
  // ==========================================
  // Product Profiles, Editable Product Types & Product Copy Tests
  // ==========================================
  const {
    resetProfileManagerMemoryForTests,
    getProductTypes,
    addProductType,
    renameProductType,
    deleteProductType,
    getProductProfiles,
    createProductProfile,
    updateProductProfile,
    duplicateProductProfile,
    deleteProductProfile,
    applyProfileToOptions,
    hasUnsavedProfileEdits,
  } = await import('../../../utils/productProfileManager');
  const { generateProductCopyPrompt } = await import('../../writing/productCopy');

  resetProfileManagerMemoryForTests();

  // Test 16: Default product types and adding new product types with duplicate prevention
  const initialTypes = getProductTypes();
  assert(
    initialTypes.includes('Hoodie') &&
      initialTypes.includes('T-shirt') &&
      initialTypes.includes('Mug'),
    'Initial product types must include Hoodie, T-shirt, and Mug'
  );

  const addSmartwatchResult = addProductType('  Smartwatch   Band ');
  assert(
    addSmartwatchResult.success === true &&
      addSmartwatchResult.productType === 'Smartwatch Band' &&
      addSmartwatchResult.types.includes('Smartwatch Band'),
    'Adding "  Smartwatch   Band " should normalize whitespace and persist'
  );

  // Verify duplicate prevention across case and whitespace variations
  const dupResult1 = addProductType('smartwatch band');
  const dupResult2 = addProductType('  SMARTWATCH   BAND  ');
  assert(
    dupResult1.success === false && dupResult2.success === false,
    'Duplicate product types differing only by case or whitespace must be rejected'
  );
  console.log('Test 16 Passed: Editable product types addition and case/whitespace duplicate prevention verified.');

  // Test 17: Creating, selecting/applying, editing, duplicating, and deleting reusable product profiles
  const starterProfiles = getProductProfiles();
  assert(
    starterProfiles.some((p) => p.name === 'Standard Pullover Hoodie'),
    'Seeded profiles should include "Standard Pullover Hoodie"'
  );

  const createHoodieRes = createProductProfile({
    name: 'Observatory Zip Hoodie',
    productType: 'Hoodie',
    productConcept: 'Heavyweight observatory fleece engineered for cool-weather stargazing sessions.',
    keyFeatures: 'Double-lined hood with matte grommets\nFull-zip brass YKK closure\nTear-away neck label',
    materials: '80% ring-spun cotton, 20% recycled polyester fleece (9.5 oz/yd²)',
    dimensions: 'Unisex retail fit, S–3XL (Chest 38"–54")',
  });
  assert(
    createHoodieRes.success === true && Boolean(createHoodieRes.profile),
    'Should create "Observatory Zip Hoodie" profile'
  );
  const hoodieProfile = createHoodieRes.profile!;

  // Duplicate profile name check
  const dupProfileRes = createProductProfile({
    name: '  observatory zip   hoodie ',
    productType: 'Hoodie',
    productConcept: 'Another concept',
    keyFeatures: '',
    materials: '',
    dimensions: '',
  });
  assert(
    dupProfileRes.success === false,
    'Creating a profile with a duplicate normalized name must be prevented'
  );

  // Applying profile to ProductCopyOptions must populate specification fields while preserving item-specific fields
  const currentEntryOptions = {
    productName: 'Galileo 1610 Sidereus Nuncius Hoodie',
    productType: 'T-shirt',
    productConcept: 'Old concept',
    keyFeatures: 'Old features',
    materials: 'Old materials',
    dimensions: 'Old dimensions',
    targetCustomer: 'Amateur astronomers and physics students',
    occasion: 'Winter solstice gift',
    personalization: 'Optional custom observatory coordinates on sleeve',
    tone: 'sophisticated-editorial' as const,
    additionalInstructions: 'Mention Galileo’s 1610 Padua observations.',
  };

  const appliedOptions = applyProfileToOptions(currentEntryOptions, hoodieProfile);
  assert(
    appliedOptions.productType === 'Hoodie' &&
      appliedOptions.productConcept === hoodieProfile.productConcept &&
      appliedOptions.keyFeatures === hoodieProfile.keyFeatures &&
      appliedOptions.materials === hoodieProfile.materials &&
      appliedOptions.dimensions === hoodieProfile.dimensions,
    'Selecting a profile must immediately populate productType, productConcept, keyFeatures, materials, and dimensions'
  );
  assert(
    appliedOptions.productName === 'Galileo 1610 Sidereus Nuncius Hoodie' &&
      appliedOptions.targetCustomer === 'Amateur astronomers and physics students' &&
      appliedOptions.occasion === 'Winter solstice gift' &&
      appliedOptions.personalization === 'Optional custom observatory coordinates on sleeve' &&
      appliedOptions.tone === 'sophisticated-editorial' &&
      appliedOptions.additionalInstructions === 'Mention Galileo’s 1610 Padua observations.',
    'Selecting a profile must NOT overwrite item-specific fields (productName, targetCustomer, occasion, personalization, tone, additionalInstructions)'
  );

  // Verify no unsaved edits right after applying profile
  assert(
    hasUnsavedProfileEdits(appliedOptions, hoodieProfile) === false,
    'Right after applying profile, hasUnsavedProfileEdits should be false'
  );

  // Changing form fields after selecting a profile must NOT automatically modify the saved profile
  const modifiedFormOptions = {
    ...appliedOptions,
    materials: '100% organic combed cotton French terry (10 oz/yd²)',
  };
  assert(
    hasUnsavedProfileEdits(modifiedFormOptions, hoodieProfile) === true,
    'Modifying materials in form must be detected as unsaved profile edits'
  );
  const storedHoodieBeforeSave = getProductProfiles().find((p) => p.id === hoodieProfile.id)!;
  assert(
    storedHoodieBeforeSave.materials === '80% ring-spun cotton, 20% recycled polyester fleece (9.5 oz/yd²)',
    'Modifying form state must not mutate the stored profile until explicitly saved'
  );

  // Explicitly save changes to the profile
  const updateRes = updateProductProfile(hoodieProfile.id, {
    materials: modifiedFormOptions.materials,
  });
  assert(
    updateRes.success === true &&
      updateRes.profile?.materials === '100% organic combed cotton French terry (10 oz/yd²)',
    'Explicitly saving profile changes must update stored profile'
  );

  const countBeforeDuplicate = getProductProfiles().length;
  // Duplicate profile
  const duplicateRes = duplicateProductProfile(hoodieProfile.id);
  assert(
    duplicateRes.success === true &&
      duplicateRes.profile?.name === 'Observatory Zip Hoodie (Copy)' &&
      getProductProfiles().length === countBeforeDuplicate + 1,
    'Duplicating profile should create a copy with "(Copy)" suffix'
  );
  console.log('Test 17 Passed: Product profile creation, non-destructive selection, unsaved edit protection, explicit update, and duplication verified.');

  // Test 18: Product Type rename cascading and delete protection / reassignment for referenced profiles
  // There are 3 profiles with productType === 'Hoodie' now: Standard Pullover Hoodie, Observatory Zip Hoodie, Observatory Zip Hoodie (Copy)
  const renameTypeRes = renameProductType('Hoodie', 'Heavyweight Pullover Hoodie');
  assert(
    renameTypeRes.success === true &&
      renameTypeRes.updatedProfileCount === 3 &&
      getProductTypes().includes('Heavyweight Pullover Hoodie') &&
      !getProductTypes().includes('Hoodie'),
    'Renaming a product type must update the type list and return the count of updated profiles'
  );
  const hoodieProfilesAfterRename = getProductProfiles().filter(
    (p) => p.productType === 'Heavyweight Pullover Hoodie'
  );
  assert(
    hoodieProfilesAfterRename.length === 3,
    'All 3 profiles referencing the renamed product type must automatically update to the new name'
  );

  // Attempt to delete a product type that is referenced by saved profiles without reassignment
  const blockedDeleteRes = deleteProductType('Heavyweight Pullover Hoodie');
  assert(
    blockedDeleteRes.success === false &&
      (blockedDeleteRes.referencingProfiles?.length || 0) === 3,
    'Deleting a product type referenced by saved profiles without reassignment must be blocked'
  );

  // Delete the product type WITH explicit reassignment to 'Sweatshirt'
  const reassignedDeleteRes = deleteProductType('Heavyweight Pullover Hoodie', 'Sweatshirt');
  assert(
    reassignedDeleteRes.success === true &&
      reassignedDeleteRes.reassignedProfileCount === 3 &&
      !getProductTypes().includes('Heavyweight Pullover Hoodie') &&
      getProductProfiles().filter((p) => p.productType === 'Heavyweight Pullover Hoodie').length === 0,
    'Deleting a product type with reassignment must reassign referencing profiles and remove the type'
  );

  // Delete the duplicated profile and verify deletion
  const countBeforeDelete = getProductProfiles().length;
  const deleteProfileRes = deleteProductProfile(duplicateRes.profile!.id);
  assert(
    deleteProfileRes.success === true && getProductProfiles().length === countBeforeDelete - 1,
    'Deleting a product profile should remove it from storage'
  );
  console.log('Test 18 Passed: Product type rename cascading and delete protection/reassignment verified.');

  // Test 19: Verify generateProductCopyPrompt includes materials, dimensions, occasion, and personalization
  const copyPrompt = generateProductCopyPrompt(modifiedFormOptions);
  assert(
    copyPrompt.includes('Galileo 1610 Sidereus Nuncius Hoodie') &&
      copyPrompt.includes('100% organic combed cotton French terry') &&
      copyPrompt.includes('Unisex retail fit, S–3XL') &&
      copyPrompt.includes('Winter solstice gift') &&
      copyPrompt.includes('Optional custom observatory coordinates on sleeve') &&
      copyPrompt.includes('Double-lined hood with matte grommets'),
    'Generated Product Copy prompt must include productName, materials, dimensions, occasion, personalization, and keyFeatures'
  );
  console.log('Test 19 Passed: Product Copy prompt generation with profile specifications verified.');

  // ==========================================
  // Smart Setup & One-Click Next Look Tests
  // ==========================================
  const {
    applySmartSetupToSettings,
    CURATED_STUDIO_LOOKS,
    getNextStudioLook,
  } = await import('../smartSetup');

  const baseSettings = {
    productType: 'notebook' as const,
    orientation: 'flat-lay' as const,
    background: 'gradient-wall-neutral-surface' as const,
    surface: 'editorial-tabletop' as const,
    props: 'subtle-historical' as const,
    aspectRatio: '3:4' as const,
    additionalInstructions: 'Keep gold foil crisp and legible.',
    theme: 'editorial-still-life' as const,
    productPosition: 'centered' as const,
    productPresentation: 'editorial' as const,
    shotType: 'hero-product' as const,
    cameraAngle: 'three-quarter' as const,
    perspective: 'natural' as const,
    focalLength: 'normal-editorial' as const,
    depthOfField: 'gentle-falloff' as const,
    compositionStyle: 'centered' as const,
    negativeSpace: 'balanced' as const,
    lightingStyle: 'large-soft-studio' as const,
    shadowCharacter: 'soft' as const,
    propLevel: 'minimal' as const,
    propFamily: 'category-aware' as const,
    propPlacement: 'background-only' as const,
    colorPalette: 'science-blue-mint' as const,
    variationLevel: 'moderate' as const,
    websiteCropSafe: true,
  };

  // Test 20: Smart setup defaults for hoodie, tshirt, mug, notebook, poster, and flat accessories
  const hoodieSetup = applySmartSetupToSettings(
    {
      productType: 'hoodie',
      customProductType: '',
      detectedLabel: 'Heavyweight Pullover Hoodie',
      surfaceFormFactor: 'garment',
      confidence: 'high',
      briefNotes: 'Front chest graphic visible',
    },
    baseSettings
  );
  assert(
    hoodieSetup.productType === 'hoodie' &&
      hoodieSetup.orientation === 'flat-lay' &&
      hoodieSetup.clothingPresentation === 'relaxed-natural-flat-lay' &&
      hoodieSetup.cameraAngle === 'gentle-overhead' &&
      hoodieSetup.aspectRatio === '3:4' &&
      hoodieSetup.additionalInstructions === 'Keep gold foil crisp and legible.' &&
      hoodieSetup.websiteCropSafe === true,
    'Hoodie smart setup must configure flat-lay + relaxed-natural-flat-lay + gentle-overhead while preserving user ratio & notes'
  );
  assert(
    isPresetSupportedForGarment(hoodieSetup.clothingPresentation!, 'hoodie'),
    'Hoodie smart setup must pick a hoodie-supported clothing presentation preset'
  );

  const mugSetup = applySmartSetupToSettings(
    {
      productType: 'mug',
      customProductType: '',
      detectedLabel: 'Ceramic Mug',
      surfaceFormFactor: 'vessel',
      confidence: 'high',
      briefNotes: 'Wrap graphic on white ceramic mug',
    },
    baseSettings
  );
  assert(
    mugSetup.productType === 'mug' &&
      mugSetup.orientation === 'upright' &&
      mugSetup.cameraAngle === 'three-quarter' &&
      mugSetup.clothingPresentation === undefined,
    'Mug smart setup must configure upright + three-quarter camera'
  );

  const posterSetup = applySmartSetupToSettings(
    {
      productType: 'poster',
      customProductType: '',
      detectedLabel: 'Scientific Star Chart Poster',
      surfaceFormFactor: 'wall-art-print',
      confidence: 'high',
      briefNotes: 'Framed vertical print',
    },
    baseSettings
  );
  assert(
    posterSetup.productType === 'poster' &&
      posterSetup.orientation === 'upright' &&
      posterSetup.cameraAngle === 'straight-on',
    'Poster smart setup must configure upright + straight-on front-facing camera'
  );

  const deskMatSetup = applySmartSetupToSettings(
    {
      productType: 'other',
      customProductType: 'Desk Mat',
      detectedLabel: 'Illustrated Desk Mat',
      surfaceFormFactor: 'flat-accessory',
      confidence: 'high',
      briefNotes: 'Rectangular stitched desk mat',
    },
    baseSettings
  );
  assert(
    deskMatSetup.productType === 'other' &&
      deskMatSetup.customProductType === 'Desk Mat' &&
      deskMatSetup.orientation === 'flat-lay' &&
      deskMatSetup.cameraAngle === 'gentle-overhead',
    'Other flat accessory (Desk Mat) must populate customProductType and configure flat-lay + gentle-overhead'
  );
  console.log('Test 20 Passed: Smart setup defaults verified for hoodie, mug, poster, and flat accessories.');

  // Test 21: Next Look preserves product identity, orientation, ratio, and notes while updating ChatGPT prompt
  const firstLookResult = getNextStudioLook(hoodieSetup, []);
  assert(
    firstLookResult.nextSettings.productType === 'hoodie' &&
      firstLookResult.nextSettings.orientation === 'flat-lay' &&
      firstLookResult.nextSettings.clothingPresentation === 'relaxed-natural-flat-lay' &&
      firstLookResult.nextSettings.cameraAngle === 'gentle-overhead' &&
      firstLookResult.nextSettings.aspectRatio === '3:4' &&
      firstLookResult.nextSettings.additionalInstructions === 'Keep gold foil crisp and legible.' &&
      firstLookResult.nextSettings.websiteCropSafe === true,
    'Next Look must preserve hoodie identity, flat-lay orientation, presentation, overhead camera, ratio, and notes'
  );
  assert(
    firstLookResult.nextSettings.background !== hoodieSetup.background ||
      firstLookResult.nextSettings.surface !== hoodieSetup.surface,
    'Next Look must update the environment background/surface'
  );

  const hoodiePrompt1 = buildChatGPTPhotoPrompt({ ...hoodieSetup, hasReferenceImage: true });
  const hoodiePrompt2 = buildChatGPTPhotoPrompt({ ...firstLookResult.nextSettings, hasReferenceImage: true });
  assert(
    hoodiePrompt1 !== hoodiePrompt2 &&
      hoodiePrompt2.includes('Apparel / Hoodie') &&
      hoodiePrompt2.includes('Relaxed Natural Flat-Lay Presentation'),
    'Next Look must immediately produce a revised ChatGPT prompt while retaining garment fidelity'
  );
  console.log('Test 21 Passed: Next Look preserves product constraints while changing environment & ChatGPT prompt.');

  // Test 22: Next Look cycles through all curated looks without repeats until exhausted
  // 22a: Starting from a settings state matching one curated look ('science-gradient-travertine'),
  // the remaining N-1 looks are visited without repeats before wrapping.
  let rollingSettings = deskMatSetup;
  let usedIds: string[] = [];
  let activeLookId: string | null = null;
  const seenInFirstCycle: string[] = ['science-gradient-travertine'];

  for (let i = 0; i < CURATED_STUDIO_LOOKS.length - 1; i++) {
    const step = getNextStudioLook(rollingSettings, usedIds, activeLookId);
    assert(
      step.didResetCycle === false && !seenInFirstCycle.includes(step.look.id),
      `Look ${step.look.id} repeated before exhausting all ${CURATED_STUDIO_LOOKS.length} looks`
    );
    assert(
      step.nextSettings.background !== rollingSettings.background,
      'Consecutive Next Look clicks must produce distinct backgrounds'
    );
    assert(
      step.nextSettings.productType === 'other' &&
        step.nextSettings.customProductType === 'Desk Mat' &&
        step.nextSettings.orientation === 'flat-lay' &&
        step.nextSettings.cameraAngle === 'gentle-overhead',
      'Desk Mat identity and flat-lay overhead setup must remain unchanged across all looks'
    );
    seenInFirstCycle.push(step.look.id);
    rollingSettings = step.nextSettings;
    usedIds = step.nextUsedLookIds;
    activeLookId = step.look.id;
  }

  assert(
    seenInFirstCycle.length === CURATED_STUDIO_LOOKS.length,
    'Initial look + N-1 clicks must cover every curated look exactly once'
  );

  // Trigger one more click after exhaustion: must reset cycle and NOT repeat the immediate previous look
  const wrapStep = getNextStudioLook(rollingSettings, usedIds, activeLookId);
  assert(
    wrapStep.didResetCycle === true && wrapStep.look.id !== activeLookId,
    'After exhausting all looks, Next Look must reset cycle without repeating the immediately preceding look'
  );

  // 22b: Starting from custom settings not matching any curated look visits all N looks before reset
  let customRolling: import('../../../types').GenerationSettings = {
    ...deskMatSetup,
    background: 'alabaster',
    surface: 'travertine',
    colorPalette: 'pale-blue-gray',
  };
  let customUsed: string[] = [];
  let customActive: string | null = null;
  const customSeen: string[] = [];
  for (let i = 0; i < CURATED_STUDIO_LOOKS.length; i++) {
    const step = getNextStudioLook(customRolling, customUsed, customActive);
    assert(
      step.didResetCycle === false && !customSeen.includes(step.look.id),
      `Custom start: look ${step.look.id} repeated before exhausting all ${CURATED_STUDIO_LOOKS.length} looks`
    );
    customSeen.push(step.look.id);
    customRolling = step.nextSettings;
    customUsed = step.nextUsedLookIds;
    customActive = step.look.id;
  }
  console.log('Test 22 Passed: Next Look non-repeating cycle and visual distinctness verified.');

  // Test 23: Next Look respects upright mug & vertical clothing compatibility rules
  const uprightMugLook = getNextStudioLook(mugSetup, []);
  assert(
    uprightMugLook.nextSettings.orientation === 'upright' &&
      (uprightMugLook.nextSettings.cameraAngle === 'three-quarter' ||
        uprightMugLook.nextSettings.cameraAngle === 'slightly-elevated'),
    'Next Look for upright mug must keep upright orientation and compatible three-quarter/elevated camera'
  );

  const hangerHoodie = {
    ...hoodieSetup,
    orientation: 'upright' as const,
    clothingPresentation: 'hanger-presentation' as const,
    cameraAngle: 'straight-on' as const,
  };
  const hangerNextLook = getNextStudioLook(hangerHoodie, []);
  assert(
    hangerNextLook.nextSettings.clothingPresentation === 'hanger-presentation' &&
      hangerNextLook.nextSettings.cameraAngle === 'straight-on',
    'Next Look for hanger-presentation hoodie must preserve hanger presentation and front-facing camera'
  );
  console.log('Test 23 Passed: Next Look clothing and drinkware compatibility rules verified.');

  // ==========================================
  // Design Close-Up, 3:4 Portrait Aspect Ratio, and Repaired 3:4 Crop-Safe Tests
  // ==========================================
  const { STUDIO_ASPECT_RATIOS, normalizeAspectRatio } = await import('../studioOptions');
  const { isLegacyObsoleteCropSafeTemplate, getTemplateSection, isTemplateCustomized } = await import(
    '../../../utils/templateManager'
  );

  // Test 24: 3:4 Portrait Aspect Ratio replacement and safe legacy 4:5 normalization
  assert(
    STUDIO_ASPECT_RATIOS.some((r) => r.id === '3:4') &&
      !STUDIO_ASPECT_RATIOS.some((r) => (r.id as string) === '4:5'),
    'STUDIO_ASPECT_RATIOS must replace 4:5 with 3:4'
  );
  assert(
    normalizeAspectRatio('4:5') === '3:4' && normalizeAspectRatio('3:4') === '3:4',
    'normalizeAspectRatio must map legacy 4:5 to 3:4'
  );

  const legacyRatioPrompt = buildChatGPTPhotoPrompt({
    productType: 'mug',
    orientation: 'upright',
    background: 'science-gradient',
    surface: 'light-stone',
    props: 'none',
    aspectRatio: '4:5' as unknown as import('../../types').AspectRatio,
  });
  assert(
    legacyRatioPrompt.includes('3:4 (Vertical Portrait Format') && !legacyRatioPrompt.includes('4:5'),
    'Legacy 4:5 aspect ratio input must normalize cleanly to 3:4 in generated ChatGPT prompt'
  );

  const legacySmartSetup = applySmartSetupToSettings(
    {
      productType: 'tshirt',
      customProductType: '',
      detectedLabel: 'Printed T-shirt',
      surfaceFormFactor: 'garment',
      confidence: 'high',
      briefNotes: '',
    },
    {
      ...baseSettings,
      aspectRatio: '4:5' as unknown as import('../../types').AspectRatio,
    }
  );
  assert(
    legacySmartSetup.aspectRatio === '3:4',
    'Smart setup must normalize any saved legacy 4:5 ratio to 3:4'
  );
  console.log('Test 24 Passed: 3:4 aspect ratio standard and legacy 4:5 normalization verified.');

  // Test 25: Design Close-Up framing across product categories without hero contradictions
  const tshirtCloseUpPrompt = buildChatGPTPhotoPrompt({
    productType: 'tshirt',
    orientation: 'flat-lay',
    clothingPresentation: 'classic-symmetrical-flat-lay',
    shotType: 'design-close-up',
    background: 'neutral-editorial',
    surface: 'light-wood',
    props: 'none',
    aspectRatio: '3:4',
    websiteCropSafe: false,
  });
  assert(
    tshirtCloseUpPrompt.includes('70–85% artwork coverage') &&
      tshirtCloseUpPrompt.includes('NOT a bare collar/stitching detail shot') &&
      !tshirtCloseUpPrompt.includes('Classic Symmetrical Flat-Lay Presentation: The T-shirt lies completely flat and centered on the surface, with both sleeves arranged evenly') &&
      !tshirtCloseUpPrompt.includes('Centered hero composition with calm, balanced framing and generous negative space'),
    'T-shirt Design Close-Up must prioritize 70-85% artwork + surrounding fabric without conflicting full-garment hero instructions'
  );

  const detailOrientedPrompt = buildChatGPTPhotoPrompt({
    productType: 'tshirt',
    orientation: 'flat-lay',
    clothingPresentation: 'classic-symmetrical-flat-lay',
    shotType: 'detail-oriented',
    background: 'neutral-editorial',
    surface: 'light-wood',
    props: 'none',
    aspectRatio: '3:4',
    websiteCropSafe: false,
  });
  assert(
    detailOrientedPrompt.includes('tactile cotton/fleece weave') &&
      !detailOrientedPrompt.includes('70–85% artwork coverage'),
    'Detail & Texture Focus must remain distinct from Design Close-Up'
  );

  const mugCloseUpPrompt = buildChatGPTPhotoPrompt({
    productType: 'mug',
    orientation: 'upright',
    shotType: 'design-close-up',
    background: 'blue-wall-neutral-surface',
    surface: 'light-stone',
    props: 'none',
    aspectRatio: '3:4',
  });
  assert(
    mugCloseUpPrompt.includes('70–85% artwork coverage') &&
      mugCloseUpPrompt.includes('authentic ceramic curvature'),
    'Mug Design Close-Up must prominently frame printed wrap artwork on curved ceramic'
  );

  const notebookCloseUpPrompt = buildChatGPTPhotoPrompt({
    productType: 'notebook',
    orientation: 'flat-lay',
    shotType: 'design-close-up',
    background: 'warm-ivory',
    surface: 'light-wood',
    props: 'none',
    aspectRatio: '3:4',
  });
  assert(
    notebookCloseUpPrompt.includes('70–85% artwork coverage') &&
      notebookCloseUpPrompt.includes('without inventing any spine fold') &&
      !notebookCloseUpPrompt.includes('highlighting the full planar geometry'),
    'Notebook Design Close-Up must focus closely on cover artwork & edge texture without spine fold or wide planar hero wording'
  );

  const posterCloseUpPrompt = buildChatGPTPhotoPrompt({
    productType: 'poster',
    orientation: 'upright',
    shotType: 'design-close-up',
    background: 'neutral-editorial',
    surface: 'paper-archival',
    props: 'none',
    aspectRatio: '3:4',
  });
  assert(
    posterCloseUpPrompt.includes('70–85% artwork coverage') &&
      !posterCloseUpPrompt.includes('Do not crop out edges') &&
      posterCloseUpPrompt.includes('archival paper'),
    'Poster Design Close-Up must preserve tight physical print accuracy without contradicting outer-margin cropping'
  );

  const nextLookDuringCloseUp = getNextStudioLook(
    {
      ...hoodieSetup,
      shotType: 'design-close-up',
      aspectRatio: '3:4',
    },
    []
  );
  assert(
    nextLookDuringCloseUp.nextSettings.shotType === 'design-close-up' &&
      nextLookDuringCloseUp.nextSettings.aspectRatio === '3:4',
    'Next Look must preserve Design Close-Up shot mode and 3:4 aspect ratio'
  );
  console.log('Test 25 Passed: Design Close-Up across all categories verified without hero-shot contradictions.');

  // Test 26: Website Crop Safe (3:4 portrait) in Hero and Design Close-Up modes + legacy localStorage cleanup
  const heroCropSafePrompt = buildChatGPTPhotoPrompt({
    productType: 'mug',
    orientation: 'upright',
    shotType: 'hero-product',
    background: 'science-gradient',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '3:4',
    websiteCropSafe: true,
  });
  assert(
    heroCropSafePrompt.includes('3:4 PORTRAIT SAFE ZONE DIRECTIVE') &&
      heroCropSafePrompt.includes('8–12%') &&
      heroCropSafePrompt.includes('mug handles') &&
      !heroCropSafePrompt.includes('4:3') &&
      !heroCropSafePrompt.includes('square (1:1)'),
    'Standard Hero + Website Crop Safe must emit 3:4 portrait safe zone rules with 8-12% clearance, handle allowance, and zero obsolete 4:3/1:1 text'
  );

  const closeUpCropSafePrompt = buildChatGPTPhotoPrompt({
    productType: 'hoodie',
    orientation: 'flat-lay',
    clothingPresentation: 'relaxed-natural-flat-lay',
    shotType: 'design-close-up',
    background: 'warm-ivory',
    surface: 'light-wood',
    props: 'none',
    aspectRatio: '3:4',
    websiteCropSafe: true,
  });
  assert(
    closeUpCropSafePrompt.includes('3:4 PORTRAIT ARTWORK SAFE ZONE — DESIGN CLOSE-UP') &&
      closeUpCropSafePrompt.includes('Outer Product Cropping Allowed') &&
      !closeUpCropSafePrompt.includes('Keep the entire hero product, its primary silhouette') &&
      !closeUpCropSafePrompt.includes('4:3'),
    'Design Close-Up + Website Crop Safe must protect full artwork inside 3:4 safe zone and permit outer product cropping without full-silhouette contradiction'
  );

  // Verify legacy 4:3 crop-safe template detection and non-destructive preservation of custom non-legacy sections
  const legacy43String = `WEBSITE CROP-SAFE COMPOSITION (4:3 SAFE ZONE DIRECTIVE):
• The generated source image is square (1:1), but will subsequently be displayed and cropped by the website container to approximately a 4:3 aspect ratio.`;
  assert(
    isLegacyObsoleteCropSafeTemplate(legacy43String) === true,
    'Must detect legacy obsolete 1:1-to-4:3 websiteCropSafe template'
  );
  assert(
    isLegacyObsoleteCropSafeTemplate('Keep logos comfortably inside the 3:4 portrait center.') === false,
    'Must NOT misclassify genuine custom non-legacy crop-safe instructions as obsolete'
  );

  const store = new Map<string, string>();
  const mockWindow = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    dispatchEvent: () => true,
  };
  const prevWindow = (globalThis as Record<string, unknown>).window;
  (globalThis as Record<string, unknown>).window = mockWindow;
  try {
    store.set('scienceOfGifts_template_photography_websiteCropSafe', legacy43String);
    store.set('scienceOfGifts_template_photography_headerAndRole', 'Custom Studio Header — Science of Gifts');

    assert(
      !getTemplateSection('photography', 'websiteCropSafe').includes('4:3') &&
        getTemplateSection('photography', 'websiteCropSafe').includes('3:4'),
      'Obsolete legacy 4:3 websiteCropSafe in localStorage must upgrade to 3:4 default cleanly'
    );
    assert(
      getTemplateSection('photography', 'headerAndRole') === 'Custom Studio Header — Science of Gifts' &&
        isTemplateCustomized('photography', 'headerAndRole') === true,
      'Genuine user-customized template sections must remain completely intact'
    );
    const activePromptWithMigratedStorage = buildChatGPTPhotoPrompt({
      productType: 'notebook',
      orientation: 'flat-lay',
      background: 'neutral-editorial',
      surface: 'editorial-tabletop',
      props: 'none',
      aspectRatio: '3:4',
      websiteCropSafe: true,
    });
    assert(
      activePromptWithMigratedStorage.includes('Custom Studio Header — Science of Gifts') &&
        !activePromptWithMigratedStorage.includes('4:3') &&
        activePromptWithMigratedStorage.includes('3:4'),
      'Active prompt must preserve custom non-legacy sections while containing zero obsolete 4:3 instructions'
    );
  } finally {
    if (prevWindow === undefined) {
      delete (globalThis as Record<string, unknown>).window;
    } else {
      (globalThis as Record<string, unknown>).window = prevWindow;
    }
  }
  console.log('Test 26 Passed: Website Crop Safe (3:4 portrait, mode-aware, legacy safe) verified.');

  // ==========================================
  // AI Model Priority Manager, Gemini Fallback, Recognition Cache & Edit Guard Tests
  // ==========================================
  const {
    DEFAULT_AI_MODEL_IDS,
    getAiModels,
    getEnabledModelIds,
    moveAiModel,
    toggleAiModel,
    addAiModel,
    updateAiModel,
    removeAiModel,
    restoreDefaultAiModels,
    getLastRecognitionModel,
    setLastRecognitionModel,
    resetAiModelManagerForTests,
  } = await import('../../../utils/aiModelManager');

  // Test 27: AI Model priority list, CRUD operations, and persistence
  resetAiModelManagerForTests();
  const defaultIds = getAiModels().map((m) => m.id);
  assert(
    JSON.stringify(defaultIds) ===
      JSON.stringify([
        'gemini-4-hydrogen',
        'gemini-3.8-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ]),
    'Default AI model priority list must match the 5 specified Gemini models in exact order'
  );

  moveAiModel(1, 'up'); // Move gemini-3.8-flash to #1
  assert(
    getEnabledModelIds()[0] === 'gemini-3.8-flash' &&
      getEnabledModelIds()[1] === 'gemini-4-hydrogen',
    'Moving model up must update enabled priority order immediately'
  );

  toggleAiModel(0); // Disable gemini-3.8-flash
  assert(
    !getEnabledModelIds().includes('gemini-3.8-flash') &&
      getEnabledModelIds()[0] === 'gemini-4-hydrogen',
    'Disabled models must be excluded from active fallback list'
  );

  const dupModelRes = addAiModel('gemini-4-hydrogen', 'Duplicate');
  assert(dupModelRes.success === false, 'Adding duplicate model ID must be rejected');

  const addCustomRes = addAiModel('gemini-4-argon', 'Gemini 4 Argon');
  assert(
    addCustomRes.success === true &&
      addCustomRes.models.some((m) => m.id === 'gemini-4-argon'),
    'Adding a new valid model ID must append it to configured models'
  );

  const editCustomRes = updateAiModel(addCustomRes.models.length - 1, {
    id: 'gemini-4-argon-custom',
    label: 'Custom Argon',
  });
  assert(
    editCustomRes.success === true &&
      editCustomRes.models.some((m) => m.id === 'gemini-4-argon-custom' && m.label === 'Custom Argon'),
    'Editing a configured model ID and label must succeed'
  );

  const removeCustomRes = removeAiModel(editCustomRes.models.length - 1);
  assert(
    removeCustomRes.success === true &&
      !removeCustomRes.models.some((m) => m.id === 'gemini-4-argon-custom'),
    'Removing an obsolete model must delete it cleanly'
  );

  restoreDefaultAiModels();
  assert(
    JSON.stringify(getEnabledModelIds()) === JSON.stringify(DEFAULT_AI_MODEL_IDS),
    'Restoring defaults must reset order and enablement to the 5 default models'
  );

  setLastRecognitionModel({ modelId: 'gemini-3.8-flash', timestamp: 1700000000000 });
  assert(
    getLastRecognitionModel()?.modelId === 'gemini-3.8-flash',
    'Last successful recognition model must persist cleanly'
  );
  resetAiModelManagerForTests();
  console.log('Test 27 Passed: AI Model priority list, reordering, CRUD, and defaults verified.');

  // Test 28: Server-side Gemini Fallback, Error Classification & Cooldowns
  const {
    classifyGeminiError,
    executeWithModelFallback,
    ModelCooldownRegistry,
  } = await import('../../../server/geminiFallback');

  // 28a: Error classification distinguishes auth/billing, daily quota, rate limit, parameter error, and 404 retirement
  assert(
    classifyGeminiError({ status: 403, message: 'PERMISSION_DENIED: API_KEY_INVALID' }).category ===
      'auth-error',
    '403 / API_KEY_INVALID must classify as auth-error'
  );
  assert(
    classifyGeminiError({
      status: 429,
      message: 'RESOURCE_EXHAUSTED: Quota exceeded for GenerateContentRequestsPerDay',
    }).category === 'daily-quota',
    'Daily RPD 429 must classify as daily-quota'
  );
  assert(
    classifyGeminiError({
      status: 429,
      message: 'Too many requests, retry in 1.2s',
    }).category === 'rate-limit',
    'Short-term 429 without daily indicator must classify as rate-limit'
  );
  assert(
    classifyGeminiError({
      status: 400,
      message: 'INVALID_ARGUMENT: thinking_level MINIMAL is not supported for this model',
    }).retrySameModelWithoutThinking === true,
    '400 thinking_level error must request parameter-strip retry on same model'
  );
  assert(
    classifyGeminiError({
      status: 404,
      message: 'models/gemini-3.6-flash is not found for API version v1beta',
    }).category === 'model-unavailable',
    '404 model missing must classify as model-unavailable'
  );

  // 28b: Daily quota triggers fallback + cooldown skip on subsequent request
  const cooldowns = new ModelCooldownRegistry();
  const callCounts = new Map<string, number>();
  const fallbackRun1 = await executeWithModelFallback({
    candidateModels: ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.6-flash'],
    cooldowns,
    now: () => 1000,
    sleep: async () => {},
    invokeModel: async (modelId) => {
      callCounts.set(modelId, (callCounts.get(modelId) || 0) + 1);
      if (modelId === 'gemini-4-hydrogen') {
        throw { status: 429, message: 'RESOURCE_EXHAUSTED: RequestsPerDay quota exceeded' };
      }
      if (modelId === 'gemini-3.8-flash') {
        throw { status: 404, message: 'NOT_FOUND: model retired' };
      }
      return { ok: true, id: modelId };
    },
  });
  assert(
    fallbackRun1.ok === true &&
      fallbackRun1.modelUsed === 'gemini-3.6-flash' &&
      fallbackRun1.attemptedModels.length === 3,
    'Fallback must skip daily-quota and 404 models and succeed on gemini-3.6-flash'
  );

  // Second request immediately skips cooled-down models without hitting them again
  const fallbackRun2 = await executeWithModelFallback({
    candidateModels: ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.6-flash'],
    cooldowns,
    now: () => 2000,
    sleep: async () => {},
    invokeModel: async (modelId) => {
      callCounts.set(modelId, (callCounts.get(modelId) || 0) + 1);
      return { ok: true, id: modelId };
    },
  });
  assert(
    fallbackRun2.ok === true &&
      fallbackRun2.modelUsed === 'gemini-3.6-flash' &&
      callCounts.get('gemini-4-hydrogen') === 1 &&
      callCounts.get('gemini-3.8-flash') === 1 &&
      callCounts.get('gemini-3.6-flash') === 2,
    'Second request must jump directly to active fallback without retrying cooled-down models'
  );

  // 28c: Thinking parameter mismatch retries SAME model once without thinkingConfig
  const observedParamRetry = { sawOmitThinking: false };
  const paramRetryRun = await executeWithModelFallback({
    candidateModels: ['gemini-4-hydrogen', 'gemini-3.8-flash'],
    cooldowns: new ModelCooldownRegistry(),
    sleep: async () => {},
    invokeModel: async (modelId, capability) => {
      if (modelId === 'gemini-4-hydrogen' && !capability.omitThinkingConfig) {
        throw { status: 400, message: 'INVALID_ARGUMENT: thinkingConfig is not supported' };
      }
      observedParamRetry.sawOmitThinking = Boolean(capability.omitThinkingConfig);
      return { recovered: modelId };
    },
  });
  assert(
    paramRetryRun.ok === true &&
      paramRetryRun.modelUsed === 'gemini-4-hydrogen' &&
      observedParamRetry.sawOmitThinking === true,
    '400 thinkingConfig mismatch must retry same model without thinkingConfig and succeed'
  );

  // 28d: Auth/billing error halts fallback immediately without burning remaining models
  const authAttempts: string[] = [];
  const authFailRun = await executeWithModelFallback({
    candidateModels: ['gemini-4-hydrogen', 'gemini-3.8-flash', 'gemini-3.6-flash'],
    cooldowns: new ModelCooldownRegistry(),
    sleep: async () => {},
    invokeModel: async (modelId) => {
      authAttempts.push(modelId);
      throw { status: 403, message: 'PERMISSION_DENIED: API key not valid' };
    },
  });
  assert(
    authFailRun.ok === false &&
      authFailRun.errorCode === 'AUTH_OR_BILLING_ERROR' &&
      authAttempts.length === 1,
    'Auth/billing error must abort fallback immediately on first attempt and NOT blame quota'
  );
  console.log('Test 28 Passed: Gemini error classification, cooldowns, parameter retry, and auth halt verified.');

  // Test 29: Recognition Runner Caching & Concurrent Deduplication
  const { createRecognitionRunner } = await import('../../../utils/imageAnalyzer');
  let networkCallCount = 0;
  const runner = createRecognitionRunner({
    prepareImage: async (dataUrl) => ({
      base64: `norm:${dataUrl}`,
      mimeType: 'image/jpeg',
      fingerprint: `fp:${dataUrl}`,
    }),
    sendRequest: async (payload) => {
      networkCallCount += 1;
      await new Promise((r) => setTimeout(r, 15));
      return {
        status: 200,
        data: {
          available: true,
          modelUsed: payload.preferredModels[0],
          attemptedModels: [payload.preferredModels[0]],
          recognition: {
            productType: 'mug',
            customProductType: '',
            detectedLabel: 'Ceramic Mug',
            surfaceFormFactor: 'vessel',
            confidence: 'high',
            briefNotes: 'White ceramic mug with graphic',
          },
        },
      };
    },
    getModels: () => ['gemini-4-hydrogen', 'gemini-3.8-flash'],
  });

  // Launch two concurrent calls for the same image
  const [resA, resB] = await Promise.all([
    runner.run('data:image/png;base64,AAA', 'mug-a.png'),
    runner.run('data:image/png;base64,AAA', 'mug-b.png'),
  ]);
  assert(
    resA.ok && resB.ok && networkCallCount === 1,
    'Concurrent duplicate requests for same image must deduplicate to a single network call'
  );

  // Subsequent call for identical image hits cache with 0 additional network calls
  const resCached = await runner.run('data:image/png;base64,AAA', 'mug-c.png');
  assert(
    resCached.ok && resCached.fromCache === true && networkCallCount === 1,
    'Repeated analysis of identical image must return cached result without extra network request'
  );

  // Different image makes fresh request
  const resDifferent = await runner.run('data:image/png;base64,BBB', 'hoodie.png');
  assert(
    resDifferent.ok && resDifferent.fromCache === false && networkCallCount === 2,
    'Genuinely different image must trigger fresh recognition'
  );
  console.log('Test 29 Passed: Recognition caching and concurrent deduplication verified.');

  // Test 30: Manual Prompt Edit Safeguard
  const { resolveAutoPromptUpdate } = await import('../../../utils/promptEditGuard');
  const protectedResult = resolveAutoPromptUpdate(
    {
      chatgptPrompt: 'User hand-edited ChatGPT prompt',
      geminiPrompt: 'Auto Gemini v1',
      manualEdits: { chatgpt: true, gemini: false },
      pendingAutoPrompts: { chatgpt: null, gemini: null },
    },
    {
      chatgpt: 'Auto ChatGPT v2',
      gemini: 'Auto Gemini v2',
    }
  );
  assert(
    protectedResult.chatgptPrompt === 'User hand-edited ChatGPT prompt' &&
      protectedResult.pendingAutoPrompts.chatgpt === 'Auto ChatGPT v2' &&
      protectedResult.geminiPrompt === 'Auto Gemini v2' &&
      protectedResult.pendingAutoPrompts.gemini === null,
    'Manual edit safeguard must preserve manually edited ChatGPT prompt in pendingAutoPrompts while updating untouched Gemini prompt'
  );
  console.log('Test 30 Passed: Manual prompt edit safeguard verified.');

  // Test 31: Cloudflare Worker (worker.ts) routing, /api/recognize-product validation & SPA isolation
  const workerMod = await import('../../../../worker');
  const workerHandler = workerMod.default;
  const assetCalls: string[] = [];
  const mockAssets = {
    fetch: async (req: Request | string) => {
      const targetUrl = typeof req === 'string' ? req : req.url;
      assetCalls.push(targetUrl);
      return new Response('<!doctype html><html><body>SPA</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    },
  };

  // 31a: /api/health checks env.GEMINI_API_KEY without calling ASSETS
  const healthNoKeyRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/health'),
    { ASSETS: mockAssets }
  );
  const healthNoKeyJson = await healthNoKeyRes.json();
  assert(
    healthNoKeyRes.status === 200 &&
      healthNoKeyJson.ok === true &&
      healthNoKeyJson.recognitionAvailable === false &&
      assetCalls.length === 0,
    'GET /api/health without key must return JSON with recognitionAvailable=false and never touch ASSETS'
  );

  // 31b: POST /api/recognize-product with missing GEMINI_API_KEY returns clean 503 JSON
  const missingKeyRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/recognize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: 'AAAA', mimeType: 'image/jpeg' }),
    }),
    { ASSETS: mockAssets }
  );
  const missingKeyJson = await missingKeyRes.json();
  assert(
    missingKeyRes.status === 503 &&
      missingKeyJson.available === false &&
      missingKeyJson.errorCode === 'API_KEY_MISSING' &&
      assetCalls.length === 0,
    'POST /api/recognize-product missing GEMINI_API_KEY must return 503 JSON'
  );

  // 31c: POST /api/recognize-product rejects unsupported MIME types and malformed base64
  const badMimeRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/recognize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: 'AAAA', mimeType: 'image/svg+xml' }),
    }),
    { ASSETS: mockAssets, GEMINI_API_KEY: 'test-key-placeholder' }
  );
  assert(
    badMimeRes.status === 400 && (await badMimeRes.json()).errorCode === 'UNSUPPORTED_IMAGE_FORMAT',
    'Unsupported image mime type must return 400 UNSUPPORTED_IMAGE_FORMAT'
  );

  const badBase64Res = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/recognize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: 'not!valid!base64', mimeType: 'image/jpeg' }),
    }),
    { ASSETS: mockAssets, GEMINI_API_KEY: 'test-key-placeholder' }
  );
  assert(
    badBase64Res.status === 400 && (await badBase64Res.json()).errorCode === 'MALFORMED_IMAGE_BASE64',
    'Malformed base64 image must return 400 MALFORMED_IMAGE_BASE64'
  );

  // 31d: Unmatched /api/* route returns 404 JSON instead of SPA index.html
  const unknownApiRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/does-not-exist'),
    { ASSETS: mockAssets, GEMINI_API_KEY: 'test-key-placeholder' }
  );
  assert(
    unknownApiRes.status === 404 &&
      Boolean(unknownApiRes.headers.get('Content-Type')?.includes('application/json')) &&
      assetCalls.length === 0,
    'Unknown /api/* route must return 404 JSON and never fall through to ASSETS index.html'
  );

  // 31e: Frontend / SPA navigation routes delegate cleanly to env.ASSETS.fetch
  const spaRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/settings'),
    { ASSETS: mockAssets }
  );
  assert(
    spaRes.status === 200 &&
      assetCalls.length === 1 &&
      assetCalls[0] === 'https://prompt-studio.workers.dev/settings',
    'Frontend SPA routes must delegate to env.ASSETS.fetch'
  );
  console.log('Test 31 Passed: Cloudflare Worker (worker.ts) routing, payload validation, and SPA asset delegation verified.');

  // ==========================================
  // Design to Product Tests (Tests 32–36)
  // ==========================================
  const { DEFAULT_MERCHANDISE_PROFILES } = await import('../../../designToProduct/productCatalog');
  const {
    getMerchandiseProfiles,
    saveMerchandiseProfile,
    addCustomMerchandiseProfile,
    resetBuiltInProfileOverride,
    deleteCustomMerchandiseProfile,
    resetD2PProfileManagerForTests,
  } = await import('../../../designToProduct/profileManager');
  const { recommendProductsForDesign, selectBatchRecommendedProductId } = await import(
    '../../../designToProduct/recommendationEngine'
  );
  const { resolveBackgroundTreatment, resolveColorTreatment } = await import(
    '../../../designToProduct/adaptationRules'
  );
  const { buildDesignAdaptationPrompt } = await import('../../../designToProduct/promptBuilder');
  const { createDesignAnalysisRunner, runWithConcurrency } = await import(
    '../../../designToProduct/designAnalyzer'
  );
  const { normalizeDesignAnalysisResult } = await import('../../../server/designAnalysis');

  // Test 32: All 20 default products & non-destructive customization
  resetD2PProfileManagerForTests();
  const initialProfiles = getMerchandiseProfiles();
  assert(
    DEFAULT_MERCHANDISE_PROFILES.length === 20 && initialProfiles.length === 20,
    `Expected 20 built-in merchandise profiles, got ${initialProfiles.length}`
  );
  const requiredProductIds = [
    'tshirt',
    'hoodie',
    'sweatshirt',
    'sweater',
    'tank-top',
    'ceramic-mug',
    'beer-glass',
    'whiskey-glass',
    'cocktail-glass',
    'wine-tumbler',
    'water-bottle',
    'insulated-tumbler',
    'notebook',
    'journal',
    'poster',
    'art-print',
    'desk-mat',
    'mousepad',
    'laptop-sleeve',
    'tote-bag',
  ];
  for (const reqId of requiredProductIds) {
    assert(
      initialProfiles.some((p) => p.id === reqId),
      `Missing required initial product profile: ${reqId}`
    );
  }

  saveMerchandiseProfile('tshirt', {
    exactPrintSpecifications: '4500 x 5400 px transparent PNG @ 300 DPI',
    additionalInstructions: 'Keep chest art 3 inches below collar.',
  });
  const d2pAddCustomRes = addCustomMerchandiseProfile({
    name: 'Enamel Camp Mug',
    category: 'drinkware',
    typicalOrientation: 'square',
    preferredComposition: 'Centered rustic outdoors emblem',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics: 'White speckled enamel mug body',
    supportedProductColors: ['White Enamel'],
    printingMethod: 'Sublimation wrap',
    colorAndContrastConsiderations: 'High dark ink contrast on white enamel.',
    recommendedDesignAdjustments: 'Keep edges bold.',
  });
  assert(d2pAddCustomRes.success && Boolean(d2pAddCustomRes.profile), 'Custom profile creation must succeed');
  const modifiedProfiles = getMerchandiseProfiles();
  const editedTshirt = modifiedProfiles.find((p) => p.id === 'tshirt')!;
  assert(
    modifiedProfiles.length === 21 &&
      editedTshirt.exactPrintSpecifications === '4500 x 5400 px transparent PNG @ 300 DPI' &&
      editedTshirt.additionalInstructions === 'Keep chest art 3 inches below collar.',
    'Edited built-in profile must preserve overrides alongside custom added products'
  );
  resetBuiltInProfileOverride('tshirt');
  deleteCustomMerchandiseProfile(d2pAddCustomRes.profile!.id);
  resetD2PProfileManagerForTests();
  console.log('Test 32 Passed: 20 default merchandise profiles and non-destructive profile customization verified.');

  // Test 33: Recommendation Engine Scenarios (Concept/Printability over blind aspect ratio)
  const catalog20 = getMerchandiseProfiles();

  const coffeeBadgeAnalysis: import('../../../designToProduct/types').DesignAnalysisResult = {
    conceptSummary: 'Vintage botanical coffeehouse emblem',
    themeOrTopic: 'Specialty espresso & coffee roastery humor',
    intendedAudience: 'Coffee lovers & baristas',
    visualIdentity: 'Warm botanical crest ink drawing',
    compositionType: 'badge',
    aspectProfile: 'square',
    elementDistribution: 'Centered circular crest',
    typographyStyle: 'Classic serif display',
    textDensity: 'low',
    exactVisibleText: 'FIRST COFFEE THEN DISCOVERY',
    importantElements: ['Espresso portafilter crest', 'Coffee blossoms'],
    dominantColors: ['Espresso brown', 'Cream'],
    supportingColors: ['Warm sage'],
    currentBackground: 'solid-light',
    detailLevel: 'moderate',
    suitableForSmallPrint: true,
    expandableToWideOrFullBleed: false,
    readabilityNotes: 'Bold crest reads well at mug and chest scale.',
    worksWithoutModification: true,
    prefersTransparentBackground: true,
    contrastRiskNotes: 'Lighten dark espresso text if printed on dark charcoal apparel.',
    recommendedDefaultProductColor: 'White / Cream',
    elementsToPreserve: ['Espresso crest', 'Coffee blossoms'],
    suggestedProductFits: [
      { productId: 'ceramic-mug', reason: 'Coffee badge fits morning mugs naturally.', conceptFitScore: 92, visualFitScore: 90 },
      { productId: 'tshirt', reason: 'Strong chest crest appeal.', conceptFitScore: 84, visualFitScore: 86 },
      { productId: 'tote-bag', reason: 'Great everyday cafe tote emblem.', conceptFitScore: 78, visualFitScore: 80 },
    ],
  };

  const coffeeRecs = recommendProductsForDesign(coffeeBadgeAnalysis, catalog20);
  assert(
    coffeeRecs.primary.productId === 'ceramic-mug' && coffeeRecs.alternatives.length === 2,
    `Coffee badge expected primary ceramic-mug, got ${coffeeRecs.primary.productId}`
  );

  const intricateMapAnalysis: import('../../../designToProduct/types').DesignAnalysisResult = {
    conceptSummary: 'Intricate 19th-century historical observatory star map with tiny Latin labels',
    themeOrTopic: 'Astronomy, celestial cartography, constellation taxonomy chart',
    intendedAudience: 'Astronomers, history fans, map collectors',
    visualIdentity: 'Finely engraved antique cartography plate',
    compositionType: 'infographic',
    aspectProfile: 'landscape',
    elementDistribution: 'Dense edge-to-edge celestial diagram and hairline border',
    typographyStyle: 'Small serif labels throughout',
    textDensity: 'high',
    exactVisibleText: 'MAPPA COELESTIS OBSERVATORII',
    importantElements: ['Southern & northern hemispheres', 'Fine orbital hairlines', 'Border compass'],
    dominantColors: ['Midnight navy', 'Antique parchment cream', 'Gold ochre'],
    supportingColors: [],
    currentBackground: 'full-scene-illustration',
    detailLevel: 'intricate',
    suitableForSmallPrint: false,
    expandableToWideOrFullBleed: true,
    readabilityNotes: 'Dense labels require generous print scale.',
    worksWithoutModification: true,
    prefersTransparentBackground: false,
    contrastRiskNotes: 'Preserve rich midnight sky background.',
    recommendedDefaultProductColor: 'Full-Bleed Paper / Dark Canvas',
    elementsToPreserve: ['Dual celestial hemispheres', 'Exact map title'],
    suggestedProductFits: [
      { productId: 'poster', reason: 'Preserves intricate map details at full wall scale.', conceptFitScore: 90, visualFitScore: 94 },
      { productId: 'desk-mat', reason: 'Landscape map shines across wide desk surfaces.', conceptFitScore: 88, visualFitScore: 90 },
      { productId: 'art-print', reason: 'Archival framing suits fine cartography.', conceptFitScore: 85, visualFitScore: 88 },
    ],
  };

  const mapRecs = recommendProductsForDesign(intricateMapAnalysis, catalog20);
  assert(
    ['poster', 'desk-mat', 'art-print'].includes(mapRecs.primary.productId) &&
      !['whiskey-glass', 'cocktail-glass', 'beer-glass'].includes(mapRecs.primary.productId),
    `Intricate map must recommend large print surface (poster/desk-mat/art-print), not small glassware; got ${mapRecs.primary.productId}`
  );
  const whiskeyRank = mapRecs.allRanked.findIndex((r) => r.productId === 'whiskey-glass');
  assert(
    whiskeyRank > 8,
    `Intricate map must rank small curved whiskey glass low (rank=${whiskeyRank})`
  );

  // Even a SQUARE cocktail recipe should favor cocktail/whiskey glass when clean & thematic!
  const cocktailSquareAnalysis: import('../../../designToProduct/types').DesignAnalysisResult = {
    conceptSummary: 'Clean minimalist Negroni cocktail recipe emblem',
    themeOrTopic: 'Classic Negroni cocktail mixology',
    intendedAudience: 'Home bartenders & spirit enthusiasts',
    visualIdentity: 'Bold geometric mid-century barware icon',
    compositionType: 'badge',
    aspectProfile: 'square',
    elementDistribution: 'Compact centered glass & proportions icon',
    typographyStyle: 'Clean sans-serif',
    textDensity: 'low',
    exactVisibleText: 'NEGRONI 1:1:1',
    importantElements: ['Rocks glass silhouette', 'Orange twist', '1:1:1 ratio'],
    dominantColors: ['Crisp black', 'Burnt orange'],
    supportingColors: [],
    currentBackground: 'transparent-clean',
    detailLevel: 'minimal',
    suitableForSmallPrint: true,
    expandableToWideOrFullBleed: false,
    readabilityNotes: 'Bold minimal lines stay sharp on glassware.',
    worksWithoutModification: true,
    prefersTransparentBackground: true,
    contrastRiskNotes: 'Check ink opacity / etching clarity on clear glass.',
    recommendedDefaultProductColor: 'Clear Glass',
    elementsToPreserve: ['NEGRONI 1:1:1 text', 'Rocks glass icon'],
    suggestedProductFits: [
      { productId: 'cocktail-glass', reason: 'Direct barware gift pairing.', conceptFitScore: 92, visualFitScore: 88 },
      { productId: 'whiskey-glass', reason: 'Compact square proportions fit rocks glass face.', conceptFitScore: 90, visualFitScore: 90 },
      { productId: 'tshirt', reason: 'Wearable cocktail enthusiast chest crest.', conceptFitScore: 70, visualFitScore: 78 },
    ],
  };
  const cocktailRecs = recommendProductsForDesign(cocktailSquareAnalysis, catalog20);
  assert(
    cocktailRecs.primary.productId === 'cocktail-glass' ||
      cocktailRecs.primary.productId === 'whiskey-glass',
    `Cocktail graphic must recommend barware even with square aspect ratio; got ${cocktailRecs.primary.productId}`
  );

  // Merit-first batch tie-breaker never overrides strong suitability lead
  const strongPrimaryPick = selectBatchRecommendedProductId(coffeeRecs, {
    drinkware: 8,
    apparel: 0,
  });
  assert(
    coffeeRecs.primary.score - coffeeRecs.alternatives[0].score > 3
      ? strongPrimaryPick === coffeeRecs.primary.productId
      : true,
    'Batch tie-breaker must never override a genuinely stronger primary fit'
  );
  console.log('Test 33 Passed: Recommendation engine domain fit, printability penalties, and merit-first batch balancing verified.');

  // Test 34 & 35: Prompt generation, product-specific layout rules, transparency & color adaptation
  const tshirtProfile = catalog20.find((p) => p.id === 'tshirt')!;
  const mugProfile = catalog20.find((p) => p.id === 'ceramic-mug')!;
  const deskMatProfile = catalog20.find((p) => p.id === 'desk-mat')!;
  const posterProfile = catalog20.find((p) => p.id === 'poster')!;
  const whiskeyProfile = catalog20.find((p) => p.id === 'whiskey-glass')!;

  // Square badge on T-shirt -> STILL transparent PNG (NOT forced opaque by square shape)
  const tshirtSquareBg = resolveBackgroundTreatment(
    coffeeBadgeAnalysis,
    tshirtProfile,
    'ai-decides'
  );
  assert(
    tshirtSquareBg.mode === 'transparent',
    'Square emblem intended for T-shirt must default to transparent PNG, never opaque due to square shape'
  );

  const d2pTshirtPrompt = buildDesignAdaptationPrompt(coffeeBadgeAnalysis, tshirtProfile, {
    selectedProductId: 'tshirt',
    backgroundTreatment: 'ai-decides',
    colorTreatment: 'ai-decides',
    productColor: 'Black',
  });
  assert(
    d2pTshirtPrompt.includes('GENUINELY TRANSPARENT BACKGROUND') &&
      d2pTshirtPrompt.includes('fake checkerboard grid') &&
      d2pTshirtPrompt.includes('chest') &&
      d2pTshirtPrompt.includes('FIRST COFFEE THEN DISCOVERY') &&
      d2pTshirtPrompt.includes('DO NOT render a physical t-shirt') &&
      d2pTshirtPrompt.includes('Black'),
    'T-shirt adaptation prompt must enforce true alpha PNG, chest-print layout, verbatim text, dark-shirt contrast note, and anti-mockup output'
  );

  // Desk Mat -> Full background & non-stretched wide adaptation
  const deskMatPrompt = buildDesignAdaptationPrompt(intricateMapAnalysis, deskMatProfile, {
    selectedProductId: 'desk-mat',
    backgroundTreatment: 'ai-decides',
    colorTreatment: 'ai-decides',
    productColor: '',
  });
  assert(
    deskMatPrompt.includes('FULL-BACKGROUND') &&
      deskMatPrompt.includes('without stretching or distorting') &&
      deskMatPrompt.includes('MAPPA COELESTIS OBSERVATORII'),
    'Desk mat prompt must keep full background, prohibit stretching, and preserve verbatim text'
  );

  // Poster -> preserves full scene background & rectangular framing
  const posterBg = resolveBackgroundTreatment(intricateMapAnalysis, posterProfile, 'ai-decides');
  assert(
    posterBg.mode === 'full-background',
    'Poster must preserve complete intentional rectangular background'
  );

  // User overrides (force Transparent on Desk Mat, force Full Background on Mug, force Preserve Original Colors on Black T-shirt)
  const userTransparentOverride = resolveBackgroundTreatment(
    intricateMapAnalysis,
    deskMatProfile,
    'transparent'
  );
  const userFullBgOverride = resolveBackgroundTreatment(
    coffeeBadgeAnalysis,
    mugProfile,
    'full-background'
  );
  const userPreserveColor = resolveColorTreatment(
    coffeeBadgeAnalysis,
    tshirtProfile,
    'preserve-original',
    'Black'
  );
  assert(
    userTransparentOverride.mode === 'transparent' &&
      userTransparentOverride.source === 'user-override' &&
      userFullBgOverride.mode === 'full-background' &&
      userFullBgOverride.source === 'user-override' &&
      userPreserveColor.mode === 'preserve-original' &&
      userPreserveColor.source === 'user-override',
    'User explicit overrides for background & color treatment must always take precedence'
  );

  // Clear Glassware -> requiresInkVerification & honest printing/etching verification note (no invented Fourthwall pixel dimensions)
  const glassColorDecision = resolveColorTreatment(
    cocktailSquareAnalysis,
    whiskeyProfile,
    'ai-decides',
    ''
  );
  const glassPrompt = buildDesignAdaptationPrompt(cocktailSquareAnalysis, whiskeyProfile, {
    selectedProductId: 'whiskey-glass',
    backgroundTreatment: 'ai-decides',
    colorTreatment: 'ai-decides',
    productColor: '',
  });
  assert(
    glassColorDecision.requiresInkVerification === true &&
      glassPrompt.includes('Do NOT assume opaque white ink') &&
      glassPrompt.includes('NEGRONI 1:1:1'),
    'Clear glassware must include honest ink/etching verification note without inventing unverified supplier specs'
  );

  // Product switching uses 0 API calls when using cached/runner design analysis
  let designApiCalls = 0;
  const designRunner = createDesignAnalysisRunner({
    prepareImage: async () => ({
      base64: 'AAA',
      mimeType: 'image/png',
      fingerprint: 'fp-coffee-1',
    }),
    sendRequest: async () => {
      designApiCalls += 1;
      return {
        status: 200,
        data: {
          available: true,
          modelUsed: 'gemini-3-flash-preview',
          attemptedModels: ['gemini-3-flash-preview'],
          analysis: coffeeBadgeAnalysis,
        },
      };
    },
    getModels: () => ['gemini-3-flash-preview'],
  });

  const analyzedOnce = await designRunner.run({
    dataUrl: 'data:image/png;base64,AAA',
    fileName: 'coffee.png',
    catalog: catalog20,
  });
  assert(analyzedOnce.ok && designApiCalls === 1, 'Design analysis should execute once on upload');
  if (analyzedOnce.ok) {
    // Switch across T-shirt, Ceramic Mug, and Poster locally -> 0 extra API calls!
    buildDesignAdaptationPrompt(analyzedOnce.analysis, tshirtProfile, {
      selectedProductId: 'tshirt',
      backgroundTreatment: 'ai-decides',
      colorTreatment: 'ai-decides',
      productColor: 'Cream',
    });
    buildDesignAdaptationPrompt(analyzedOnce.analysis, mugProfile, {
      selectedProductId: 'ceramic-mug',
      backgroundTreatment: 'ai-decides',
      colorTreatment: 'ai-decides',
      productColor: 'White',
    });
    buildDesignAdaptationPrompt(analyzedOnce.analysis, posterProfile, {
      selectedProductId: 'poster',
      backgroundTreatment: 'ai-decides',
      colorTreatment: 'ai-decides',
      productColor: 'Matte Paper',
    });
  }
  assert(
    designApiCalls === 1,
    'Switching products and adaptation options must trigger ZERO additional API calls'
  );
  console.log('Test 34 & 35 Passed: Adaptation prompts, transparency/color decisions, glassware caveats, and 0-call local product switching verified.');

  // Test 36: Batch concurrency runner, malformed-field normalizer & Worker /api/analyze-design route
  const normalizedFallback = normalizeDesignAnalysisResult(
    {
      conceptSummary: 'Minimal chemistry joke',
      compositionType: 'nonexistent-type' as unknown as string,
      detailLevel: 'ultra-hd' as unknown as string,
      dominantColors: ['Navy', 123 as unknown as string],
      suggestedProductFits: [
        { productId: 'tshirt', reason: 'Funny slogan', conceptFitScore: 140, visualFitScore: -5 },
        { productId: 'fake-product-id', reason: 'Ignored', conceptFitScore: 99, visualFitScore: 99 },
      ],
    },
    new Set(catalog20.map((p) => p.id))
  );
  assert(
    normalizedFallback.compositionType === 'illustration' &&
      normalizedFallback.detailLevel === 'moderate' &&
      normalizedFallback.dominantColors.length === 1 &&
      normalizedFallback.suggestedProductFits.length === 1 &&
      normalizedFallback.suggestedProductFits[0].conceptFitScore === 100 &&
      normalizedFallback.suggestedProductFits[0].visualFitScore === 0,
    'normalizeDesignAnalysisResult must sanitize unknown enum fields, unknown catalog IDs, and clamp scores cleanly'
  );

  // Batch concurrency test with partial failure isolation
  const batchJobs = [1, 2, 3, 4, 5];
  const completedJobs: number[] = [];
  await runWithConcurrency(batchJobs, 2, async (job) => {
    if (job === 3) {
      // Simulate failed item without throwing unhandled exception so sibling jobs finish
      return;
    }
    completedJobs.push(job);
  });
  assert(
    completedJobs.length === 4 && !completedJobs.includes(3),
    'Batch concurrency runner must isolate failed items and complete all valid jobs'
  );

  // Worker /api/analyze-design missing key -> 503 JSON without touching ASSETS
  const assetCallsBefore = assetCalls.length;
  const d2pMissingKeyRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/analyze-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: 'AAAA', mimeType: 'image/png' }),
    }),
    { ASSETS: mockAssets }
  );
  const d2pMissingKeyJson = await d2pMissingKeyRes.json();
  assert(
    d2pMissingKeyRes.status === 503 &&
      d2pMissingKeyJson.available === false &&
      d2pMissingKeyJson.errorCode === 'API_KEY_MISSING' &&
      assetCalls.length === assetCallsBefore,
    'POST /api/analyze-design without GEMINI_API_KEY must return 503 JSON without touching ASSETS'
  );

  const d2pBadMimeRes = await workerHandler.fetch(
    new Request('https://prompt-studio.workers.dev/api/analyze-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: 'AAAA', mimeType: 'image/svg+xml' }),
    }),
    { ASSETS: mockAssets, GEMINI_API_KEY: 'test-key-placeholder' }
  );
  assert(
    d2pBadMimeRes.status === 400 && (await d2pBadMimeRes.json()).errorCode === 'UNSUPPORTED_IMAGE_FORMAT',
    'POST /api/analyze-design must reject unsupported MIME types with 400'
  );
  console.log('Test 36 Passed: Design analysis normalizer, batch concurrency isolation, and Worker /api/analyze-design route verified.');

  console.log('All Prompt Studio photography, Design to Product, Gift Guide Hero, Smart Setup, Next Look, Design Close-Up, 3:4 Ratio, Crop-Safe, AI Model Fallback, Cache, Edit Safeguard, Worker Routing, and Product Copy tests passed successfully!');
}

runTests();


