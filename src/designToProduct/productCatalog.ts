import { MerchandiseCategory, MerchandiseProductProfile } from './types';

export const MERCHANDISE_CATEGORY_LABELS: Record<MerchandiseCategory, string> = {
  apparel: 'Apparel',
  drinkware: 'Drinkware',
  'paper-wall-art': 'Paper & Wall Art',
  'desk-accessories': 'Desk & Accessories',
  other: 'Other Merchandise',
};

export const DEFAULT_MERCHANDISE_PROFILES: MerchandiseProductProfile[] = [
  // ========================
  // Apparel (5)
  // ========================
  {
    id: 'tshirt',
    name: 'T-shirt',
    category: 'apparel',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Centered chest print (compact emblem, badge, typography-led lockup, or vertical illustration) with balanced breathing room and organic outer contour.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Flexible knit cotton or cotton-blend garment surface worn over a torso; soft fabric drape rewards clean open edges rather than heavy rectangular boxes.',
    supportedProductColors: ['Black', 'White', 'Off-White / Cream', 'Navy', 'Heather Gray', 'Forest Green'],
    printingMethod: 'Direct-to-garment (DTG) or direct-to-film (DTF) transfer (verify method per blank)',
    colorAndContrastConsiderations:
      'Maintain high foreground-to-fabric contrast. Avoid fine dark ink on dark garments or pale pastel linework on white tees without strong anchor tones.',
    recommendedDesignAdjustments:
      'Remove unnecessary rectangular background canvases so graphics sit directly on the shirt. Tighten excessive margins and preserve crisp typography edges.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'apparel',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Bold chest-print composition positioned comfortably above the kangaroo pocket seam, favoring cohesive emblems, medium-to-bold typography, or layered illustrations.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Heavyweight fleece with slightly lofted texture and front pocket boundary; very thin hairlines or tiny micro-text can soften into fleece fibers.',
    supportedProductColors: ['Black', 'Charcoal', 'Navy', 'Sand / Cream', 'Forest Green', 'Burgundy'],
    printingMethod: 'Direct-to-garment (DTG) or direct-to-film (DTF) transfer (verify method per blank)',
    colorAndContrastConsiderations:
      'Dark fleece demands bright or high-contrast ink separation; light neutral fleece handles deep editorial inks well.',
    recommendedDesignAdjustments:
      'Strengthen thin strokes slightly if needed for fleece texture, avoid low vertical drop that would collide with the pocket, and output with true transparent background.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    category: 'apparel',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Clean crewneck chest composition—collegiate badges, vintage emblems, editorial typography, or centered chest illustration with generous outer garment negative space.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Mid-to-heavyweight brushed or French terry fleece without hood cords; smooth upper chest area suitable for classic graphic emblems.',
    supportedProductColors: ['Black', 'Cream / Sand', 'Heather Gray', 'Navy', 'Olive', 'Maroon'],
    printingMethod: 'Direct-to-garment (DTG) or direct-to-film (DTF) transfer (verify method per blank)',
    colorAndContrastConsiderations:
      'Ensure lettering and borders stand clearly apart from mid-tone heather or dark crewnecks.',
    recommendedDesignAdjustments:
      'Remove solid box backgrounds unless a framed editorial card is explicitly part of the aesthetic; keep spacing clean around the neckline.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'sweater',
    name: 'Sweater',
    category: 'apparel',
    typicalOrientation: 'square',
    preferredComposition:
      'Refined centered chest motif or tasteful typographic emblem with restrained silhouette complexity that complements knit texture.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Textured knitwear or structured pullover surface; intricate micro-details and ultra-fine serifs lose sharpness on textured knits.',
    supportedProductColors: ['Cream', 'Charcoal', 'Navy', 'Forest Green', 'Black'],
    printingMethod: 'Decoration method varies by garment blank (verify DTG, DTF, or embroidery constraints)',
    colorAndContrastConsiderations:
      'Fewer, well-defined high-contrast colors look more intentional on structured sweaters than noisy multi-shade gradients.',
    recommendedDesignAdjustments:
      'Simplify overly noisy background textures, preserve bold legible letterforms, and isolate the graphic on a clean transparent background.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'tank-top',
    name: 'Tank top',
    category: 'apparel',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Compact vertical or centered upper-chest design that avoids sprawling close to wide armholes and low necklines.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Narrower horizontal chest span between arm openings than a sleeved T-shirt; horizontal wide banners must wrap inward cleanly.',
    supportedProductColors: ['Black', 'White', 'Heather Gray', 'Navy', 'Sand'],
    printingMethod: 'Direct-to-garment (DTG) or direct-to-film (DTF) transfer (verify method per blank)',
    colorAndContrastConsiderations:
      'Keep key illustrations and typography crisp against lightweight jersey fabric.',
    recommendedDesignAdjustments:
      'Compact horizontal span into a balanced vertical or badge lockup and remove solid rectangular backdrop fills.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },

  // ========================
  // Drinkware (7)
  // ========================
  {
    id: 'ceramic-mug',
    name: 'Ceramic mug',
    category: 'drinkware',
    typicalOrientation: 'square',
    preferredComposition:
      'Compact, bold single-side graphic or balanced wrap motif with strong focal readability on a curved cylinder.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Glossy or matte glazed curved ceramic cylinder viewed one face at a time; tiny dense text wraps out of sight and blurs at small scale.',
    supportedProductColors: ['White Ceramic', 'Black Ceramic', 'Accent Trim Mug'],
    printingMethod: 'Sublimation or full-color ceramic transfer (verify method per blank)',
    colorAndContrastConsiderations:
      'Vibrant crisp inks excel on white ceramic; black ceramic requires lighter high-contrast artwork and careful opaque color separation.',
    recommendedDesignAdjustments:
      'Eliminate microscopic details, enlarge or tighten key typography so punchlines read clearly at arm’s length, and keep edges transparent.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'beer-glass',
    name: 'Beer glass',
    category: 'drinkware',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Strong badge, crest, pint label, or crisp line-art illustration sized for the flatter mid-section of a tapered glass.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Transparent, curved, slightly tapered glass body; beverage colors (amber, stout, golden lager, foam) sit directly behind the print.',
    supportedProductColors: ['Clear Glass'],
    printingMethod:
      'Glassware decoration method unverified (confirm whether full-color print, white-ink support, single-color ink, or laser etching applies)',
    colorAndContrastConsiderations:
      'High-contrast silhouettes, bold outlines, and strong ink shapes are essential so the mark stays legible against light foam and dark stout alike.',
    recommendedDesignAdjustments:
      'Favor bold shapes and clean transparent background; avoid subtle low-contrast washes or tiny dense paragraphs that vanish against liquid.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'whiskey-glass',
    name: 'Whiskey glass',
    category: 'drinkware',
    typicalOrientation: 'square',
    preferredComposition:
      'Compact emblem, crest, concise wit, or clean geometric/scientific motif centered cleanly on a shorter rocks glass face.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Short curved clear glass tumbler (low vertical height compared to pint glasses or bottles); strictly limited print height and clear-through backdrop.',
    supportedProductColors: ['Clear Glass'],
    printingMethod:
      'Glassware decoration method unverified (confirm laser etching/engraving vs single-color or full-color ink support)',
    colorAndContrastConsiderations:
      'Clear glass with amber spirits or ice cubes lowers subtle contrast fast. Favor strong single- or two-tone clarity unless full-color opacity is verified.',
    recommendedDesignAdjustments:
      'Condense layout to essential badge or crisp lettering, avoid multi-paragraph detail, and prepare clean transparent edges.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'cocktail-glass',
    name: 'Cocktail glass',
    category: 'drinkware',
    typicalOrientation: 'square',
    preferredComposition:
      'Compact signature emblem, drink recipe callout, or clean minimalist line graphic suited to a curved or stemless cocktail vessel.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Transparent glass bowl with compact printable zone and varied colorful liquid backdrops.',
    supportedProductColors: ['Clear Glass'],
    printingMethod:
      'Glassware decoration method unverified (confirm etching/engraving, monochrome ink, or white-backed color transfer)',
    colorAndContrastConsiderations:
      'Ensure main typography and shapes read cleanly over ice and tinted cocktails without muddy mid-tones.',
    recommendedDesignAdjustments:
      'Keep elements tightly grouped, remove opaque boxes, and use clean high-contrast vector-like line weights.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'wine-tumbler',
    name: 'Wine tumbler',
    category: 'drinkware',
    typicalOrientation: 'square',
    preferredComposition:
      'Compact emblem or vertical-square badge centered on the rounded lower-taper belly of the tumbler.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Powder-coated stainless steel or curved insulated vessel with compact vertical belly height.',
    supportedProductColors: ['White', 'Matte Black', 'Navy', 'Blush', 'Mint'],
    printingMethod:
      'Verify coating & decoration method (UV/DTF full-color transfer vs laser engraving through powder coat)',
    colorAndContrastConsiderations:
      'If printed in ink, contrast strongly against powder-coat color; if laser engraved, mark appearance is determined by underlying stainless steel rather than artwork color.',
    recommendedDesignAdjustments:
      'Compact vertical span to prevent distortion around the tapered base and isolate with clean transparent background.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'water-bottle',
    name: 'Water bottle',
    category: 'drinkware',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Vertically stacked badge, tall emblem, or clean front-panel composition that reads without excessive horizontal wrapping.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Narrow-diameter tall cylinder; wide horizontal typography wraps steeply around sides and becomes hard to read in one glance.',
    supportedProductColors: ['White', 'Matte Black', 'Stainless Steel', 'Navy'],
    printingMethod:
      'Verify bottle decoration method (360 UV print, DTF transfer, sublimation, or laser engraving)',
    colorAndContrastConsiderations:
      'Keep key graphics high-contrast against the bottle finish; verify whether white ink or engraving applies before relying on subtle gradients.',
    recommendedDesignAdjustments:
      'Rebalance wide horizontal elements into a taller stacked arrangement so critical text sits on the front-facing cylinder arc.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'insulated-tumbler',
    name: 'Insulated tumbler',
    category: 'drinkware',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Vertically balanced badge or cohesive column layout positioned above lower cup-holder taper.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Tall stainless or powder-coated travel tumbler with tapered lower base and lid/straw clearance at top.',
    supportedProductColors: ['White', 'Black', 'Slate Blue', 'Sage', 'Cream'],
    printingMethod:
      'Verify decoration method (full-color UV/sublimation wrap vs single-tone engraving)',
    colorAndContrastConsiderations:
      'Maintain strong figure-ground contrast on powder-coat finishes and avoid placing fine text near top rim or bottom taper.',
    recommendedDesignAdjustments:
      'Stack wide compositions vertically when needed, keep important typography central, and output transparent edges.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },

  // ========================
  // Paper & Wall Art (4)
  // ========================
  {
    id: 'notebook',
    name: 'Notebook',
    category: 'paper-wall-art',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Intentional book-cover layout—either an illustrated/full-bleed cover composition or a crisp centered title emblem on an understated backdrop.',
    defaultBackgroundTreatment: 'context-dependent',
    printSurfaceCharacteristics:
      'Flat rectangular front cover (typically ~A5/5×7 portrait proportions) with spine/binding margin on left edge and clean trim allowance.',
    supportedProductColors: ['Cream / Ivory', 'Matte Black', 'Slate Blue', 'Custom Full-Cover Print'],
    printingMethod: 'Full-color cover print or foil/spot cover transfer (verify binding & bleed specs)',
    colorAndContrastConsiderations:
      'Preserves fine illustrations, editorial serif type, and subtle tonal palettes exceptionally well on smooth paperboard covers.',
    recommendedDesignAdjustments:
      'Frame gracefully to vertical cover proportions, protect inner spine clearance, and choose full-bleed cover artwork or isolated emblem cleanly.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'journal',
    name: 'Journal',
    category: 'paper-wall-art',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Editorial archival cover treatment—detailed scientific plate, refined monogram/title block, or cohesive full-cover illustration.',
    defaultBackgroundTreatment: 'context-dependent',
    printSurfaceCharacteristics:
      'Hardcover or softcover portrait book front with tactile paper/cloth feel; rewards thoughtful hierarchy and generous cover margins.',
    supportedProductColors: ['Linen Cream', 'Deep Charcoal', 'Midnight Blue', 'Full-Bleed Printed Cover'],
    printingMethod: 'Full-color cover print or deboss/print finish (verify cover stock constraints)',
    colorAndContrastConsiderations:
      'Rich muted editorial palettes and fine line illustrations perform cleanly on hardcover journal stock.',
    recommendedDesignAdjustments:
      'Establish refined book-cover hierarchy and leave safe margin near left spine and trim edges.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'poster',
    name: 'Poster',
    category: 'paper-wall-art',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Complete, gallery-worthy rectangular poster composition preserving intentional backgrounds, borders, visual hierarchy, and margins.',
    defaultBackgroundTreatment: 'full-background',
    printSurfaceCharacteristics:
      'Large flat archival paper sheet capable of showcasing intricate maps, multi-part diagrams, rich textures, and legible secondary captions.',
    supportedProductColors: ['Archival Matte White Paper (Full-Bleed Print)'],
    printingMethod: 'High-resolution full-color archival inkjet / giclée printing',
    colorAndContrastConsiderations:
      'Supports full tonal nuance, subtle paper textures, borders, and dark or light complete backgrounds—do not strip intentional poster backgrounds.',
    recommendedDesignAdjustments:
      'Preserve artistic intent, refine rectangular framing/margins cleanly, and avoid distorting proportions.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'art-print',
    name: 'Art print',
    category: 'paper-wall-art',
    typicalOrientation: 'vertical',
    preferredComposition:
      'Framable fine-art plate or illustration with intentional border breathing room or clean full-bleed field.',
    defaultBackgroundTreatment: 'full-background',
    printSurfaceCharacteristics:
      'Heavyweight fine-art paper stock designed for framing; preserves delicate stippling, botanical/astronomical plates, and fine ink hatching.',
    supportedProductColors: ['Natural Archival Cotton Paper (Full-Bleed Print)'],
    printingMethod: 'Archival giclée / fine-art pigment print',
    colorAndContrastConsiderations:
      'Maintain authentic tonal balance, fine linework fidelity, and warm paper harmony without artificial digital glow.',
    recommendedDesignAdjustments:
      'Keep complete composition intact, ensure balanced framing margins, and retain intentional background tones.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },

  // ========================
  // Desk & Accessories (4)
  // ========================
  {
    id: 'desk-mat',
    name: 'Desk mat',
    category: 'desk-accessories',
    typicalOrientation: 'horizontal',
    preferredComposition:
      'Wide horizontal panoramic layout where primary typography or focal illustration remains clear of typical keyboard/mouse resting zones or sits harmoniously across the mat.',
    defaultBackgroundTreatment: 'full-background',
    printSurfaceCharacteristics:
      'Wide landscape neoprene-and-fabric surface with stitched edge trim; requires full horizontal composition without stretching artwork.',
    supportedProductColors: ['Full-Bleed Printed Top (Black Stitched Edge)'],
    printingMethod: 'Full-bleed dye sublimation on polyester fabric surface',
    colorAndContrastConsiderations:
      'Rich matte inks, dark atmospheric fields, warm parchment tones, and clean graphic charts work brilliantly across wide desk areas.',
    recommendedDesignAdjustments:
      'Extend background textures, coordinate motifs, or spacious negative field horizontally rather than stretching original proportions; keep critical text away from extreme stitch edges.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    category: 'desk-accessories',
    typicalOrientation: 'horizontal',
    preferredComposition:
      'Balanced compact landscape or rounded-corner rectangular composition with full-bleed background harmony.',
    defaultBackgroundTreatment: 'full-background',
    printSurfaceCharacteristics:
      'Compact horizontal fabric-top neoprene pad; moderate visual area where tiny cluttered footnotes lose crispness on woven fabric.',
    supportedProductColors: ['Full-Bleed Printed Surface'],
    printingMethod: 'Dye sublimation transfer onto fabric surface',
    colorAndContrastConsiderations:
      'Woven cloth slightly softens razor-thin hairlines; strong cohesive contrast and saturated color blocks print reliably.',
    recommendedDesignAdjustments:
      'Adapt to slightly wider rectangular proportions cleanly, extend edge background smoothly, and keep key focal elements centered inside safe margin.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'laptop-sleeve',
    name: 'Laptop sleeve',
    category: 'desk-accessories',
    typicalOrientation: 'horizontal',
    preferredComposition:
      'Intentional horizontal rectangular front-panel layout—either cohesive full-bleed pattern/scene or centered editorial emblem with generous margin.',
    defaultBackgroundTreatment: 'context-dependent',
    printSurfaceCharacteristics:
      'Padded rectangular neoprene/canvas sleeve with zipper seam margins along perimeter edges.',
    supportedProductColors: ['Full-Bleed Printed Front', 'Matte Black Base', 'Natural Canvas'],
    printingMethod: 'Full-color sublimation or print panel assembly (verify edge-bleed seams)',
    colorAndContrastConsiderations:
      'Keep critical artwork and text comfortably inside outer perimeter seams to prevent zipper-edge cropping.',
    recommendedDesignAdjustments:
      'Adapt proportions to landscape sleeve face cleanly without stretching, extend backdrop motifs safely to bleed if full-bleed, or isolate clean emblem.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
  {
    id: 'tote-bag',
    name: 'Tote bag',
    category: 'desk-accessories',
    typicalOrientation: 'square',
    preferredComposition:
      'Bold centered spot print (emblem, humorous illustration, witty bookish slogan, or clean botanical/scientific graphic) sitting mid-upper bag face.',
    defaultBackgroundTreatment: 'transparent',
    printSurfaceCharacteristics:
      'Woven cotton canvas or organic twill tote face; open weave textures favor clean medium-to-bold graphics with transparent edges over heavy full-bleed blocks.',
    supportedProductColors: ['Natural / Ecru Canvas', 'Black Canvas', 'Navy'],
    printingMethod: 'Direct-to-garment (DTG), DTF transfer, or screen print on canvas (verify blank)',
    colorAndContrastConsiderations:
      'On natural ecru canvas, deep charcoal, ink blue, forest green, and warm rust inks look crisp and organic; on black canvas, lift dark strokes for contrast.',
    recommendedDesignAdjustments:
      'Remove unwanted rectangular box fills, ensure clean transparent background, and scale primary typography cleanly for mid-bag balance.',
    exactPrintSpecifications: '',
    additionalInstructions: '',
    isBuiltIn: true,
  },
];
