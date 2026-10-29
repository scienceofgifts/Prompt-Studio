import { ProductCopyOptions, ProductProfile } from '../prompts/writing/types';

export const PRODUCT_TYPES_STORAGE_KEY = 'scienceOfGifts_product_types_v1';
export const PRODUCT_PROFILES_STORAGE_KEY = 'scienceOfGifts_product_profiles_v1';

export const PRODUCT_TYPES_UPDATED_EVENT = 'scienceOfGifts_product_types_updated';
export const PRODUCT_PROFILES_UPDATED_EVENT = 'scienceOfGifts_product_profiles_updated';

/**
 * Default product types preserving the project's existing product categories
 * plus common Fourthwall / e-commerce gift shop merchandise types.
 */
export const DEFAULT_PRODUCT_TYPES: string[] = [
  'T-shirt',
  'Hoodie',
  'Sweatshirt',
  'Mug',
  'Glass',
  'Water Bottle',
  'Tumbler',
  'Tote Bag',
  'Poster',
  'Notebook',
  'Archival Stationery / Hardcover Notebook',
  'Laptop Sleeve',
  'Mouse Pad',
  'Desk Mat',
  'Phone Case',
];

/**
 * Built-in starter profiles for Fourthwall / Science of Gifts products.
 * Used as initial seed when localStorage has no saved profiles yet.
 */
export const DEFAULT_PRODUCT_PROFILES: ProductProfile[] = [
  {
    id: 'profile-standard-pullover-hoodie',
    name: 'Standard Pullover Hoodie',
    productType: 'Hoodie',
    productConcept:
      'Original Science of Gifts graphic edition celebrating historical scientific instruments and astronomical diagrams.',
    keyFeatures:
      'Double-lined hood with color-matched drawcord\nFront pouch kangaroo pocket\n1x1 athletic rib-knit cuffs and waistband with spandex\nDouble-needle stitching at shoulder, armhole, neck, waistband, and cuffs\nTear-away neck label for zero-itch comfort',
    materials:
      '8.0 oz/yd² (271 g/m²), 50% US cotton / 50% polyester pill-resistant air-jet spun fleece',
    dimensions:
      'Unisex classic fit • Sizes S–3XL (Chest width: S 20", M 22", L 24", XL 26", 2XL 28", 3XL 30")',
    updatedAt: '2026-10-29T00:00:00.000Z',
  },
  {
    id: 'profile-classic-unisex-tee',
    name: 'Classic Unisex Graphic Tee',
    productType: 'T-shirt',
    productConcept:
      'Finely detailed archival scientific illustration screen-printed on soft everyday combed cotton.',
    keyFeatures:
      'Ribbed crewneck collar that holds its shape\nTaped neck and shoulders for comfort and durability\nSide-seamed construction for a tailored retail drape\nCrisp DTG / screen-printed front graphic with soft hand feel',
    materials:
      '4.2 oz/yd² (142 g/m²), 100% Airlume combed and ring-spun cotton (32 singles)',
    dimensions:
      'Unisex retail fit • Sizes XS–4XL (Body length: S 28", M 29", L 30", XL 31", 2XL 32")',
    updatedAt: '2026-10-29T00:00:00.000Z',
  },
  {
    id: 'profile-crewneck-sweatshirt',
    name: 'Heavyweight Crewneck Sweatshirt',
    productType: 'Sweatshirt',
    productConcept:
      'Cozy, structured studio crewneck pairing scholarly graphic heritage with everyday warmth.',
    keyFeatures:
      'Classic crewneck collar with 1x1 ribbed cuffs and bottom hem\nSoft brushed fleece interior\nQuarter-turned body to eliminate center crease\nDouble-needle stitched collar, shoulders, and armholes',
    materials:
      '8.0 oz/yd² (271 g/m²), 50% pre-shrunk cotton / 50% polyester medium-heavy fleece',
    dimensions:
      'Unisex relaxed fit • Sizes S–3XL (Chest width: S 20", M 22", L 24", XL 26", 2XL 28")',
    updatedAt: '2026-10-29T00:00:00.000Z',
  },
  {
    id: 'profile-ceramic-mug-15oz',
    name: '15oz Ceramic Coffee Mug',
    productType: 'Mug',
    productConcept:
      'Wrap-around scientific diagram fired in crisp high-contrast enamel on glossy white ceramic.',
    keyFeatures:
      'Ergonomic C-shaped easy-grip handle\nHigh-definition wrap-around sublimated artwork\nLead- and BPA-free food-safe glaze\nMicrowave and top-rack dishwasher safe',
    materials: '100% durable high-fired white glossy ceramic',
    dimensions: '15 oz (443 ml) capacity • Height: 4.69" (11.9 cm) • Diameter: 3.35" (8.5 cm)',
    updatedAt: '2026-10-29T00:00:00.000Z',
  },
  {
    id: 'profile-archival-hardcover-journal',
    name: 'Archival Hardcover Journal',
    productType: 'Archival Stationery / Hardcover Notebook',
    productConcept:
      'Inspired by Galileo Galilei’s 1610 Sidereus Nuncius telescopic sketches of lunar craters and Jovian satellites.',
    keyFeatures:
      '160 pages of fountain pen-friendly archival paper\nDebossed metallic gold foil cover chart\nSilk ribbon page marker & elastic closure band\nLay-flat Smyth-sewn binding',
    materials:
      '120 GSM acid-free ivory cotton-blend paper • Woven linen bookcloth hardcover',
    dimensions: '5.5 × 8.25 inches (A5 portrait) • 0.65 inch spine thickness',
    updatedAt: '2026-10-29T00:00:00.000Z',
  },
];

