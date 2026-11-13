import { GeneratorId } from '../prompts/templates/types';
import { GENERATOR_TEMPLATES_CONFIG } from '../prompts/templates/defaults';

const STORAGE_KEY_PREFIX = 'scienceOfGifts_template_';
export const TEMPLATES_UPDATED_EVENT = 'scienceOfGifts_templates_updated';

const ACTIVE_GENERATOR_IDS: GeneratorId[] = ['photography', 'productCopy'];

function getStorageKey(generatorId: GeneratorId, sectionKey: string): string {
  return `${STORAGE_KEY_PREFIX}${generatorId}_${sectionKey}`;
}

/**
 * Detects legacy saved `websiteCropSafe` strings from earlier app versions that contain
 * obsolete square (1:1) to horizontal (4:3) crop-safe instructions.
 */
export function isLegacyObsoleteCropSafeTemplate(content: string): boolean {
  if (!content) return false;
  const mentionsObsolete43 = /4:3\s*(safe\s*zone|aspect\s*ratio|crop|horizontal\s*region)/i.test(
    content
  );
  const mentionsSquareOrLegacyHeader =
    /4:3 SAFE ZONE DIRECTIVE/i.test(content) ||
    /square\s*\(1:1\)|1:1\s*frame|original\s*square\s*frame/i.test(content);
  return mentionsObsolete43 && mentionsSquareOrLegacyHeader;
}

/**
 * Retrieves the currently active template section string,
 * loading from localStorage if customized, or falling back to built-in default.
 * Automatically ignores/upgrades obsolete legacy 4:3 websiteCropSafe entries without
 * touching genuine user customizations.
 */
export function getTemplateSection(generatorId: GeneratorId, sectionKey: string): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storageKey = getStorageKey(generatorId, sectionKey);
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null) {
        if (
          generatorId === 'photography' &&
          sectionKey === 'websiteCropSafe' &&
          isLegacyObsoleteCropSafeTemplate(saved)
        ) {
          window.localStorage.removeItem(storageKey);
        } else {
          return saved;
        }
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

function hasNonLegacyCustomization(generatorId: GeneratorId, sectionKey: string): boolean {
  try {
    const saved = window.localStorage.getItem(getStorageKey(generatorId, sectionKey));
    if (saved === null) return false;
    if (
      generatorId === 'photography' &&
      sectionKey === 'websiteCropSafe' &&
      isLegacyObsoleteCropSafeTemplate(saved)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a specific section (or any section in a generator) has been modified by the user.
 */
export function isTemplateCustomized(generatorId: GeneratorId, sectionKey?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  const config = GENERATOR_TEMPLATES_CONFIG[generatorId];
  if (!config) return false;

  if (sectionKey) {
    return hasNonLegacyCustomization(generatorId, sectionKey);
  }

  for (const key of Object.keys(config.sections)) {
    if (hasNonLegacyCustomization(generatorId, key)) {
      return true;
    }
  }

  return false;
}

/**
 * Counts total customized sections across all retained generators.
 */
export function countCustomizedTemplates(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  let count = 0;

  for (const genId of ACTIVE_GENERATOR_IDS) {
    const config = GENERATOR_TEMPLATES_CONFIG[genId];
    if (config) {
      for (const sectionKey of Object.keys(config.sections)) {
        if (hasNonLegacyCustomization(genId, sectionKey)) {
          count++;
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
 * Resets all templates across the retained generators back to built-in defaults.
 */
export function resetAllTemplates(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    for (const genId of ACTIVE_GENERATOR_IDS) {
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

  for (const genId of ACTIVE_GENERATOR_IDS) {
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

    let importedCount = 0;
    for (const genId of ACTIVE_GENERATOR_IDS) {
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
