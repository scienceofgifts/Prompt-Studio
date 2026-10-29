import { GeneratorId, GeneratorTemplateConfig } from './types';

// ==========================================
// 1. PRODUCT PHOTOGRAPHY DEFAULT TEMPLATES
// ==========================================
export const DEFAULT_PHOTOGRAPHY_SECTIONS = {
  headerAndRole: `Commercial Editorial Product Photograph — Science of Gifts Studio`,

  universalPreservation: `UNIVERSAL PRODUCT PRESERVATION MANDATE (FIXED CONSTRAINTS):
• PRODUCT SOURCE OF TRUTH: The physical hero product itself is the single most critical element in the photograph.
• ABSOLUTE GRAPHIC & ARTWORK FIDELITY: Faithfully preserve all actual product design, artwork, illustrations, typography, logos, foil stamping, debossing, and surface graphics exactly as shown in the reference. Do NOT redesign, recolor, reinterpret, replace, or distort any graphic elements.
• EXACT CONSTRUCTION & PHYSICAL DETAILS: Faithfully retain all authentic physical construction details—bookbinding spines, closures, ribbon markers, seam lines, collar ribbing, glass sham weight, handles, caps, bottle spouts, and material textures.
• ACCURATE PRODUCT COLORS & PROPORTIONS: Never alter the true physical colors of the product itself or distort its natural proportions.
• NO FABRICATED FEATURES: Never invent unrequested product features, logos, or accessories on the hero product itself.`,

  productIdentification: `PRODUCT IDENTIFICATION:
• Hero Product: {{productDescription}}
• Product Category: {{productTypeName}}
• Orientation & Staging: {{productOrientationText}}`,

  productFidelityDirectives: `PRODUCT-SPECIFIC FIDELITY DIRECTIVES:
{{productFidelityDirectives}}`,

  creativeDirection: `CREATIVE DIRECTION & THEME:
• {{themeText}}`,

  cameraAndPerspective: `{{cameraText}}`,

  compositionAndFraming: `{{compositionText}}`,

  environmentAndSurfaces: `ENVIRONMENT, BACKGROUND & SURFACE:
• {{backgroundText}}
• {{surfaceText}}`,

  lightingAndShadows: `{{lightingText}}`,

  stylingAndProps: `{{propsText}}`,

  colorPalette: `{{colorText}}`,

  controlledVariation: `{{variationText}}`,

  technicalSettings: `{{technicalSettings}}`,

  websiteCropSafe: `WEBSITE CROP-SAFE COMPOSITION (4:3 SAFE ZONE DIRECTIVE):
• The generated source image is square (1:1), but will subsequently be displayed and cropped by the website container to approximately a 4:3 aspect ratio.
• Treat the central 4:3 horizontal region as the essential visible safe zone.
• Keep the entire hero product, its primary silhouette, and all vital physical details comfortably positioned within this central safe area.
• Keep all product typography, logos, cover artwork, graphic illustrations, labels, and critical visual details well away from the top and bottom crop zones.
• Do not place important features close to the top or bottom edges of the 1:1 frame; allow only non-essential background environment or surface texture to occupy areas that may be trimmed.
• Maintain an attractive, premium, and balanced composition with natural breathing room without making the product unnecessarily small.
• Ensure the final composition looks intentional, balanced, and complete both in the original square frame and after the 4:3 crop is applied.`,

  negativeExclusions: `{{negativeExclusions}}`,

  finalQualityRequirement: `FINAL OUTPUT REQUIREMENT:
A finished, hyper-realistic commercial studio product photograph ready for publication in high-end editorial catalogs and boutique e-commerce galleries. The hero product must remain tack-sharp, authentic, and protected.`,
};

// ==========================================
// 2. PRODUCT COPY DEFAULT TEMPLATES
// ==========================================
export const DEFAULT_PRODUCT_COPY_SECTIONS = {
  roleAndObjective: `ROLE & OBJECTIVE:
Act as a master luxury copywriter for "Science of Gifts", a boutique purveyor of scientifically and historically inspired goods.

Your objective is to craft complete, evocative, high-converting product page copy for a new flagship item. The copy must clearly explain what the item is, celebrate its concept and materials, and connect emotionally with the target customer—without slipping into generic marketing hyperbole.`,

  requiredDeliverables: `REQUIRED COPY DELIVERABLES:
1. Product Title & Editorial Sub-Heading:
   - Provide a clean, memorable primary product title.
   - Include a 1-sentence poetic standfirst capturing the product's soul (e.g. "A daily companion for field notes, midnight reflections, and celestial observations").

2. The Editorial Narrative / Story Section (120–180 words):
   - Transport the customer into the origin of the design: the historical era, astronomical phenomenon, or mathematical beauty that inspired it.
   - Explain what makes this design meaningful, not just decorative.

3. "Why You'll Love It" / Sensory Details (3–4 Short Bullet Points):
   - Translate physical features into tactile benefits (e.g., how the paper feels under a nib, how the ceramic feels in hands on a brisk morning, how the glaze catches lamplight).
   - Use evocative, sensory language without exaggeration.

4. Specifications & Craftsmanship Breakdown:
   - Clean, organized technical specifications (dimensions, materials, origin, care, packaging).

5. The Gifting Note (60–90 words):
   - Describe why this item makes an unforgettable gift and who would cherish receiving it. Include a suggested handwritten gift-card sentiment.`,

  outputFormat: `OUTPUT FORMAT:
Provide the complete product page copy in clean Markdown with distinct section headers, bullet lists, and polished formatting ready to paste into Shopify or a luxury catalog.`,
};