// In-memory fallback stores for non-browser environments (e.g. Node unit tests)
let memoryProductTypes: string[] | null = null;
let memoryProductProfiles: ProductProfile[] | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function dispatchStorageEvent(eventName: string): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new Event(eventName));
    } catch {
      // Ignore in non-DOM test environments
    }
  }
}

/**
 * Normalizes whitespace in a product type label while preserving display casing.
 */
export function normalizeProductTypeName(name: string): string {
  return (name || '').trim().replace(/\s+/g, ' ');
}

/**
 * Normalizes a product type label into a canonical case-insensitive comparison key.
 */
export function normalizeProductTypeKey(name: string): string {
  return normalizeProductTypeName(name).toLowerCase();
}

/**
 * Deduplicates and sanitizes a raw array of product type strings.
 */
function sanitizeProductTypeList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_PRODUCT_TYPES];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const cleaned = normalizeProductTypeName(item);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(cleaned);
    }
  }

  return result.length > 0 ? result : [...DEFAULT_PRODUCT_TYPES];
}

/**
 * Retrieves the persisted list of product types from localStorage (or memory in Node tests).
 * Gracefully falls back to DEFAULT_PRODUCT_TYPES if storage is empty or malformed.
 */
export function getProductTypes(): string[] {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(PRODUCT_TYPES_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        return sanitizeProductTypeList(parsed);
      }
    } catch {
      // Fall back to default product types if JSON is corrupted
    }
    return [...DEFAULT_PRODUCT_TYPES];
  }

  if (memoryProductTypes !== null) {
    return [...memoryProductTypes];
  }
  return [...DEFAULT_PRODUCT_TYPES];
}

function saveProductTypesToStorage(types: string[]): string[] {
  const sanitized = sanitizeProductTypeList(types);
  memoryProductTypes = [...sanitized];
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(PRODUCT_TYPES_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Ignore quota/storage errors
    }
  }
  dispatchStorageEvent(PRODUCT_TYPES_UPDATED_EVENT);
  return sanitized;
}

/**
 * Adds a new product type if it does not already exist (after whitespace and case normalization).
 */
