import { GiftGuideTitleMetaOptions } from './types';
import { composeWritingStyleBlocks } from '../../../utils/styleManager';
import { getTemplateSection } from '../../../utils/templateManager';
import { WritingStylesConfig } from '../styles';

/**
 * Builds a prompt specifically for generating SEO Title, Meta Description, and Page Excerpt.
 * Automatically incorporates SEO writing style and customizable template rules.
 */
export function generateGiftGuideTitleMetaPrompt(
  options: GiftGuideTitleMetaOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const guideTitle = options.guideTitle.trim() || 'Curated Gift Guide';
  const recipient = options.recipient.trim() || 'The intended recipient';
  const primaryKw = options.primaryKeyword?.trim() || '';
  const secondaryKws = options.secondaryKeywords?.trim() || '';
  const searchIntent = options.searchIntent?.trim() || 'Commercial investigation & curated gift discovery';

  const primarySection = primaryKw
    ? `• Primary Focus Keyword: "${primaryKw}"`
    : '• Primary Focus Keyword: Focus on natural topical authority';

  const secondarySection = secondaryKws
    ? `• Secondary Keywords / Variations: ${secondaryKws}`
    : '• Secondary Keywords: Natural semantic variations';

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL INSTRUCTIONS:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeSeo: true },
    styles
  );

  const titleMetaTemplate = getTemplateSection('giftGuides', 'titleMeta');

  return `Gift Guide Title, Meta Description & Excerpt Prompt — Science of Gifts

${titleMetaTemplate}

GIFT GUIDE CONTEXT:
• Gift Guide Topic / Subject: "${guideTitle}"
• Target Recipient / Audience: ${recipient}
• Reader Search Intent: ${searchIntent}
${primarySection}
${secondarySection}
${additionalSection}
${styleSection}`;
}
