import { DEFAULT_MERCHANDISE_PROFILES } from './productCatalog';
import { MerchandiseCategory, MerchandiseProductProfile } from './types';

export const D2P_PROFILES_STORAGE_KEY = 'scienceOfGifts_d2p_product_profiles_v1';
export const D2P_PROFILES_UPDATED_EVENT = 'scienceOfGifts_d2p_profiles_updated';

interface StoredProfilesDelta {
  overrides: Record<string, Partial<MerchandiseProductProfile>>;
  customProfiles: MerchandiseProductProfile[];
}

let memoryDelta: StoredProfilesDelta | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function emptyDelta(): StoredProfilesDelta {
  return { overrides: {}, customProfiles: [] };
}

function emitProfilesUpdated(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(D2P_PROFILES_UPDATED_EVENT));
  }
}

function sanitizeCategory(cat: unknown): MerchandiseCategory {
  if (
    cat === 'apparel' ||
    cat === 'drinkware' ||
    cat === 'paper-wall-art' ||
    cat === 'desk-accessories' ||
    cat === 'other'
  ) {
    return cat;
  }
  return 'other';
}

function loadDelta(): StoredProfilesDelta {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(D2P_PROFILES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredProfilesDelta>;
        const delta: StoredProfilesDelta = {
          overrides:
            parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {},
          customProfiles: Array.isArray(parsed.customProfiles)
            ? parsed.customProfiles.map((p) => ({
                ...p,
                category: sanitizeCategory(p.category),
                isCustom: true,
                isBuiltIn: false,
              }))
            : [],
        };
        memoryDelta = delta;
        return delta;
      }
    } catch {
      // Ignore corrupt storage and fall back safely
    }
  }

  return memoryDelta ?? emptyDelta();
}

function saveDelta(delta: StoredProfilesDelta): void {
  memoryDelta = {
    overrides: { ...delta.overrides },
    customProfiles: delta.customProfiles.map((p) => ({ ...p })),
  };

  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(D2P_PROFILES_STORAGE_KEY, JSON.stringify(memoryDelta));
    } catch {
      // Ignore storage quota errors
    }
  }

  emitProfilesUpdated();
}

function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Merges built-in defaults with user overrides + custom added profiles so default updates
 * never silently overwrite user-customized profile fields.
 */
export function getMerchandiseProfiles(): MerchandiseProductProfile[] {
  const delta = loadDelta();

  const mergedBuiltIns = DEFAULT_MERCHANDISE_PROFILES.map((base) => {
    const override = delta.overrides[base.id];
    if (!override) {
      return { ...base, supportedProductColors: [...base.supportedProductColors] };
    }
    return {
      ...base,
      ...override,
      id: base.id,
      isBuiltIn: true,
      supportedProductColors: Array.isArray(override.supportedProductColors)
        ? [...override.supportedProductColors]
        : [...base.supportedProductColors],
    };
  });

  const customList = delta.customProfiles.map((custom) => ({
    ...custom,
    isCustom: true,
    isBuiltIn: false,
    supportedProductColors: Array.isArray(custom.supportedProductColors)
      ? [...custom.supportedProductColors]
      : [],
  }));

  return [...mergedBuiltIns, ...customList];
}

export function getMerchandiseProfileById(id: string): MerchandiseProductProfile | undefined {
  return getMerchandiseProfiles().find((p) => p.id === id);
}

export function isMerchandiseProfileCustomized(id: string): boolean {
  const delta = loadDelta();
  return Boolean(delta.overrides[id]);
}