export function addProductType(rawName: string): {
  success: boolean;
  productType?: string;
  error?: string;
  types: string[];
} {
  const current = getProductTypes();
  const cleaned = normalizeProductTypeName(rawName);

  if (!cleaned) {
    return {
      success: false,
      error: 'Product type name cannot be empty.',
      types: current,
    };
  }

  const key = cleaned.toLowerCase();
  const existing = current.find((t) => normalizeProductTypeKey(t) === key);
  if (existing) {
    return {
      success: false,
      productType: existing,
      error: `Product type "${existing}" already exists.`,
      types: current,
    };
  }

  const updated = saveProductTypesToStorage([...current, cleaned]);
  return {
    success: true,
    productType: cleaned,
    types: updated,
  };
}

/**
 * Ensures a product type exists in the stored list (adding it if missing) and returns its canonical label.
 */
export function ensureProductTypeExists(rawName: string): string {
  const cleaned = normalizeProductTypeName(rawName);
  if (!cleaned) return getProductTypes()[0] || 'T-shirt';
  const current = getProductTypes();
  const existing = current.find(
    (t) => normalizeProductTypeKey(t) === cleaned.toLowerCase()
  );
  if (existing) return existing;
  saveProductTypesToStorage([...current, cleaned]);
  return cleaned;
}

/**
 * Returns all saved profiles that currently reference the given product type.
 */
export function getProfilesUsingProductType(typeName: string): ProductProfile[] {
  const targetKey = normalizeProductTypeKey(typeName);
  if (!targetKey) return [];
  return getProductProfiles().filter(
    (p) => normalizeProductTypeKey(p.productType) === targetKey
  );
}

/**
 * Renames an existing product type and automatically updates any saved ProductProfile
 * that references the old type name so profile references remain intact.
 */
export function renameProductType(
  oldName: string,
  newRawName: string
): {
  success: boolean;
  productType?: string;
  updatedProfileCount: number;
  error?: string;
  types: string[];
} {
  const current = getProductTypes();
  const oldKey = normalizeProductTypeKey(oldName);
  const newCleaned = normalizeProductTypeName(newRawName);
  const newKey = newCleaned.toLowerCase();

  if (!newCleaned) {
    return {
      success: false,
      updatedProfileCount: 0,
      error: 'New product type name cannot be empty.',
      types: current,
    };
  }

  const oldIndex = current.findIndex((t) => normalizeProductTypeKey(t) === oldKey);
  if (oldIndex === -1) {
    return {
      success: false,
      updatedProfileCount: 0,
      error: `Product type "${oldName}" was not found.`,
      types: current,
    };
  }

  // Prevent colliding with a different existing product type
  const collision = current.find(
    (t, idx) => idx !== oldIndex && normalizeProductTypeKey(t) === newKey
  );
  if (collision) {
    return {
      success: false,
      updatedProfileCount: 0,
      error: `Another product type named "${collision}" already exists.`,
      types: current,
    };
  }

  const nextTypes = [...current];
  nextTypes[oldIndex] = newCleaned;
  const savedTypes = saveProductTypesToStorage(nextTypes);

  // Update any saved profiles referencing the renamed type
  const profiles = getProductProfiles();
  let updatedProfileCount = 0;
  const updatedProfiles = profiles.map((profile) => {
    if (normalizeProductTypeKey(profile.productType) === oldKey) {
      updatedProfileCount += 1;
      return {
        ...profile,
        productType: newCleaned,
        updatedAt: new Date().toISOString(),
      };
    }
    return profile;
  });

  if (updatedProfileCount > 0) {
    saveProductProfilesToStorage(updatedProfiles);
  }

  return {
    success: true,
    productType: newCleaned,
    updatedProfileCount,
    types: savedTypes,
  };
}

