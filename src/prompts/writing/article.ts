import {
  ArticleOptions,
  ArticleType,
  ArticleTone,
  ArticleSearchIntent,
} from './types';
import { composeWritingStyleBlocks } from '../../utils/styleManager';
import { WritingStylesConfig } from './styles';
import { formatInternalLinksSection } from '../../utils/internalLinks';

function formatArticleTypeDescription(type: ArticleType): string {
  switch (type) {
    case 'informational':
      return 'Informational Deep Dive — Illuminating historical context, scientific wonder, design craftsmanship, or cultural origins behind meaningful objects and traditions.';
    case 'how-to':
      return 'Actionable How-To Guide — Clear, sequential, beautifully explained steps helping the reader master a gifting ritual, design choice, or thoughtful curation practice.';
    case 'explainer':
      return 'Analytical Explainer — Demystifying a complex or subtle topic (e.g., the science of gratitude, the psychology of gift selection, or how celestial mechanics inspired horology).';
    case 'advice':
      return 'Empathetic Editorial Advice — Thoughtful guidance offering nuanced perspectives on difficult or sensitive gifting dilemmas without condescension.';
    case 'etiquette':
      return 'Modern Gifting Etiquette — Refined, contemporary social guidelines on hosting, recipient reciprocity, milestone recognition, and thank-you customs.';
    case 'problem-solving':
      return 'Problem-Solving Feature — Direct solutions for persistent reader pain points (e.g., long-distance gifting, navigating taste differences, avoiding consumerist waste).';
    default:
      return 'In-depth editorial article.';
  }
}

function formatSearchIntent(intent: ArticleSearchIntent): string {
  switch (intent) {
    case 'informational':
      return 'Informational — Reader is seeking clear answers, deep understanding, and educational insight.';
    case 'commercial-investigation':
      return 'Commercial Investigation — Reader is comparing options, seeking curated recommendations, and making informed buying decisions.';
    case 'how-to-guide':
      return 'Action-Oriented How-To — Reader wants a practical methodology to execute a specific task smoothly.';
    case 'inspiration-ideas':
      return 'Creative Inspiration — Reader is browsing for fresh angles, unexpected perspectives, and aesthetic joy.';
    default:
      return 'Engaged editorial search.';
  }
}

// ==========================================
// 1. RESEARCH SECTION PROMPTS
// ==========================================

/**
 * Generates prompt for exploring 5 strong editorial angles for a topic.
 */
export function generateArticleResearchAnglesPrompt(topic: string): string {
  const t = topic.trim() || 'The Architecture of Memory: Why Physical Keepsakes Matter in a Digital Age';
  return `Editorial Article Research: Angles Prompt — Science of Gifts

TOPIC:
${t}

DIRECTIVE:
Give me 5 strong angles for an article on this topic.

Avoid generic advice or cliché listicle ideas. Focus on genuine insights, counterintuitive observations, historical/scientific context, and cultural depth.

For each of the 5 angles, provide:
1. Proposed Working Headline / Title
2. Core Editorial Thesis (1–2 sentences summarizing the unique perspective)
3. Key Insight / Observation that makes this angle memorable and valuable to readers`;
}

/**
 * Generates prompt for creating a loose narrative outline from a chosen angle.
 */
export function generateArticleResearchOutlinePrompt(angleOrTopic: string): string {
  const input = angleOrTopic.trim() || 'Exploring why physical objects hold deeper emotional memory than digital media';
  return `Editorial Article Research: Narrative Outline Prompt — Science of Gifts

SELECTED ANGLE / EDITORIAL THESIS:
${input}

DIRECTIVE:
Create a loose narrative flow for this angle.

Do not make it rigid or list-based.

Focus on the natural progression of ideas:
• Opening Hook & Vignette (evocative entry point, historical snippet, or observation)
• Core Thesis & Stakes (why this matters now)
• Narrative Progression (3–4 organic thematic movements building upon each other)
• Synthesis & Conclusion (uplifting final reflection)

Emphasize fluid narrative movement over mechanical numbered section outlines.`;
}

// ==========================================
// 2. WRITING SECTION PROMPT
// ==========================================

/**
 * Builds the complete prompt for generating a rich, non-generic Article.
 * Supports optional Angle, optional Outline, and optional Internal Links.
 * Automatically incorporates Global + Editorial writing styles.
 */
