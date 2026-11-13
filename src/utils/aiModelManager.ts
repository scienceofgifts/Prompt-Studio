export interface AiModelConfig {
  id: string;
  label: string;
  enabled: boolean;
  notes?: string;
}

export interface LastRecognitionModelRecord {
  modelId: string;
  timestamp: number;
  attemptedModels?: string[];
  fromCache?: boolean;
}

export const AI_MODELS_STORAGE_KEY = 'scienceOfGifts_ai_models_config';
export const LAST_RECOGNITION_MODEL_KEY = 'scienceOfGifts_last_recognition_model';
export const AI_MODELS_UPDATED_EVENT = 'scienceOfGifts_ai_models_updated';

export const DEFAULT_AI_MODELS: AiModelConfig[] = [
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen',
    enabled: true,
    notes: 'Primary high-speed multimodal recognition model',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    enabled: true,
    notes: 'Secondary balanced multimodal fallback',
  },
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    enabled: true,
    notes: 'Third-tier multimodal fallback',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    enabled: true,
    notes: 'Lightweight high-throughput fallback',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    enabled: true,
    notes: 'Final lightweight fallback',
  },
];

export const DEFAULT_AI_MODEL_IDS: string[] = DEFAULT_AI_MODELS.map((m) => m.id);

let memoryModelsCache: AiModelConfig[] | null = null;
let memoryLastRecognitionCache: LastRecognitionModelRecord | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function cloneModels(models: AiModelConfig[]): AiModelConfig[] {
  return models.map((m) => ({ ...m }));
}

function emitAiModelsUpdated(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(AI_MODELS_UPDATED_EVENT));
  }
}

function normalizeModelId(id: string): string {
  return id.trim();
}

function sanitizeModelsList(raw: unknown): AiModelConfig[] {
  if (!Array.isArray(raw)) {
    return cloneModels(DEFAULT_AI_MODELS);
  }

  const seen = new Set<string>();
  const cleaned: AiModelConfig[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<AiModelConfig>;
    const id = typeof candidate.id === 'string' ? normalizeModelId(candidate.id) : '';
    if (!id || seen.has(id.toLowerCase())) continue;
    seen.add(id.toLowerCase());

    const defaultMeta = DEFAULT_AI_MODELS.find((d) => d.id === id);
    const label =
      typeof candidate.label === 'string' && candidate.label.trim()
        ? candidate.label.trim()
        : defaultMeta?.label || id;

    cleaned.push({
      id,
      label,
      enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : true,
      notes:
        typeof candidate.notes === 'string' && candidate.notes.trim()
          ? candidate.notes.trim()
          : defaultMeta?.notes,
    });
  }

  return cleaned.length > 0 ? cleaned : cloneModels(DEFAULT_AI_MODELS);
}

export function getAiModels(): AiModelConfig[] {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(AI_MODELS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const sanitized = sanitizeModelsList(parsed);
        memoryModelsCache = sanitized;
        return cloneModels(sanitized);
      }
    } catch {
      // Fallback to defaults if localStorage JSON is malformed
    }
  }

  if (memoryModelsCache) {
    return cloneModels(memoryModelsCache);
  }

  return cloneModels(DEFAULT_AI_MODELS);
}

export function saveAiModels(models: AiModelConfig[]): AiModelConfig[] {
  const sanitized = sanitizeModelsList(models);
  memoryModelsCache = cloneModels(sanitized);

  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(AI_MODELS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Ignore storage quota errors
    }
  }

  emitAiModelsUpdated();
  return cloneModels(sanitized);
}

export function getEnabledModelIds(): string[] {
  return getAiModels()
    .filter((m) => m.enabled)
    .map((m) => m.id);
}

export function moveAiModel(index: number, direction: 'up' | 'down'): AiModelConfig[] {
  const models = getAiModels();
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= models.length || targetIndex < 0 || targetIndex >= models.length) {
    return models;
  }

  const next = [...models];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return saveAiModels(next);
}

export function toggleAiModel(index: number): {
  success: boolean;
  models: AiModelConfig[];
  error?: string;
} {
  const models = getAiModels();
  if (index < 0 || index >= models.length) {
    return { success: false, models, error: 'Model entry not found.' };
  }

  const next = models.map((m, idx) => (idx === index ? { ...m, enabled: !m.enabled } : m));
  const saved = saveAiModels(next);
  return { success: true, models: saved };
}