/**
 * Deletes a product type from the list.
 * - If saved profiles reference the type and no `reassignToType` is provided, deletion is blocked
 *   to protect profile data integrity.
 * - If `reassignToType` is provided, referencing profiles are reassigned to `reassignToType`
 *   before removing `targetName`.
 */
export function deleteProductType(
  targetName: string,
  reassignToType?: string
): {
  success: boolean;
  reassignedProfileCount: number;
  referencingProfiles?: ProductProfile[];
  error?: string;
  types: string[];
} {
  const current = getProductTypes();
  const targetKey = normalizeProductTypeKey(targetName);

  const exists = current.some((t) => normalizeProductTypeKey(t) === targetKey);
  if (!exists) {
    return {
      success: false,
      reassignedProfileCount: 0,
      error: `Product type "${targetName}" was not found.`,
      types: current,
    };
  }

  if (current.length <= 1) {
    return {
      success: false,
      reassignedProfileCount: 0,
      error: 'Cannot delete the last remaining product type.',
      types: current,
    };
  }

  const referencingProfiles = getProfilesUsingProductType(targetName);
  if (referencingProfiles.length > 0) {
    const cleanedReassign = normalizeProductTypeName(reassignToType || '');
    const reassignKey = cleanedReassign.toLowerCase();

    if (!cleanedReassign || reassignKey === targetKey) {
      const names = referencingProfiles.map((p) => `"${p.name}"`).join(', ');
      return {
        success: false,
        reassignedProfileCount: 0,
        referencingProfiles,
        error: `Cannot delete "${targetName}" because it is used by ${referencingProfiles.length} saved profile(s): ${names}. Select a replacement type to reassign those profiles first.`,
        types: current,
      };
    }

    const canonicalReplacement = ensureProductTypeExists(cleanedReassign);
    const allProfiles = getProductProfiles();
    let reassignedCount = 0;
    const nextProfiles = allProfiles.map((p) => {
      if (normalizeProductTypeKey(p.productType) === targetKey) {
        reassignedCount += 1;
        return {
          ...p,
          productType: canonicalReplacement,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    saveProductProfilesToStorage(nextProfiles);

    const remainingTypes = getProductTypes().filter(
      (t) => normalizeProductTypeKey(t) !== targetKey
    );
    const savedTypes = saveProductTypesToStorage(remainingTypes);

    return {
      success: true,
      reassignedProfileCount: reassignedCount,
      types: savedTypes,
    };
  }

  const remainingTypes = current.filter(
    (t) => normalizeProductTypeKey(t) !== targetKey
  );
  const savedTypes = saveProductTypesToStorage(remainingTypes);

  return {
    success: true,
    reassignedProfileCount: 0,
    types: savedTypes,
  };
}

// ==========================================
// Product Profiles Persistence & Operations
// ==========================================

function sanitizeProfileRecord(raw: any, fallbackIdx: number): ProductProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;

  const id =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `profile-recovered-${fallbackIdx}`;
  const productType =
    typeof raw.productType === 'string' && raw.productType.trim()
      ? normalizeProductTypeName(raw.productType)
      : 'T-shirt';
  const productConcept =
    typeof raw.productConcept === 'string' ? raw.productConcept : '';
  const keyFeatures = typeof raw.keyFeatures === 'string' ? raw.keyFeatures : '';
  const materials = typeof raw.materials === 'string' ? raw.materials : '';
  const dimensions = typeof raw.dimensions === 'string' ? raw.dimensions : '';
  const updatedAt =
    typeof raw.updatedAt === 'string' && raw.updatedAt
      ? raw.updatedAt
      : new Date().toISOString();

  return {
    id,
    name,
    productType,
    productConcept,
    keyFeatures,
    materials,
    dimensions,
    updatedAt,
  };
}

function sanitizeProfileList(raw: unknown): ProductProfile[] | null {
  if (!Array.isArray(raw)) return null;
  const valid: ProductProfile[] = [];
  const seenIds = new Set<string>();

  raw.forEach((item, idx) => {
    const cleaned = sanitizeProfileRecord(item, idx);
    if (cleaned && !seenIds.has(cleaned.id)) {
      seenIds.add(cleaned.id);
      valid.push(cleaned);
    }
  });

  return valid;
}

/**
 * Retrieves all saved ProductProfiles from localStorage (or memory in Node tests).
 * Gracefully falls back to DEFAULT_PRODUCT_PROFILES if storage is unset or malformed.
 */
export function getProductProfiles(): ProductProfile[] {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(PRODUCT_PROFILES_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const sanitized = sanitizeProfileList(parsed);
        if (sanitized !== null) {
          return sanitized;
        }
      }
    } catch {
      // Fall back to default profiles if localStorage JSON is malformed
    }
    return DEFAULT_PRODUCT_PROFILES.map((p) => ({ ...p }));
  }

  if (memoryProductProfiles !== null) {
    return memoryProductProfiles.map((p) => ({ ...p }));
  }
  return DEFAULT_PRODUCT_PROFILES.map((p) => ({ ...p }));
}

function saveProductProfilesToStorage(profiles: ProductProfile[]): ProductProfile[] {
  const cloned = profiles.map((p) => ({ ...p }));
  memoryProductProfiles = cloned;
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(PRODUCT_PROFILES_STORAGE_KEY, JSON.stringify(cloned));
    } catch {
      // Ignore storage write errors
    }
  }
  dispatchStorageEvent(PRODUCT_PROFILES_UPDATED_EVENT);
  return cloned;
}