export function generateArticlePrompt(
  options: ArticleOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const topic = options.topic.trim() || 'The Lost Art of Intentional Gift Giving';
  const reader = options.intendedReader.trim() || 'Curious, culture-conscious readers interested in history, science, and meaningful design';
  const primaryKw = options.primaryKeyword.trim() ? `• Primary Keyword: "${options.primaryKeyword.trim()}" (Include in H1, early in the introduction, and naturally across 1-2 H2s)` : '• Primary Keyword: Focused on organic topical authority';
  const secondaryKws = options.secondaryKeywords.trim() ? `• Secondary Keywords: ${options.secondaryKeywords.trim()} (Weave seamlessly into body copy)` : '• Secondary Keywords: Rich semantic vocabulary';
  const typeDesc = formatArticleTypeDescription(options.articleType);
  const intentDesc = formatSearchIntent(options.searchIntent);

  const angleSection = options.articleAngle?.trim()
    ? `\nSELECTED EDITORIAL ANGLE:\n${options.articleAngle.trim()}\n(Develop this chosen angle as the primary thesis of the article rather than drifting into generic topic coverage.)\n`
    : '';

  const outlineSection = options.articleOutline?.trim()
    ? `\nLOOSE NARRATIVE OUTLINE / PROGRESSION OF IDEAS:\n${options.articleOutline.trim()}\n(Use this outline as a loose narrative guide for the progression of ideas. Do NOT treat it as a rigid template to reproduce mechanically. The outline guides the flow, not the layout.)\n`
    : '';

  const internalLinksSection = formatInternalLinksSection(options.internalLinks);

  const additionalSection = options.additionalInstructions?.trim()
    ? `\nADDITIONAL EDITORIAL INSTRUCTIONS:\n${options.additionalInstructions.trim()}\n`
    : '';

  const styleSection = composeWritingStyleBlocks(
    { includeGlobal: true, includeEditorial: true },
    styles
  );

  return `Long-Form Editorial Article Prompt — Science of Gifts

ROLE & OBJECTIVE:
Act as an acclaimed magazine journalist and essayist writing for "Science of Gifts". Your mission is to write a deeply researched, engaging, and memorable feature article on the requested topic.

The piece must read like a thoughtful piece in The Atlantic, The New Yorker, or Kinfolk—rich with genuine insight, lucid prose, and zero boilerplate SEO filler.

ARTICLE BRIEF:
• Article Topic: ${topic}
• Intended Reader: ${reader}
• Format / Article Type: ${typeDesc}
• Target Search Intent: ${intentDesc}
• Tone of Voice: ${options.tone}
${primaryKw}
${secondaryKws}
${angleSection}${outlineSection}
CRITICAL EDITORIAL PRINCIPLE:
The angle and outline supplied above are editorial guidance for your writing process. Do NOT quote, mention, or reference the existence of the prompt, angle-selection process, or outline structure within the finished article. Do not reproduce the outline as a list unless explicitly requested. The final article must read as a seamless, organic work of magazine prose.

REQUIRED EDITORIAL ARCHITECTURE:
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
   - Synthesize the core ideas without merely summarizing what was already said.
   - Leave the reader with an uplifting, contemplative perspective on mindfulness, appreciation, and human connection.
${internalLinksSection}${additionalSection}
${styleSection}
OUTPUT FORMAT:
Return the full completed article in clean, beautifully structured Markdown with proper headings, italicized emphasis, and blockquotes for pullouts.`;
}

// ==========================================
// 3. EDITING SECTION PROMPTS
// ==========================================

/**
 * Generates prompt for making an existing article feel more human and less structured.
 */
export function generateArticleEditingBasePrompt(draftText: string): string {
  const draft = draftText.trim() || '[Paste your draft article text here]';
  return `Editorial Article Editing: Humanize & Unstructure Prompt — Science of Gifts

OBJECTIVE:
Rewrite the draft article below to feel more human and less structured.

DRAFT ARTICLE CONTENT:
${draft}

EDITING DIRECTIVES:
• Rewrite this to feel more human and less structured.
• Vary sentence lengths and rhythm naturally—mix short, punchy statements with rhythmic, complex observations.
• Add slight imperfections in prose rhythm—natural variations in phrasing and sentence cadence that reflect a real human essayist's distinct voice.
• Remove anything that feels generic, templated, or mechanically structured (e.g. formulaic transitions, repetitive summary paragraphs, or AI-sounding list formatting).
• Improve flow and conceptual momentum between ideas so transitions feel effortless.
• Do NOT make the writing artificially casual or introduce grammatical mistakes or typos. Maintain sophisticated, publication-grade editorial quality.`;
}

/**
 * Generates prompt for tightening an article for clarity and precision without losing personality.
 */
export function generateArticleEditingTightenPrompt(draftText: string): string {
  const draft = draftText.trim() || '[Paste your draft article text here]';
  return `Editorial Article Editing: Tighten & Refine Prompt — Science of Gifts

OBJECTIVE:
Tighten and refine the draft article below for maximum precision and clarity.

DRAFT ARTICLE CONTENT:
${draft}

EDITING DIRECTIVES:
• Tighten this article.
• Remove fluff, unnecessary filler, and redundant phrasing.
• Make sentences more precise, impactful, and clear.
• Improve clarity without losing the writer's personality, warmth, or intellectual nuance.
• Do not flatten the author's voice or turn the piece into generic, clipped SEO copy. Every sentence should remain engaging and well-crafted.`;
}

/**
 * Dispatcher function for the Article Workflow tabs.
 */
export function generateArticleWorkflowPrompt(
  options: ArticleOptions,
  styles?: Partial<WritingStylesConfig>
): string {
  const tab = options.activeWorkflowTab || 'writing-article';

  switch (tab) {
    case 'research-angles':
      return generateArticleResearchAnglesPrompt(options.topic);

    case 'research-outline':
      return generateArticleResearchOutlinePrompt(
        options.researchAngleInput || options.articleAngle || options.topic
      );

    case 'writing-article':
      return generateArticlePrompt(options, styles);

    case 'editing-humanize':
      return generateArticleEditingBasePrompt(options.draftToEdit || '');

    case 'editing-tighten':
      return generateArticleEditingTightenPrompt(options.draftToEdit || '');

    default:
      return generateArticlePrompt(options, styles);
  }
}

