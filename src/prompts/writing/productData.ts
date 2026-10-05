import {
  ProductDataOptions,
  ProductDataAffiliateType,
  ProductDataEditorialPositioning,
  ProductDataEditorialTone,
} from './types';
import { getTemplateSection } from '../../utils/templateManager';

function formatAffiliateType(type: ProductDataAffiliateType): string {
  switch (type) {
    case 'affiliate':
      return 'Affiliate link (sponsored: true, rel: "nofollow sponsored")';
    case 'direct':
      return 'Direct product link (sponsored: false, rel: "nofollow")';
    case 'sponsored':
      return 'Sponsored product link (sponsored: true, rel: "nofollow sponsored")';
    case 'not-sponsored':
      return 'Non-sponsored direct link (sponsored: false, rel: "")';
    default:
      return 'Direct product link';
  }
}

function formatEditorialPositioning(pos?: ProductDataEditorialPositioning): string {
  switch (pos) {
    case 'broad-appeal':
      return 'Broad appeal — Accessible, universal gift for general curious minds';
    case 'enthusiast-niche':
      return 'Enthusiast / Niche interest — Tailored for deep domain passion and subject expertise';
    case 'practical-gift':
      return 'Practical gift — High utility, daily ritual focus, functional excellence';
    case 'conversation-piece':
      return 'Conversation piece — Striking visual design, historical mystery or scientific curiosity';
    case 'collector-enthusiast':
      return 'Collector / Enthusiast — Rare, archival, heirloom quality or limited edition';
    case 'novelty-gift':
      return 'Novelty gift — Clever, witty, lighthearted science charm';
    case 'none':
    default:
      return 'Default / Unspecified editorial positioning';
  }
}

function formatEditorialTone(tone: ProductDataEditorialTone): string {
  switch (tone) {
    case 'standard':
      return 'Standard Science of Gifts — Eloquent, intellectually curious, tactile, and warmly authoritative.';
    case 'practical':
      return 'More Practical — Focus heavily on specs, everyday utility, durability, and practical gift value.';
    case 'playful':
      return 'More Playful — Witty, lighthearted, with clever scientific humor or charming historical anecdotes.';
    case 'sophisticated':
      return 'More Sophisticated — Poetic, quiet luxury, understated craft, and high aesthetic distinction.';
    default:
      return 'Standard Science of Gifts';
  }
}

/**
 * Builds the complete prompt for generating structured Science of Gifts YAML Product Records.
 * Automatically incorporates customizable template rules.
 */
export function generateProductDataPrompt(options: ProductDataOptions): string {
  const url = options.productUrl.trim() || 'https://example.com/product';
  const type = options.productType.trim() || 'Journal / Notebook';
  const category = options.category.trim() || 'Astronomy & Stargazing';
  const affiliateDesc = formatAffiliateType(options.affiliateType);
  const toneDesc = formatEditorialTone(options.editorialTone);

  const priceInfo =
    options.priceMode === 'provided' && options.providedPrice?.trim()
      ? `Provided Price: ${options.providedPrice.trim()}`
      : 'Extract exact price and price range from the source URL';

  const positioningBlock =
    options.editorialPositioning && options.editorialPositioning !== 'none'
      ? `• Editorial Positioning: ${formatEditorialPositioning(options.editorialPositioning)}\n`
      : '';

  const additionalBlock = options.additionalInstructions?.trim()
    ? `\nADDITIONAL INSTRUCTIONS & PRODUCT BRIEF:\n${options.additionalInstructions.trim()}\n`
    : '';

  const imageBlock = options.hasImage
    ? `• Attached Product Image: ${options.imageName || 'Product Image Attached'}\n  Instruction: Examine the attached product image to verify physical materials, color, design graphics, artwork, and visual features.`
    : '• Product Image: Please examine the attached product image alongside this prompt to verify physical design, graphics, and materials.';

  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'general-science';

  const objectiveAndRole = getTemplateSection('productData', 'objectiveAndRole');
  const researchAndAccuracyRules = getTemplateSection('productData', 'researchAndAccuracyRules');
  let schemaDefinition = getTemplateSection('productData', 'schemaDefinition');
  const strictOutputDirectives = getTemplateSection('productData', 'strictOutputDirectives');

  schemaDefinition = schemaDefinition
    .replace(/\{\{category-slug\}\}/g, categorySlug)
    .replace(/\{\{product-slug\}\}/g, type.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

  return `Science of Gifts — Product Data Catalog Record Prompt

${objectiveAndRole}

INPUT DATA & CONTEXT:
• Source / Product URL: ${url}
• Product Type: ${type}
• Subject / Category: ${category}
• Affiliate / Link Configuration: ${affiliateDesc}
• Price Instructions: ${priceInfo}
${positioningBlock}• Brand Voice & Tone: ${toneDesc}
${imageBlock}
${additionalBlock}
${researchAndAccuracyRules}

${schemaDefinition}

${strictOutputDirectives}`;
}
