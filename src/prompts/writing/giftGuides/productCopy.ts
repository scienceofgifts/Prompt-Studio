import { GiftGuideProductCopyOptions, GiftGuideTone } from './types';
import { composeWritingStyleBlocks } from '../../../utils/styleManager';
import { getTemplateSection } from '../../../utils/templateManager';
import { WritingStylesConfig } from '../styles';

function formatToneDescription(tone: GiftGuideTone): string {
  switch (tone) {
    case 'conversational-editorial':
      return 'Conversational Editorial — Cultured, engaging, and smart. Explains the product like a trusted tastemaker friend.';
    case 'warm-helpful':
      return 'Warm & Helpful — Empathetic, generous, and focused on recipient delight and peace of mind.';
    case 'witty-refined':
      return 'Witty but Refined — Elegant wit and subtle intellectual charm with zero gimmicks.';
    case 'practical':
      return 'Practical & Actionable — Grounded in utility, durability, materials, and real daily use.';
    case 'informational':
      return 'Informational & Curious — Grounded in history, craftsmanship, and fascinating details.';
    default:
      return 'Editorial and thoughtful.';
  }
}

function formatLengthDirective(length: 'concise' | 'balanced' | 'detailed'): string {
  switch (length) {
    case 'concise':
      return 'Concise (1 punchy paragraph, ~75–100 words) — High impact, fast reading, ideal for curated gallery lists.';
    case 'balanced':
      return 'Balanced (2 focused paragraphs, ~130–180 words) — First paragraph covers the product concept and sensory appeal; second paragraph articulates why it delights this exact recipient.';
    case 'detailed':
      return 'Detailed Editorial Profile (~200–250 words) — In-depth appreciation covering design narrative, physical craftsmanship, and recipient relevance, concluding with a memorable one-liner.';
    default:
      return 'Balanced (2 focused paragraphs).';
  }
}

/**
 * Builds a prompt specifically for writing copy for ONE product WITHIN a gift guide.
 * Does NOT generate the entire gift guide.
 * Automatically incorporates Global + Copy writing styles and customizable template rules.
 */
export function generateGiftGuideProductCopyPrompt(
  options: GiftGuideProductCopyOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const guideTitle = options.guideTitle.trim() || 'Curated Gift Guide';
  const recipient = options.recipient.trim() || 'The intended recipient';
  const productName = options.productName.trim() || 'Featured Gift Item';
  const productType = options.productType.trim() || 'Curated Gift';
  const features = options.productFeatures.trim() || 'High-quality materials, refined aesthetic craftsmanship';
  const whyItFits = options.whyItFits.trim() || 'Matches the recipient’s intellectual curiosity and aesthetic appreciation';
  const toneDesc = formatToneDescription(options.tone);
  const lengthDesc = formatLengthDirective(options.desiredLength);

  const keywordSection = options.primaryKeyword?.trim()
    ? `• Primary Guide Keyword: "${options.primaryKeyword.trim()}" (Weave naturally only if it fits effortlessly; never force it)`
    : '';

  const urlSection = options.productUrl?.trim()
    ? `• Product Reference Link (Provided for context/reference by the human curator): ${options.productUrl.trim()}\n  [Note for model: Do not attempt to access external web servers. Use the link purely as topical title/vendor context.]\n`
    : '';

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL CURATOR INSTRUCTIONS:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeGlobal: true, includeCopy: true },
    styles
  );

  const productCopyTemplate = getTemplateSection('giftGuides', 'productCopy');
  const generalRules = getTemplateSection('giftGuides', 'generalWritingRules');

  return `Gift Guide Single-Product Entry Prompt — Science of Gifts

${productCopyTemplate}

GIFT GUIDE PARENT CONTEXT:
• Overall Gift Guide Title / Topic: "${guideTitle}"
• Intended Recipient / Audience: ${recipient}
${keywordSection}

FEATURED PRODUCT SPECIFICATIONS:
• Product Name: ${productName}
• Product Category / Type: ${productType}
${urlSection}• Key Features, Materials & Craftsmanship:
${features.split('\n').map(f => `  - ${f}`).join('\n')}
• Why This Product Specifically Fits the Recipient:
  ${whyItFits}
• Desired Length: ${lengthDesc}
• Voice & Tone: ${toneDesc}
${additionalSection}
${generalRules ? `\n${generalRules}\n` : ''}
${styleSection}`;
}