export function saveMerchandiseProfile(
  id: string,
  updates: Partial<MerchandiseProductProfile>
): { success: boolean; profile?: MerchandiseProductProfile; error?: string } {
  const delta = loadDelta();
  const builtIn = DEFAULT_MERCHANDISE_PROFILES.find((p) => p.id === id);

  if (builtIn) {
    const existingOverride = delta.overrides[id] || {};
    const merged: Partial<MerchandiseProductProfile> = {
      ...existingOverride,
      ...updates,
      id: builtIn.id,
      isBuiltIn: true,
    };
    if (typeof merged.name === 'string' && !merged.name.trim()) {
      return { success: false, error: 'Product name cannot be empty.' };
    }

    const nextDelta: StoredProfilesDelta = {
      ...delta,
      overrides: {
        ...delta.overrides,
        [id]: merged,
      },
    };
    saveDelta(nextDelta);
    return { success: true, profile: getMerchandiseProfileById(id) };
  }

  const customIdx = delta.customProfiles.findIndex((p) => p.id === id);
  if (customIdx === -1) {
    return { success: false, error: 'Product profile not found.' };
  }

  const existing = delta.customProfiles[customIdx];
  const nextName =
    updates.name !== undefined ? updates.name.trim() : existing.name;
  if (!nextName) {
    return { success: false, error: 'Product name cannot be empty.' };
  }

  const updatedProfile: MerchandiseProductProfile = {
    ...existing,
    ...updates,
    id: existing.id,
    name: nextName,
    isCustom: true,
    isBuiltIn: false,
  };

  const nextCustom = [...delta.customProfiles];
  nextCustom[customIdx] = updatedProfile;
  saveDelta({ ...delta, customProfiles: nextCustom });
  return { success: true, profile: updatedProfile };
}

export function addCustomMerchandiseProfile(
  input: Omit<MerchandiseProductProfile, 'id' | 'isBuiltIn' | 'isCustom'> & { id?: string }
): { success: boolean; profile?: MerchandiseProductProfile; error?: string } {
  const name = input.name.trim();
  if (!name) {
    return { success: false, error: 'Please enter a product name.' };
  }

  const allExisting = getMerchandiseProfiles();
  if (allExisting.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    return { success: false, error: `A product profile named "${name}" already exists.` };
  }

  let candidateId = (input.id ? slugifyId(input.id) : slugifyId(name)) || `product-${Date.now()}`;
  if (allExisting.some((p) => p.id === candidateId)) {
    candidateId = `${candidateId}-${Date.now().toString(36).slice(-4)}`;
  }

  const created: MerchandiseProductProfile = {
    id: candidateId,
    name,
    category: sanitizeCategory(input.category),
    typicalOrientation: input.typicalOrientation || 'flexible',
    preferredComposition:
      input.preferredComposition?.trim() ||
      'Balanced focal layout tailored to the product print region.',
    defaultBackgroundTreatment: input.defaultBackgroundTreatment || 'context-dependent',
    printSurfaceCharacteristics:
      input.printSurfaceCharacteristics?.trim() ||
      'Standard merchandise print surface (verify dimensions & finish before production).',
    supportedProductColors: Array.isArray(input.supportedProductColors)
      ? input.supportedProductColors
      : [],
    printingMethod:
      input.printingMethod?.trim() ||
      'Verify printing or decoration method against supplier product blank.',
    colorAndContrastConsiderations:
      input.colorAndContrastConsiderations?.trim() ||
      'Maintain strong figure-ground contrast relative to the selected product color.',
    recommendedDesignAdjustments:
      input.recommendedDesignAdjustments?.trim() ||
      'Preserve core typography and motifs cleanly inside safe print margins.',
    exactPrintSpecifications: input.exactPrintSpecifications?.trim() || '',
    additionalInstructions: input.additionalInstructions?.trim() || '',
    isBuiltIn: false,
    isCustom: true,
  };

  const delta = loadDelta();
  saveDelta({
    ...delta,
    customProfiles: [...delta.customProfiles, created],
  });

  return { success: true, profile: created };
}

export function resetBuiltInProfileOverride(id: string): boolean {
  const delta = loadDelta();
  if (!delta.overrides[id]) return false;
  const nextOverrides = { ...delta.overrides };
  delete nextOverrides[id];
  saveDelta({ ...delta, overrides: nextOverrides });
  return true;
}

export function deleteCustomMerchandiseProfile(id: string): boolean {
  const delta = loadDelta();
  const nextCustom = delta.customProfiles.filter((p) => p.id !== id);
  if (nextCustom.length === delta.customProfiles.length) return false;
  saveDelta({ ...delta, customProfiles: nextCustom });
  return true;
}

export function resetAllMerchandiseProfileCustomizations(): void {
  saveDelta(emptyDelta());
}

export function resetD2PProfileManagerForTests(): void {
  memoryDelta = null;
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(D2P_PROFILES_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
