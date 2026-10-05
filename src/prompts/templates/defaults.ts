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
// 2. GIFT GUIDES DEFAULT TEMPLATES
// ==========================================
export const DEFAULT_GIFT_GUIDES_SECTIONS = {
  introduction: `ROLE & TASK:
Act as a seasoned cultural and lifestyle essayist writing specifically the INTRODUCTION SECTION for a gift guide published by "Science of Gifts".

SCOPE CONSTRAINT:
Write ONLY the introductory section (approximately 150–250 words). Do NOT generate the product list, headings for other sections, or the full gift guide. Your output must strictly be the opening narrative of the article.

OBJECTIVES FOR THIS INTRODUCTION:
1. Establish the Topic Naturally:
   - Hook the reader immediately with an authentic observation, a relatable truth about gifting, or a captivating historical/scientific insight related to the topic.
   - Avoid generic platitudes and hollow openings like "Finding the perfect gift is hard" or "In today's fast-paced world".

2. Clarify Who This Guide is For:
   - Clearly identify the recipient persona and acknowledge their particular tastes, quirks, and standards.
   - Explain why thoughtful curation matters here, cutting through the noise of mass-market generic items.

3. Build Anticipation & Credibility:
   - Set up the collection ahead with taste, warmth, and discernment.
   - Smoothly transition the reader into the first curated item without awkward segue formulas like "Without further ado, let's dive into the list".

OUTPUT FORMAT:
Provide 2 distinct introduction variations:
- Option A: Conversational & Narrative (warm, engaging storytelling hook)
- Option B: Sleek & Editorial (refined, concise, and punchy)
Followed by a suggested 1-sentence transition line leading into the guide's first product.`,

  productCopy: `ROLE & TASK:
Act as a seasoned cultural essayist and product curator writing a SINGLE PRODUCT ENTRY for a gift guide published by "Science of Gifts".

SCOPE CONSTRAINT:
Write ONLY the copy for this individual product. Do NOT write an entire gift guide, introduction, or conclusion.

CURATORIAL GOALS FOR THIS ITEM:
1. What It Is & Why It Belongs:
   - Clearly identify what the product is within the first sentence.
   - Explain what makes this specific design worthy of inclusion—its craftsmanship, historical connection, clever concept, or tactile appeal.

2. Tactile & Experiential Value:
   - Highlight 1–2 specific physical or experiential details that elevate it beyond generic merchandise.
   - Avoid empty buzzwords ("game-changer", "must-have", "perfection"). Focus on honest, tangible appeal.

3. Recipient Fit:
   - Articulate precisely who will cherish receiving this and the exact context or ritual where they will enjoy it.

OUTPUT FORMAT:
Provide the product entry with:
- Suggested Curatorial Headline / Nickname
- Concise Standfirst / One-Liner
- Body Copy Paragraph (80–140 words)
- "Best For" Bullet Note (1 punchy sentence)`,

  moreGifts: `ROLE & TASK:
Act as a seasoned lifestyle curator and editor for "Science of Gifts", writing a "MORE GIFTS" / ROUNDUP SPOTLIGHT SECTION for a gift guide.

SCOPE CONSTRAINT:
Write ONLY this thematic mini-roundup section (approx 120–180 words). Do NOT generate the entire gift guide.

OBJECTIVES FOR THIS MINI-ROUNDUP:
1. Section Theme Introduction:
   - Introduce the thematic sub-category with warmth and discernment.
   - Explain why this specific category adds thoughtful variety to the recipient's life or wardrobe.

2. Curated Item Highlights:
   - Frame the included items with crisp, evocative descriptions that emphasize distinctive design, clever science/history motifs, and material quality.
   - Avoid repetitive phrasing across items.

3. Styling / Gifting Context:
   - Offer a quick suggestion on how these items can be gifted individually or bundled as a curated gift set.

OUTPUT FORMAT:
- Catchy Editorial Section Sub-Heading
- Brief Introductory Paragraph (40–60 words)
- Formatted Mini-List of Highlighted Items with 1–2 sentence curatorial notes for each
- Closing Takeaway or Curatorial Recommendation`,

  howToChoose: `ROLE & TASK:
Act as a seasoned lifestyle curator, gift editor, and product specialist for "Science of Gifts", writing a "HOW TO CHOOSE" / BUYER'S ADVICE SECTION for a gift guide.

SCOPE CONSTRAINT:
Write ONLY the buyer guidance section (approx 200–350 words). Do NOT write the product list or introduction.

OBJECTIVES FOR THIS BUYER GUIDE:
1. Educational Advice Framework:
   - Provide concrete, non-obvious buying criteria that help the reader make a confident, discerning decision.
   - Address practical considerations (sizing, materials, display vs utility, beginner vs connoisseur nuance).

2. Avoiding Common Gifting Pitfalls:
   - Point out common mistakes or cheap gimmicks to avoid in this product category.
   - Reassure the reader with criteria for evaluating authentic craftsmanship and enduring quality.

3. Clear Decision Rubrics:
   - Group advice into 3–4 logical criteria or decision paths based on the recipient's specific persona, living space, or habits.

OUTPUT FORMAT:
- Clear Section Heading & 1-sentence subtitle
- 3 to 4 Structured Advice Points with bold takeaways
- "Quick Decision Rule of Thumb" summary box`,

  faq: `ROLE & TASK:
Act as a knowledgeable, trustworthy product specialist and customer advisor for "Science of Gifts", writing a FREQUENTLY ASKED QUESTIONS (FAQ) SECTION for a gift guide.

SCOPE CONSTRAINT:
Write ONLY the FAQ section for this gift guide. Do NOT generate the full article.

OBJECTIVES FOR THIS FAQ:
1. Authentic & Helpful Answers:
   - Provide direct, genuinely useful answers to real shopper questions, hesitations, and common dilemma scenarios.
   - Avoid corporate non-answers, robotic marketing filler, or generic fluff.

2. Tone & Authority:
   - Maintain a knowledgeable, friendly, and reassuring editorial voice.
   - Address budget appropriateness, sizing/fit reassurance, care/longevity, or recipient compatibility honestly.

OUTPUT FORMAT:
- Section Heading: "Frequently Asked Questions"
- Formatted Q&A pairs with bold Question headers and clear, conversational Answer paragraphs (50–90 words per answer).`,

  titleMeta: `ROLE & TASK:
Act as a master SEO editor and digital publishing strategist for "Science of Gifts", crafting SEARCH-OPTIMIZED TITLES & META DESCRIPTIONS for a gift guide.

OBJECTIVES:
1. High-Clickthrough Titles:
   - Craft irresistible, brand-appropriate titles that capture genuine search intent without clickbait deception.
   - Balance curiosity, specificity, and keyword prominence.

2. Meta Descriptions:
   - Write enticing, clear meta descriptions under 155 characters that summarize value and invite clicks in search engine results.

OUTPUT FORMAT:
Provide:
- 3 Primary SEO Title Options (Search-Focused, Editorial/Story, High-CTR Curated)
- 2 Meta Description Options (under 155 characters each)
- Suggested URL Slug & Social Share Standfirst`,

  generalWritingRules: `GENERAL WRITING & TONE DIRECTIVES:
• Human Cadence: Maintain natural sentence rhythm with varied sentence length and genuine warmth.
• Avoid AI Clichés: Never use boilerplate phrases like "In today's fast-paced world", "Look no further", "Torn between", or "Elevate your gift game".
• Punctuation Discipline: Strictly avoid excessive em dashes (—); use natural commas, colons, or clean periods instead.
• Honest Restraint: Celebrate genuine material craftsmanship and design intellect without marketing hyperbole.`,
};

