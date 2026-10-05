import {
  ProductCopyOptions,
  ProductCopyTone,
} from './types';
import { composeWritingStyleBlocks } from '../../utils/styleManager';
import { getTemplateSection } from '../../utils/templateManager';
import { WritingStylesConfig } from './styles';

function formatProductCopyTone(tone: ProductCopyTone): string {
  switch (tone) {
    case 'sophisticated-editorial':
      return 'Sophisticated Editorial — Poetic, tactile, and intellectually grounded. Emphasizes material craftsmanship, quiet luxury, and understated distinction.';
    case 'warm-approachable':
      return 'Warm and Approachable — Inviting, conversational, and genuine. Feels like a personal recommendation from a discerning shopkeeper who loves the object.';
    case 'playfully-cerebral':
      return 'Playfully Cerebral — Witty, smart, and scientifically curious. Weaves in clever physics, astronomy, or mathematical easter eggs with a charming light touch.';
    case 'minimalist-luxury':
      return 'Minimalist Luxury — Sparse, confident, and direct. Focuses purely on form, materials, function, and enduring elegance without unnecessary adjectives.';
    case 'practical-informative':
      return 'Practical & Informative — Clear specs, real-world utility, dimensions, durability, and daily rituals.';
    default:
      return 'Polished boutique product copy.';
  }
}

/**
 * Builds the complete prompt for writing high-converting, publication-grade Product Page Copy.
 * Automatically incorporates Global + Copy writing styles and customizable template rules.
 */
export function generateProductCopyPrompt(
  options: ProductCopyOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const name = options.productName.trim() || 'Sidereus Nuncius Celestial Hardcover Notebook';
  const type = options.productType.trim() || 'Archival Stationery / Journal';
  const customer = options.targetCustomer.trim() || 'Stargazers, historians, writers, and thoughtful gift seekers';
  const concept = options.productConcept.trim() || 'Inspired by Galileo Galilei’s 1610 astronomical sketches of the lunar surface and Jupiter’s moons';
  const features = options.keyFeatures.trim() || '160 pages of 120 GSM fountain pen-friendly paper, debossed gold foil constellation map, silk ribbon bookmark, lay-flat thread binding, elastic closure';
  const toneDesc = formatProductCopyTone(options.tone);

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL PRODUCT BRIEFING:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeGlobal: true, includeCopy: true },
    styles
  );

  const roleAndObjective = getTemplateSection('productCopy', 'roleAndObjective');
  const requiredDeliverables = getTemplateSection('productCopy', 'requiredDeliverables');
  const outputFormat = getTemplateSection('productCopy', 'outputFormat');

  return `E-Commerce Editorial Product Copy Prompt — Science of Gifts

${roleAndObjective}

PRODUCT BRIEF:
• Product Name: ${name}
• Product Type / Category: ${type}
• Target Customer / Recipient: ${customer}
• Conceptual Foundation / Narrative: ${concept}
• Materials & Key Features:
${features.split('\n').map(f => `  - ${f}`).join('\n')}
• Brand Voice & Tone: ${toneDesc}

${requiredDeliverables}
${additionalSection}
${styleSection}
${outputFormat}`;
}