export function addAiModel(
  modelId: string,
  label?: string
): { success: boolean; models: AiModelConfig[]; error?: string } {
  const cleanId = normalizeModelId(modelId);
  if (!cleanId) {
    return { success: false, models: getAiModels(), error: 'Please enter a valid Gemini model ID.' };
  }

  if (/\s/.test(cleanId)) {
    return {
      success: false,
      models: getAiModels(),
      error: 'Model ID cannot contain spaces (example: gemini-3.8-flash).',
    };
  }

  const models = getAiModels();
  if (models.some((m) => m.id.toLowerCase() === cleanId.toLowerCase())) {
    return {
      success: false,
      models,
      error: `Model "${cleanId}" is already in the fallback list.`,
    };
  }

  const cleanLabel = label && label.trim() ? label.trim() : cleanId;
  const saved = saveAiModels([
    ...models,
    {
      id: cleanId,
      label: cleanLabel,
      enabled: true,
      notes: 'Custom configured model',
    },
  ]);

  return { success: true, models: saved };
}

export function updateAiModel(
  index: number,
  updates: { id?: string; label?: string }
): { success: boolean; models: AiModelConfig[]; error?: string } {
  const models = getAiModels();
  if (index < 0 || index >= models.length) {
    return { success: false, models, error: 'Model entry not found.' };
  }

  const existing = models[index];
  const nextId = updates.id !== undefined ? normalizeModelId(updates.id) : existing.id;
  if (!nextId) {
    return { success: false, models, error: 'Model ID cannot be empty.' };
  }
  if (/\s/.test(nextId)) {
    return { success: false, models, error: 'Model ID cannot contain spaces.' };
  }

  const duplicateIdx = models.findIndex(
    (m, idx) => idx !== index && m.id.toLowerCase() === nextId.toLowerCase()
  );
  if (duplicateIdx !== -1) {
    return {
      success: false,
      models,
      error: `Another entry already uses model ID "${nextId}".`,
    };
  }

  const nextLabel =
    updates.label !== undefined
      ? updates.label.trim() || nextId
      : existing.label;

  const next = models.map((m, idx) =>
    idx === index
      ? {
          ...m,
          id: nextId,
          label: nextLabel,
        }
      : m
  );

  return { success: true, models: saveAiModels(next) };
}

export function removeAiModel(index: number): {
  success: boolean;
  models: AiModelConfig[];
  error?: string;
} {
  const models = getAiModels();
  if (index < 0 || index >= models.length) {
    return { success: false, models, error: 'Model entry not found.' };
  }

  if (models.length <= 1) {
    return {
      success: false,
      models,
      error: 'At least one model entry must remain in the list. Disable it instead if needed.',
    };
  }

  const next = models.filter((_, idx) => idx !== index);
  return { success: true, models: saveAiModels(next) };
}

export function restoreDefaultAiModels(): AiModelConfig[] {
  const defaults = cloneModels(DEFAULT_AI_MODELS);
  memoryModelsCache = cloneModels(defaults);

  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(AI_MODELS_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  emitAiModelsUpdated();
  return defaults;
}

export function getLastRecognitionModel(): LastRecognitionModelRecord | null {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(LAST_RECOGNITION_MODEL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LastRecognitionModelRecord>;
        if (typeof parsed.modelId === 'string' && parsed.modelId.trim()) {
          const record: LastRecognitionModelRecord = {
            modelId: parsed.modelId.trim(),
            timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
            attemptedModels: Array.isArray(parsed.attemptedModels)
              ? parsed.attemptedModels.filter((item): item is string => typeof item === 'string')
              : undefined,
            fromCache: typeof parsed.fromCache === 'boolean' ? parsed.fromCache : undefined,
          };
          memoryLastRecognitionCache = record;
          return record;
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }

  return memoryLastRecognitionCache ? { ...memoryLastRecognitionCache } : null;
}

export function setLastRecognitionModel(record: LastRecognitionModelRecord): void {
  const cleanRecord: LastRecognitionModelRecord = {
    modelId: record.modelId.trim(),
    timestamp: record.timestamp || Date.now(),
    attemptedModels: record.attemptedModels,
    fromCache: record.fromCache,
  };
  memoryLastRecognitionCache = cleanRecord;

  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(LAST_RECOGNITION_MODEL_KEY, JSON.stringify(cleanRecord));
    } catch {
      // Ignore storage quota errors
    }
  }

  emitAiModelsUpdated();
}

export function resetAiModelManagerForTests(): void {
  memoryModelsCache = null;
  memoryLastRecognitionCache = null;
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(AI_MODELS_STORAGE_KEY);
      window.localStorage.removeItem(LAST_RECOGNITION_MODEL_KEY);
    } catch {
      // Ignore
    }
  }
}
