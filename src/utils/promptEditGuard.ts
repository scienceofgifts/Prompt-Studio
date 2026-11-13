export interface DualPromptTextState {
  chatgptPrompt: string;
  geminiPrompt: string;
  manualEdits: {
    chatgpt: boolean;
    gemini: boolean;
  };
  pendingAutoPrompts: {
    chatgpt: string | null;
    gemini: string | null;
  };
}

/**
 * Safely applies newly generated ChatGPT & Gemini prompts while protecting
 * manually edited prompt channels from silent overwrites.
 */
export function resolveAutoPromptUpdate(
  current: DualPromptTextState,
  generated: { chatgpt: string; gemini: string }
): DualPromptTextState {
  const nextChatgpt = current.manualEdits.chatgpt
    ? current.chatgptPrompt
    : generated.chatgpt;
  const nextGemini = current.manualEdits.gemini
    ? current.geminiPrompt
    : generated.gemini;

  const nextPendingChatgpt =
    current.manualEdits.chatgpt && generated.chatgpt !== current.chatgptPrompt
      ? generated.chatgpt
      : current.manualEdits.chatgpt
      ? null
      : null;

  const nextPendingGemini =
    current.manualEdits.gemini && generated.gemini !== current.geminiPrompt
      ? generated.gemini
      : current.manualEdits.gemini
      ? null
      : null;

  return {
    chatgptPrompt: nextChatgpt,
    geminiPrompt: nextGemini,
    manualEdits: { ...current.manualEdits },
    pendingAutoPrompts: {
      chatgpt: nextPendingChatgpt,
      gemini: nextPendingGemini,
    },
  };
}
