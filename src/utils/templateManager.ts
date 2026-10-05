import { GeneratorId, GeneratorTemplateConfig } from '../prompts/templates/types';
import {
  GENERATOR_TEMPLATES_CONFIG,
  DEFAULT_PHOTOGRAPHY_SECTIONS,
  DEFAULT_GIFT_GUIDES_SECTIONS,
  DEFAULT_ARTICLES_SECTIONS,
  DEFAULT_PRODUCT_COPY_SECTIONS,
  DEFAULT_PRODUCT_DATA_SECTIONS,
} from '../prompts/templates/defaults';

const STORAGE_KEY_PREFIX = 'scienceOfGifts_template_';
export const TEMPLATES_UPDATED_EVENT = 'scienceOfGifts_templates_updated';

function getStorageKey(generatorId: GeneratorId, sectionKey: string): string {
  return `${STORAGE_KEY_PREFIX}${generatorId}_${sectionKey}`;
}

/**
 * Retrieves the currently active template section string,
 * loading from localStorage if customized, or falling back to built-in default.
 */
export function getTemplateSection(generatorId: GeneratorId, sectionKey: string): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(getStorageKey(generatorId, sectionKey));
      if (saved !== null) {
        return saved;
      }
    } catch {
      // Safe fallback if localStorage is unavailable
    }
  }

  const config = GENERATOR_TEMPLATES_CONFIG[generatorId];
  if (config && config.sections[sectionKey] !== undefined) {
    return config.sections[sectionKey];
  }

  return '';
}

/**
 * Returns all active template sections for a given generator as a key-value record.
 */
export function getGeneratorSections(generatorId: GeneratorId): Record<string, string> {
  const config = GENERATOR_TEMPLATES_CONFIG[generatorId];
  if (!config) return {};

  const result: Record<string, string> = {};
  for (const key of Object.keys(config.sections)) {
    result[key] = getTemplateSection(generatorId, key);
  }
  return result;
}

/**
 * Checks if a specific section (or any section in a generator) has been modified by the user.
 */
export function isTemplateCustomized(generatorId: GeneratorId, sectionKey?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  const config = GENERATOR_TEMPLATES_CONFIG[generatorId];
  if (!config) return false;

  if (sectionKey) {
    try {
      return window.localStorage.getItem(getStorageKey(generatorId, sectionKey)) !== null;
    } catch {
      return false;
    }
  }

  // Check all sections in this generator
  for (const key of Object.keys(config.sections)) {
    try {
      if (window.localStorage.getItem(getStorageKey(generatorId, key)) !== null) {
        return true;
      }
    } catch {
      // Continue checking
    }
  }

  return false;
}

/**
 * Counts total customized sections across all generators.
 */
export function countCustomizedTemplates(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  let count = 0;
  const generatorIds: GeneratorId[] = [
    'photography',
    'giftGuides',
    'articles',
    'productCopy',
    'productData',
  ];

  for (const genId of generatorIds) {
    const config = GENERATOR_TEMPLATES_CONFIG[genId];
    if (config) {
      for (const sectionKey of Object.keys(config.sections)) {
        try {
          if (window.localStorage.getItem(getStorageKey(genId, sectionKey)) !== null) {
            count++;
          }
        } catch {
          // Continue
        }
      }
    }
  }

  return count;
}

/**
 * Saves a customized template section to localStorage.
 */
export function saveTemplateSection(
  generatorId: GeneratorId,
  sectionKey: string,
  content: string
): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(getStorageKey(generatorId, sectionKey), content);
      window.dispatchEvent(new Event(TEMPLATES_UPDATED_EVENT));
    } catch {
      // Ignore write errors
    }
  }
}

/**
 * Resets a single template section back to its built-in default by removing the localStorage key.
 */
export function resetTemplateSection(generatorId: GeneratorId, sectionKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(getStorageKey(generatorId, sectionKey));
      window.dispatchEvent(new Event(TEMPLATES_UPDATED_EVENT));
    } catch {
      // Ignore
    }
  }
}

/**
 * Resets all template sections for a given generator back to defaults.
 */
export function resetGeneratorTemplates(generatorId: GeneratorId): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const config = GENERATOR_TEMPLATES_CONFIG[generatorId];
    if (config) {
      for (const sectionKey of Object.keys(config.sections)) {
        try {
          window.localStorage.removeItem(getStorageKey(generatorId, sectionKey));
        } catch {
          // Ignore
        }
      }
      window.dispatchEvent(new Event(TEMPLATES_UPDATED_EVENT));
    }
  }
}

/**
 * Resets all templates across all 5 generators back to built-in defaults.
 */
export function resetAllTemplates(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const generatorIds: GeneratorId[] = [
      'photography',
      'giftGuides',
      'articles',
      'productCopy',
      'productData',
    ];

    for (const genId of generatorIds) {
      const config = GENERATOR_TEMPLATES_CONFIG[genId];
      if (config) {
        for (const sectionKey of Object.keys(config.sections)) {
          try {
            window.localStorage.removeItem(getStorageKey(genId, sectionKey));
          } catch {
            // Ignore
          }
        }
      }
    }
    window.dispatchEvent(new Event(TEMPLATES_UPDATED_EVENT));
  }
}

/**
 * Exports all customized templates as a JSON backup string.
 */
export function exportAllTemplatesAsJson(): string {
  const exportData: Record<string, Record<string, string>> = {};
  const generatorIds: GeneratorId[] = [
    'photography',
    'giftGuides',
    'articles',
    'productCopy',
    'productData',
  ];

  for (const genId of generatorIds) {
    exportData[genId] = getGeneratorSections(genId);
  }

  return JSON.stringify(
    {
      app: 'Science of Gifts Prompt Studio',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      templates: exportData,
    },
    null,
    2
  );
}

/**
 * Imports templates from a JSON string.
 */
export function importTemplatesFromJson(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.templates) {
      return { success: false, message: 'Invalid template backup format: missing templates object.' };
    }

    const generatorIds: GeneratorId[] = [
      'photography',
      'giftGuides',
      'articles',
      'productCopy',
      'productData',
    ];

    let importedCount = 0;
    for (const genId of generatorIds) {
      const genData = parsed.templates[genId];
      if (genData && typeof genData === 'object') {
        const config = GENERATOR_TEMPLATES_CONFIG[genId];
        if (config) {
          for (const [sectionKey, content] of Object.entries(genData)) {
            if (config.sections[sectionKey] !== undefined && typeof content === 'string') {
              saveTemplateSection(genId, sectionKey, content);
              importedCount++;
            }
          }
        }
      }
    }

    window.dispatchEvent(new Event(TEMPLATES_UPDATED_EVENT));
    return { success: true, message: `Successfully imported ${importedCount} template sections.` };
  } catch (err: any) {
    return { success: false, message: `Failed to parse JSON: ${err?.message || 'Unknown error'}` };
  }
}