// ==========================================
// 3. ARTICLES DEFAULT TEMPLATES
// ==========================================
export const DEFAULT_ARTICLES_SECTIONS = {
  roleAndObjective: `ROLE & OBJECTIVE:
Act as an acclaimed magazine journalist and essayist writing for "Science of Gifts". Your mission is to write a deeply researched, engaging, and memorable feature article on the requested topic.

The piece must read like a thoughtful piece in The Atlantic, The New Yorker, or Kinfolk—rich with genuine insight, lucid prose, and zero boilerplate SEO filler.`,

  editorialArchitecture: `REQUIRED EDITORIAL ARCHITECTURE:
1. Compelling Headline & Standfirst:
   - Provide 3 distinct title options (Editorial, Conversational, Search-optimized).
   - Include a 1–2 sentence standfirst / subtitle summarizing the article's core thesis with intellectual flair.

2. Engaging Introduction (200–300 words):
   - Open with an evocative hook: an overlooked historical anecdote, a compelling scientific study, a sensory vignette, or a counterintuitive observation.
   - Avoid generic platitudes ("In today's fast-paced world...").
   - Establish the stakes: why this subject matters for anyone seeking a more deliberate, beautiful life.

3. Structured Body Sections (4–6 Thoughtful Sub-Headings):
   - Break the discussion into logical H2 and H3 sections.
   - Ground arguments in tangible real-world examples, material culture, scientific principles, or historical references.
   - Include at least one "Pull Quote" or emphasized key takeaway that summarizes a cornerstone insight.
   - If applicable to the article type, include actionable advice, bulleted frameworks, or concrete takeaways that readers can implement immediately.

4. Thoughtful Synthesis & Conclusion (150–200 words):
   - Bring the thesis full circle to a resonant final thought.
   - Leave the reader with an enduring insight about material culture, memory, or human connection.`,

  outputFormat: `OUTPUT FORMAT:
Provide the full article in clean, beautifully structured Markdown with proper headings (H1, H2, H3), pull quotes, and subtle emphasis.`,
};