/**
 * Creates and persists a new ProductProfile.
 */
export function createProductProfile(
  input: Omit<ProductProfile, 'id' | 'updatedAt'>
): {
  success: boolean;
  profile?: ProductProfile;
  error?: string;
  profiles: ProductProfile[];
} {
  const current = getProductProfiles();
  const trimmedName = (input.name || '').trim().replace(/\s+/g, ' ');

  if (!trimmedName) {
    return {
      success: false,
      error: 'Profile name is required.',
      profiles: current,
    };
  }

  const nameCollision = current.find(
    (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (nameCollision) {
    return {
      success: false,
      error: `A profile named "${nameCollision.name}" already exists.`,
      profiles: current,
    };
  }

  const canonicalType = ensureProductTypeExists(input.productType || 'T-shirt');
  const newProfile: ProductProfile = {
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    productType: canonicalType,
    productConcept: (input.productConcept || '').trim(),
    keyFeatures: (input.keyFeatures || '').trim(),
    materials: (input.materials || '').trim(),
    dimensions: (input.dimensions || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  const saved = saveProductProfilesToStorage([newProfile, ...current]);
  return {
    success: true,
    profile: newProfile,
    profiles: saved,
  };
}

/**
 * Updates an existing saved ProductProfile by ID.
 */
export function updateProductProfile(
  id: string,
  updates: Partial<Omit<ProductProfile, 'id' | 'updatedAt'>>
): {
  success: boolean;
  profile?: ProductProfile;
  error?: string;
  profiles: ProductProfile[];
} {
  const current = getProductProfiles();
  const idx = current.findIndex((p) => p.id === id);
  if (idx === -1) {
    return {
      success: false,
      error: 'Selected profile was not found.',
      profiles: current,
    };
  }

  const existing = current[idx];
  const nextName =
    updates.name !== undefined
      ? updates.name.trim().replace(/\s+/g, ' ')
      : existing.name;

  if (!nextName) {
    return {
      success: false,
      error: 'Profile name cannot be empty.',
      profiles: current,
    };
  }

  const collision = current.find(
    (p, i) => i !== idx && p.name.trim().toLowerCase() === nextName.toLowerCase()
  );
  if (collision) {
    return {
      success: false,
      error: `Another profile named "${collision.name}" already exists.`,
      profiles: current,
    };
  }

  const nextType =
    updates.productType !== undefined
      ? ensureProductTypeExists(updates.productType)
      : existing.productType;

  const updatedProfile: ProductProfile = {
    ...existing,
    name: nextName,
    productType: nextType,
    productConcept:
      updates.productConcept !== undefined
        ? updates.productConcept.trim()
        : existing.productConcept,
    keyFeatures:
      updates.keyFeatures !== undefined
        ? updates.keyFeatures.trim()
        : existing.keyFeatures,
    materials:
      updates.materials !== undefined
        ? updates.materials.trim()
        : existing.materials,
    dimensions:
      updates.dimensions !== undefined
        ? updates.dimensions.trim()
        : existing.dimensions,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...current];
  nextList[idx] = updatedProfile;
  const saved = saveProductProfilesToStorage(nextList);

  return {
    success: true,
    profile: updatedProfile,
    profiles: saved,
  };
}

/**
 * Duplicates an existing ProductProfile with a unique descriptive name.
 */
export function duplicateProductProfile(
  id: string,
  customName?: string
): {
  success: boolean;
  profile?: ProductProfile;
  error?: string;
  profiles: ProductProfile[];
} {
  const current = getProductProfiles();
  const source = current.find((p) => p.id === id);
  if (!source) {
    return {
      success: false,
      error: 'Profile to duplicate was not found.',
      profiles: current,
    };
  }

  let candidateName = customName ? customName.trim() : `${source.name} (Copy)`;
  let suffix = 2;
  while (
    current.some((p) => p.name.trim().toLowerCase() === candidateName.toLowerCase())
  ) {
    candidateName = `${source.name} (Copy ${suffix})`;
    suffix += 1;
  }

  return createProductProfile({
    name: candidateName,
    productType: source.productType,
    productConcept: source.productConcept,
    keyFeatures: source.keyFeatures,
    materials: source.materials,
    dimensions: source.dimensions,
  });
}

/**
 * Deletes a saved ProductProfile by ID.
 */
export function deleteProductProfile(id: string): {
  success: boolean;
  profiles: ProductProfile[];
} {
  const current = getProductProfiles();
  const next = current.filter((p) => p.id !== id);
  const saved = saveProductProfilesToStorage(next);
  return {
    success: next.length !== current.length,
    profiles: saved,
  };
}

/**
 * Applies a selected ProductProfile's physical specifications to the current ProductCopyOptions
 * WITHOUT overwriting unrelated item-specific fields (productName, targetCustomer,
 * occasion, personalization, tone, or additionalInstructions).
 */
export function applyProfileToOptions(
  currentOptions: ProductCopyOptions,
  profile: ProductProfile
): ProductCopyOptions {
  return {
    ...currentOptions,
    productType: profile.productType,
    productConcept: profile.productConcept,
    keyFeatures: profile.keyFeatures,
    materials: profile.materials,
    dimensions: profile.dimensions,
  };
}

/**
 * Checks whether the current ProductCopyOptions form has unsaved edits to any
 * profile-managed specification fields compared to the currently selected ProductProfile.
 */
export function hasUnsavedProfileEdits(
  options: ProductCopyOptions,
  profile: ProductProfile | null | undefined
): boolean {
  if (!profile) return false;
  return (
    normalizeProductTypeKey(options.productType) !==
      normalizeProductTypeKey(profile.productType) ||
    (options.productConcept || '').trim() !== (profile.productConcept || '').trim() ||
    (options.keyFeatures || '').trim() !== (profile.keyFeatures || '').trim() ||
    (options.materials || '').trim() !== (profile.materials || '').trim() ||
    (options.dimensions || '').trim() !== (profile.dimensions || '').trim()
  );
}

/**
 * Resets in-memory fallback stores for unit testing.
 */
export function resetProfileManagerMemoryForTests(): void {
  memoryProductTypes = null;
  memoryProductProfiles = null;
}
