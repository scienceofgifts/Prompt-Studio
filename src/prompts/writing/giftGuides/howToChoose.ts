import { GiftGuideHowToChooseOptions, GiftGuideTone } from './types';
import { composeWritingStyleBlocks } from '../../../utils/styleManager';
import { getTemplateSection } from '../../../utils/templateManager';
import { WritingStylesConfig } from '../styles';

function formatToneDescription(tone: GiftGuideTone): string {
  switch (tone) {
    case 'conversational-editorial':
      return 'Conversational Editorial — Smart, thoughtful advice delivered with warmth, clarity, and real-world empathy.';
    case 'warm-helpful':
      return 'Warm & Helpful — Reassuring, supportive, and practical, easing decision anxiety for the gift-giver.';
    case 'witty-refined':
      return 'Witty but Refined — Sharp, clever insights with good humor about shopping dilemmas.';
    case 'practical':
      return 'Practical & Actionable — Clear criteria, decision checklists, and concrete dos and don’ts.';
    case 'informational':
      return 'Informational & Scholarly — Grounded in craftsmanship nuances, material standards, and connoisseur details.';
    default:
      return 'Editorial and helpful.';
  }
}

function formatLengthDirective(length: 'concise' | 'standard' | 'comprehensive'): string {
  switch (length) {
    case 'concise':
      return 'Concise (3 key guidelines, ~120–150 words) — Quick, punchy rules of thumb.';
    case 'standard':
      return 'Standard (4–5 structured points, ~200–300 words) — Balanced advice covering taste, utility, and common pitfalls.';
    case 'comprehensive':
      return 'Comprehensive Guide (~350–450 words) — In-depth breakdown with concrete scenarios, questions to ask yourself, and presentation tips.';
    default:
      return 'Standard (4–5 structured points).';
  }
}

/**
 * Builds a prompt specifically for generating the "How to Choose the Right Gift" advice section.
 * Does NOT generate the entire gift guide.
 * Automatically incorporates Global + Editorial writing styles and customizable template rules.
 */
export function generateGiftGuideHowToChoosePrompt(
  options: GiftGuideHowToChooseOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const guideTitle = options.guideTitle.trim() || 'Curated Gift Guide';
  const recipient = options.recipient.trim() || 'The intended recipient';
  const considerations = options.importantConsiderations.trim() || 'Quality of materials, level of interest/expertise, display space, and personal aesthetics';
  const toneDesc = formatToneDescription(options.tone);
  const lengthDesc = formatLengthDirective(options.desiredLength);

  const keywordSection = options.primaryKeyword?.trim()
    ? `• Target Keyword: "${options.primaryKeyword.trim()}" (Weave naturally into advice if organic)`
    : '';

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL CURATOR INSTRUCTIONS:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeGlobal: true, includeEditorial: true },
    styles
  );

  const howToChooseTemplate = getTemplateSection('giftGuides', 'howToChoose');
  const generalRules = getTemplateSection('giftGuides', 'generalWritingRules');

  return `Gift Guide "How to Choose the Right Gift" Section Prompt — Science of Gifts

${howToChooseTemplate}

PARENT GIFT GUIDE CONTEXT:
• Overall Guide Title / Topic: "${guideTitle}"
• Target Recipient / Audience: ${recipient}
${keywordSection}

BUYER GUIDANCE SPECIFICATIONS:
• Core Considerations to Address:
${considerations.split('\n').map(c => `  - ${c}`).join('\n')}
• Tone of Voice: ${toneDesc}
• Desired Length: ${lengthDesc}
${additionalSection}
${generalRules ? `\n${generalRules}\n` : ''}
${styleSection}`;
}