// ==========================================
// 4. PRODUCT COPY DEFAULT TEMPLATES
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
// 5. PRODUCT DATA DEFAULT TEMPLATES
// ==========================================
export const DEFAULT_PRODUCT_DATA_SECTIONS = {
  objectiveAndRole: `OBJECTIVE:
Act as a senior data analyst and catalog editor for "Science of Gifts". Your task is to research the product at the supplied URL and examine the attached product image to generate a complete, factually accurate Science of Gifts YAML product record.`,

  researchAndAccuracyRules: `STRICT RESEARCH & FACTUAL ACCURACY DIRECTIVES:
1. Examine the attached product image: Use the image to verify physical product construction, design graphics, artwork, proportions, materials, colors, closures, and physical details.
2. Research the supplied product/source URL: Use the source URL as the absolute authority for factual product specifications, dimensions, materials, care instructions, origin, brand details, and verifiable vendor facts.
3. Preserve factual accuracy: Never invent or hallucinate product specifications, dimensions, weights, ingredients, materials, retail prices, features, or physical attributes. If a detail cannot be verified from the source URL or image, state it conservatively or omit spec keys.
4. Original editorial copy: Write fresh, bespoke, original editorial reviews and curatorial copy for the product. Do NOT copy vendor marketing prose or sales fluff verbatim.
5. Taxonomy adherence: Adhere strictly to existing Science of Gifts taxonomy values. Avoid creating arbitrary new category names or tags when an appropriate standard term exists.`,

  schemaDefinition: `SCIENCE OF GIFTS YAML PRODUCT SCHEMA:
Fill out all fields completely adhering to standard Science of Gifts structure:

id: "{{slugified-product-title}}"
title: "Clean, evocative product title"
image: "/images/products/{{category-slug}}/{{product-slug}}.webp"
imageType: "webp"
price: "$XX.XX" # Current verified retail price
priceNumber: XX.XX # Float number for sorting and filtering
priceRange: "under-25" | "25-50" | "50-100" | "100-200" | "over-200"
vendor: "Exact Vendor or Maker Name"
vendorUrl: "Source URL"
affiliate:
  sponsored: boolean
  rel: "nofollow sponsored" | "nofollow" | ""
category: "Category Name"
badgeLabel: "Staff Pick" | "Bestseller" | "Collector's Item" | "Archival Favorite" | "" # Optional
recipients: # 2-5 relevant recipient types
  - "Stargazers"
  - "Writers"
interests: # 2-5 relevant domain interests
  - "Astronomy"
  - "History of Science"
occasions: # 2-4 appropriate gifting occasions
  - "Birthdays"
  - "Graduation"
ageRanges: # Target recipient demographics
  - "Adults"
personalityStyles: # 2-4 personality traits
  - "Thoughtful"
  - "Intellectual"
tags: # 4-8 searchable keywords
  - "ceramic mug"
  - "astronomy"
editorialReview: >
  Concise 2-3 paragraph editorial review (120-180 words) written in Science of Gifts voice.
  Celebrates tactile craftsmanship, design authenticity, and practical utility.
whyItMakesAGreatGift: >
  1-2 sentences explaining the emotional and gifting resonance.
idealFor: "1 concise sentence defining the ideal recipient persona."
whatMakesItStandOut:
  - "First distinctive design or material characteristic"
  - "Second standout craftsmanship or conceptual detail"
  - "Third practical or aesthetic advantage"
thingsToConsider:
  - "Honest consideration (e.g. hand-wash recommended, standard sizing note)"
specs:
  - "Material: High-fired ceramic / 120 GSM archival paper / etc."
  - "Dimensions: Verified product dimensions"
  - "Origin: Made in USA / Imported / etc."
tagline: "Short 5-8 word poetic product summary"`,

  strictOutputDirectives: `RETURN ONLY THE COMPLETED YAML PRODUCT OBJECT.
Do not wrap it in Markdown code fences.
Do not explain the result.
Do not omit fields.
Do not invent unavailable factual information.`,
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

  giftGuides: {
    id: 'giftGuides',
    label: 'Gift Guides',
    description: 'Instructions for introduction, product entries, more gifts roundups, how to choose advice, FAQs, and SEO meta',
    iconName: 'Gift',
    sections: DEFAULT_GIFT_GUIDES_SECTIONS,
    metadata: {
      introduction: {
        id: 'introduction',
        label: 'Guide Introduction Instructions',
        description: 'Directives for opening hooks, recipient persona acknowledgement, tone, and 2-option deliverable structure.',
        category: 'giftGuides',
      },
      productCopy: {
        id: 'productCopy',
        label: 'Guide Product Entry Instructions',
        description: 'Directives for single product spotlights within a gift roundup (tactile features, fit, headline, standfirst).',
        category: 'giftGuides',
      },
      moreGifts: {
        id: 'moreGifts',
        label: '"More Gifts" Spotlight Instructions',
        description: 'Directives for thematic mini-roundups and curated product list spotlights within a guide.',
        category: 'giftGuides',
      },
      howToChoose: {
        id: 'howToChoose',
        label: '"How to Choose" Advice Instructions',
        description: 'Directives for buyer criteria, pitfall warnings, and structured decision frameworks.',
        category: 'giftGuides',
      },
      faq: {
        id: 'faq',
        label: 'FAQ Section Instructions',
        description: 'Directives for answering shopper dilemmas, sizing, budget, and care questions in Q&A format.',
        category: 'giftGuides',
      },
      titleMeta: {
        id: 'titleMeta',
        label: 'SEO Title & Meta Instructions',
        description: 'Directives for high-CTR H1 headlines, search intent matching, and meta descriptions under 155 chars.',
        category: 'giftGuides',
      },
      generalWritingRules: {
        id: 'generalWritingRules',
        label: 'General Writing Rules & Cadence',
        description: 'Universal voice constraints, em dash avoidance, and anti-cliché mandates across all gift guide prompts.',
        category: 'giftGuides',
      },
    },
  },

  articles: {
    id: 'articles',
    label: 'Articles',
    description: 'Instructions for long-form magazine journalism, cultural essays, standfirsts, and editorial synthesis',
    iconName: 'FileText',
    sections: DEFAULT_ARTICLES_SECTIONS,
    metadata: {
      roleAndObjective: {
        id: 'roleAndObjective',
        label: 'Role & Editorial Objective',
        description: 'High-level mission framing the article as thoughtful Atlantic/New Yorker/Kinfolk-grade cultural journalism.',
        category: 'articles',
      },
      editorialArchitecture: {
        id: 'editorialArchitecture',
        label: 'Required Editorial Architecture',
        description: 'Structure requiring headlines & standfirst, evocative introduction, 4-6 body sections with pull quotes, and synthesis.',
        category: 'articles',
      },
      outputFormat: {
        id: 'outputFormat',
        label: 'Output Format & Markdown Directives',
        description: 'Rules for clean Markdown headers, typography, and polished article layout.',
        category: 'articles',
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

  productData: {
    id: 'productData',
    label: 'Product Data',
    description: 'Instructions for structured Science of Gifts YAML catalog records, factual verification, and taxonomy rules',
    iconName: 'Database',
    sections: DEFAULT_PRODUCT_DATA_SECTIONS,
    metadata: {
      objectiveAndRole: {
        id: 'objectiveAndRole',
        label: 'Objective & Senior Catalog Editor Role',
        description: 'Directives framing catalog research from source URLs and visual verification from attached photos.',
        category: 'productData',
      },
      researchAndAccuracyRules: {
        id: 'researchAndAccuracyRules',
        label: 'Strict Research & Factual Accuracy Rules',
        description: 'Mandates forbidding invented specs or prices, preserving URL authority, and enforcing original editorial review text.',
        category: 'productData',
      },
      schemaDefinition: {
        id: 'schemaDefinition',
        label: 'Science of Gifts Product YAML Schema',
        description: 'The complete specification for every YAML catalog field (id, price, vendor, category, recipients, review, specs, etc.).',
        category: 'productData',
      },
      strictOutputDirectives: {
        id: 'strictOutputDirectives',
        label: 'Strict Output Directives',
        description: 'Mandates to return strictly raw YAML without Markdown fences, explanations, or omissions.',
        category: 'productData',
      },
    },
  },
};