// ==========================================
// CONFIGURATIONS REGISTRY & METADATA
// ==========================================
export const GENERATOR_TEMPLATES_CONFIG: Record<GeneratorId, GeneratorTemplateConfig> = {
  photography: {
    id: 'photography',
    label: 'Product Photography',
    description: 'Universal product fidelity, camera angles, lighting, background, props, and negative prompts',
    iconName: 'Camera',
    sections: DEFAULT_PHOTOGRAPHY_SECTIONS,
    metadata: {
      headerAndRole: {
        id: 'headerAndRole',
        label: 'Prompt Header & Context',
        description: 'The top-level headline declaring studio style and photographic intent.',
        category: 'photography',
      },
      universalPreservation: {
        id: 'universalPreservation',
        label: 'Universal Product Preservation Mandate',
        description: 'Fixed constraints protecting product artwork, exact logos, typography, construction, and authentic proportions.',
        category: 'photography',
      },
      productIdentification: {
        id: 'productIdentification',
        label: 'Product Identification & Staging Framing',
        description: 'Template framing hero product description, category, and orientation parameters.',
        category: 'photography',
      },
      productFidelityDirectives: {
        id: 'productFidelityDirectives',
        label: 'Product-Specific Fidelity Framing',
        description: 'Template wrapper that inserts product-specific rules (notebook spine, t-shirt ribbing, mug handles, etc.).',
        category: 'photography',
      },
      creativeDirection: {
        id: 'creativeDirection',
        label: 'Creative Direction & Theme Header',
        description: 'Instructions framing the selected art direction and thematic mood.',
        category: 'photography',
      },
      cameraAndPerspective: {
        id: 'cameraAndPerspective',
        label: 'Camera & Perspective Wrapper',
        description: 'Instructions framing camera angle, shot type, focal length, and depth of field.',
        category: 'photography',
      },
      compositionAndFraming: {
        id: 'compositionAndFraming',
        label: 'Composition & Framing Wrapper',
        description: 'Instructions framing composition geometry, product position, and negative space.',
        category: 'photography',
      },
      environmentAndSurfaces: {
        id: 'environmentAndSurfaces',
        label: 'Environment, Background & Surface Framing',
        description: 'Instructions framing background tones, surfaces, and architectural studio environment.',
        category: 'photography',
      },
      lightingAndShadows: {
        id: 'lightingAndShadows',
        label: 'Lighting & Shadow Framing',
        description: 'Instructions framing studio key light, window illumination, and shadow diffusion.',
        category: 'photography',
      },
      stylingAndProps: {
        id: 'stylingAndProps',
        label: 'Styling & Props Framing',
        description: 'Instructions framing prop curation, placement rules, and anti-clutter directives.',
        category: 'photography',
      },
      colorPalette: {
        id: 'colorPalette',
        label: 'Color Palette & Tonal Harmony',
        description: 'Instructions framing color palette, tonal balance, and Science of Gifts signature accents.',
        category: 'photography',
      },
      controlledVariation: {
        id: 'controlledVariation',
        label: 'Controlled Variation Mandate',
        description: 'Instructions governing bounded micro-variation across generations.',
        category: 'photography',
      },
      technicalSettings: {
        id: 'technicalSettings',
        label: 'Technical Settings & Aspect Ratio',
        description: 'Instructions specifying aspect ratio, camera rendering style, and optical fidelity.',
        category: 'photography',
      },
      websiteCropSafe: {
        id: 'websiteCropSafe',
        label: 'Website Crop-Safe Composition (4:3 Safe Zone)',
        description: 'Directives ensuring hero products, logos, and artwork remain centered inside the 4:3 safe zone when displayed in website containers.',
        category: 'photography',
      },
      negativeExclusions: {
        id: 'negativeExclusions',
        label: 'Strict Exclusions (Negative Prompts)',
        description: 'Negative constraints forbidding text watermarks, floating objects, and artificial alterations.',
        category: 'photography',
      },
      finalQualityRequirement: {
        id: 'finalQualityRequirement',
        label: 'Final Output Quality Requirement',
        description: 'Closing directive demanding commercial publication-grade studio clarity.',
        category: 'photography',
      },
    },
  },

  productCopy: {
    id: 'productCopy',
    label: 'Product Copy',
    description: 'Instructions for boutique e-commerce product pages, storytelling narratives, sensory highlights, and specs',
    iconName: 'ShoppingBag',
    sections: DEFAULT_PRODUCT_COPY_SECTIONS,
    metadata: {
      roleAndObjective: {
        id: 'roleAndObjective',
        label: 'Role & Copywriting Objective',
        description: 'Directives for luxury boutique storytelling without salesy marketing hyperbole.',
        category: 'productCopy',
      },
      requiredDeliverables: {
        id: 'requiredDeliverables',
        label: 'Required Copy Deliverables',
        description: 'Specifies Title & Standfirst, Editorial Narrative, Why You Love It sensory details, Specs, and Gifting Note.',
        category: 'productCopy',
      },
      outputFormat: {
        id: 'outputFormat',
        label: 'Output Format & Formatting Rules',
        description: 'Formatting guidelines for clean Markdown, bullet points, and Shopify-ready copy.',
        category: 'productCopy',
      },
    },
  },
};
