export interface InternalLink {
  id: string;
  description: string;
  url: string;
}

/**
 * Formats the INTERNAL LINKS section for writing prompts when user provides links.
 * Returns empty string if links array is missing or contains no valid links.
 */
export function formatInternalLinksSection(links?: InternalLink[]): string {
  if (!links || links.length === 0) {
    return '';
  }

  const validLinks = links.filter(
    (l) => l.url.trim() !== '' || l.description.trim() !== ''
  );

  if (validLinks.length === 0) {
    return '';
  }

  const linksList = validLinks
    ? validLinks
        .map((l) => {
          const desc = l.description.trim();
          const url = l.url.trim();
          if (desc && url) {
            return `• ${desc}: ${url}`;
          }
          return `• ${url || desc}`;
        })
        .join('\n')
    : '';

  return `
INTERNAL LINKS:
Use the following Science of Gifts pages as potential internal links:
${linksList}

Look for genuine, contextually relevant opportunities to link to these pages within the content.

Links should be incorporated naturally into the prose rather than appended as a list or inserted simply because they were provided.

Use descriptive, contextually appropriate anchor text that accurately describes the destination page and fits naturally into the surrounding sentence.

The anchor text should be useful to readers and semantically relevant to the destination page. Avoid generic anchor text such as 'click here', 'read more', or 'this article' when a more descriptive phrase can be used.

Internal links should support the subject matter and information architecture of the content and should contribute naturally to SEO through relevant contextual anchor text.

Do not force a link into a sentence merely to use it.

Do not distort, awkwardly rewrite, or add unnecessary sentences just to accommodate a link.

If a supplied link is not genuinely relevant to the content being written, do not use it.

Do not use every supplied link automatically.

LINK FREQUENCY & ANCHOR TEXT RULES:
• A single supplied URL should normally be used no more than ONCE in the generated content.
• Only use the same URL a second time if there is a genuinely strong editorial reason and the second occurrence provides distinct value to the reader.
• Never repeatedly link the same URL throughout an article simply because it is available. Avoid redundant internal linking.
• Anchor text should be natural, descriptive, contextually relevant, concise, useful to the reader, and semantically aligned with the destination page.
• Do not force exact-match keywords into sentences when they sound unnatural. Use variations in wording where appropriate.
• Do not mechanically use the URL's page title as the anchor text every time.
• Prioritize writing quality and natural flow over link count. If only one supplied link is relevant, use only that one. If none are relevant, use none.
`;
}
