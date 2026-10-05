import { GiftGuideFaqOptions, GiftGuideTone } from './types';
import { composeWritingStyleBlocks } from '../../../utils/styleManager';
import { getTemplateSection } from '../../../utils/templateManager';
import { WritingStylesConfig } from '../styles';

function formatToneDescription(tone: GiftGuideTone): string {
  switch (tone) {
    case 'conversational-editorial':
      return 'Conversational Editorial — Smart, articulate, and friendly with natural phrasing.';
    case 'warm-helpful':
      return 'Warm & Helpful — Reassuring, empathetic, and attentive to buyer questions.';
    case 'witty-refined':
      return 'Witty but Refined — Sharp, clever, with subtle dry humor.';
    case 'practical':
      return 'Practical & Actionable — Clear, concise, and focused on logistics, sizing, and usability.';
    case 'informational':
      return 'Informational & Scholarly — Factual, authoritative, and educational.';
    default:
      return 'Helpful and concise.';
  }
}

/**
 * Builds a prompt specifically for generating the FAQ section of a gift guide.
 * Does NOT generate the entire gift guide.
 * Automatically incorporates Global + Editorial writing styles and customizable template rules.
 */
export function generateGiftGuideFaqPrompt(
  options: GiftGuideFaqOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const guideTitle = options.guideTitle.trim() || 'Curated Gift Guide';
  const recipient = options.recipient.trim() || 'The intended recipient';
  const count = options.numberOfQuestions || 4;
  const questionsToAnswer = options.questionsToAnswer?.trim() || '';
  const toneDesc = formatToneDescription(options.tone);

  const keywordSection = options.primaryKeyword?.trim()
    ? `• Primary Focus Keyword: "${options.primaryKeyword.trim()}" (Include naturally in 1–2 questions if organic; never force awkward query phrasing)`
    : '';

  const customQuestionsSection = questionsToAnswer
    ? `• Specific Questions / Topics to Address:
${questionsToAnswer.split('\n').map(q => `  - ${q}`).join('\n')}\n`
    : '• Question Sourcing: Formulate the most common, authentic questions real shoppers ask when choosing gifts for this recipient.\n';

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL CURATOR INSTRUCTIONS:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeGlobal: true, includeEditorial: true },
    styles
  );

  const faqTemplate = getTemplateSection('giftGuides', 'faq');
  const generalRules = getTemplateSection('giftGuides', 'generalWritingRules');

  return `Gift Guide FAQ Section Prompt — Science of Gifts

${faqTemplate}

PARENT GIFT GUIDE CONTEXT:
• Overall Guide Title / Topic: "${guideTitle}"
• Target Recipient / Audience: ${recipient}
${keywordSection}

FAQ PARAMETERS:
• Number of Questions to Answer: Exactly ${count} questions
${customQuestionsSection}• Voice & Tone: ${toneDesc}
${additionalSection}
${generalRules ? `\n${generalRules}\n` : ''}
${styleSection}`;
}
