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
    aspectRatio: '4:5',
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
      aspectRatio: '4:5',
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
    aspectRatio: '4:5',
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
    aspectRatio: '4:5',
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

  console.log('All Prompt Studio photography, clothing, Gift Guide Hero, and Product Copy / Profile tests passed successfully!');
}

runTests();


