import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Edit3,
  FilePlus2,
  FileText,
  Gift,
  Layers,
  Maximize2,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Sliders,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  ProductCopyOptions,
  ProductCopyTone,
  ProductProfile,
} from '../../prompts/writing/types';
import { WritingStyleKey } from '../../prompts/writing/styles';
import {
  addProductType,
  applyProfileToOptions,
  createProductProfile,
  deleteProductProfile,
  deleteProductType,
  duplicateProductProfile,
  ensureProductTypeExists,
  getProductProfiles,
  getProductTypes,
  getProfilesUsingProductType,
  hasUnsavedProfileEdits,
  normalizeProductTypeKey,
  PRODUCT_PROFILES_UPDATED_EVENT,
  PRODUCT_TYPES_UPDATED_EVENT,
  renameProductType,
  updateProductProfile,
} from '../../utils/productProfileManager';

interface ProductCopyControlsProps {
  options: ProductCopyOptions;
  onChange: (options: ProductCopyOptions) => void;
  onGenerate: () => void;
  onOpenStyleLibrary?: (tab?: WritingStyleKey) => void;
}

export const ProductCopyControls: React.FC<ProductCopyControlsProps> = ({
  options,
  onChange,
  onGenerate,
  onOpenStyleLibrary,
}) => {
  // Persisted Product Profiles & Product Types state
  const [profiles, setProfiles] = useState<ProductProfile[]>(() => getProductProfiles());
  const [productTypes, setProductTypes] = useState<string[]>(() => {
    const initial = getProductTypes();
    if (
      options.productType &&
      !initial.some(
        (t) => normalizeProductTypeKey(t) === normalizeProductTypeKey(options.productType)
      )
    ) {
      return [...initial, options.productType.trim()];
    }
    return initial;
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [pendingSwitchProfileId, setPendingSwitchProfileId] = useState<string | null>(null);

  // Profile creation / rename / delete UI states
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [isRenamingProfile, setIsRenamingProfile] = useState<boolean>(false);
  const [renameProfileInput, setRenameProfileInput] = useState<string>('');
  const [confirmDeleteProfileId, setConfirmDeleteProfileId] = useState<string | null>(null);

  // Product Type inline add / manage UI states
  const [isAddingType, setIsAddingType] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState<string>('');
  const [isManagingTypes, setIsManagingTypes] = useState<boolean>(false);
  const [editingTypeOriginal, setEditingTypeOriginal] = useState<string | null>(null);
  const [editingTypeValue, setEditingTypeValue] = useState<string>('');
  const [reassigningTypeTarget, setReassigningTypeTarget] = useState<string | null>(null);
  const [reassignReplacementType, setReassignReplacementType] = useState<string>('');

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ type, text });
  };

  // Sync with storage events
  useEffect(() => {
    const syncProfiles = () => setProfiles(getProductProfiles());
    const syncTypes = () => setProductTypes(getProductTypes());

    window.addEventListener(PRODUCT_PROFILES_UPDATED_EVENT, syncProfiles);
    window.addEventListener(PRODUCT_TYPES_UPDATED_EVENT, syncTypes);
    return () => {
      window.removeEventListener(PRODUCT_PROFILES_UPDATED_EVENT, syncProfiles);
      window.removeEventListener(PRODUCT_TYPES_UPDATED_EVENT, syncTypes);
    };
  }, []);

  const activeProfile = profiles.find((p) => p.id === selectedProfileId) || null;
  const hasUnsavedChanges = hasUnsavedProfileEdits(options, activeProfile);

  const updateOption = <K extends keyof ProductCopyOptions>(
    key: K,
    value: ProductCopyOptions[K]
  ) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  // ==========================================
  // Product Profile Handlers
  // ==========================================
  const performProfileSelection = (targetProfileId: string) => {
    setPendingSwitchProfileId(null);
    setConfirmDeleteProfileId(null);
    setIsRenamingProfile(false);
    setIsCreatingProfile(false);

    if (!targetProfileId) {
      setSelectedProfileId('');
      showFeedback(
        'Started a custom product entry (no profile linked). Unrelated fields were preserved.',
        'info'
      );
      return;
    }

    const target = profiles.find((p) => p.id === targetProfileId);
    if (!target) return;

    setSelectedProfileId(target.id);
    // Ensure the profile's product type is available in the dropdown
    ensureProductTypeExists(target.productType);
    setProductTypes(getProductTypes());

    // Populate ONLY the profile's physical specification fields without submitting or overwriting
    // item-specific fields (productName, targetCustomer, occasion, personalization, tone, additionalInstructions)
    const nextOptions = applyProfileToOptions(options, target);
    onChange(nextOptions);
    showFeedback(
      `Loaded profile "${target.name}". Specifications populated; audience & item fields preserved.`,
      'info'
    );
  };

  const handleProfileDropdownChange = (nextProfileId: string) => {
    if (nextProfileId === selectedProfileId) return;
    if (activeProfile && hasUnsavedChanges) {
      setPendingSwitchProfileId(nextProfileId);
      return;
    }
    performProfileSelection(nextProfileId);
  };

  const handleStartNewEntry = () => {
    if (activeProfile && hasUnsavedChanges) {
      setPendingSwitchProfileId('');
      return;
    }
    setSelectedProfileId('');
    setPendingSwitchProfileId(null);
    setIsRenamingProfile(false);
    setConfirmDeleteProfileId(null);
    onChange({
      ...options,
      productName: '',
      productConcept: '',
      keyFeatures: '',
      materials: '',
      dimensions: '',
    });
    showFeedback('Cleared specification fields for a new custom product entry.', 'info');
  };

  const handleSaveNewProfile = () => {
    const result = createProductProfile({
      name: newProfileName,
      productType: options.productType,
      productConcept: options.productConcept,
      keyFeatures: options.keyFeatures,
      materials: options.materials || '',
      dimensions: options.dimensions || '',
    });

    if (!result.success || !result.profile) {
      showFeedback(result.error || 'Could not create profile.', 'error');
      return;
    }

    setProfiles(result.profiles);
    setProductTypes(getProductTypes());
    setSelectedProfileId(result.profile.id);
    setNewProfileName('');
    setIsCreatingProfile(false);
    showFeedback(`Saved new profile "${result.profile.name}".`, 'success');
  };

  const handleSaveChangesToActiveProfile = () => {
    if (!activeProfile) return;
    const result = updateProductProfile(activeProfile.id, {
      productType: options.productType,
      productConcept: options.productConcept,
      keyFeatures: options.keyFeatures,
      materials: options.materials || '',
      dimensions: options.dimensions || '',
    });

    if (!result.success || !result.profile) {
      showFeedback(result.error || 'Could not update profile.', 'error');
      return;
    }

    setProfiles(result.profiles);
    showFeedback(`Saved changes to profile "${result.profile.name}".`, 'success');
  };

  const handleConfirmRenameProfile = () => {
    if (!activeProfile) return;
    const result = updateProductProfile(activeProfile.id, {
      name: renameProfileInput,
    });

    if (!result.success || !result.profile) {
      showFeedback(result.error || 'Could not rename profile.', 'error');
      return;
    }

    setProfiles(result.profiles);
    setIsRenamingProfile(false);
    showFeedback(`Renamed profile to "${result.profile.name}".`, 'success');
  };

  const handleDuplicateActiveProfile = () => {
    if (!activeProfile) return;
    const result = duplicateProductProfile(activeProfile.id);
    if (!result.success || !result.profile) {
      showFeedback(result.error || 'Could not duplicate profile.', 'error');
      return;
    }

    setProfiles(result.profiles);
    setSelectedProfileId(result.profile.id);
    onChange(applyProfileToOptions(options, result.profile));
    showFeedback(`Duplicated profile as "${result.profile.name}".`, 'success');
  };

  const handleConfirmDeleteProfile = () => {
    if (!confirmDeleteProfileId) return;
    const target = profiles.find((p) => p.id === confirmDeleteProfileId);
    const result = deleteProductProfile(confirmDeleteProfileId);
    setProfiles(result.profiles);
    if (selectedProfileId === confirmDeleteProfileId) {
      setSelectedProfileId('');
    }
    setConfirmDeleteProfileId(null);
    showFeedback(`Deleted profile "${target?.name || 'Profile'}".`, 'info');
  };

  // ==========================================
  // Product Type Handlers
  // ==========================================
  const handleAddProductType = () => {
    const result = addProductType(newTypeName);
    if (!result.success || !result.productType) {
      showFeedback(result.error || 'Could not add product type.', 'error');
      return;
    }

    setProductTypes(result.types);
    updateOption('productType', result.productType);
    setNewTypeName('');
    setIsAddingType(false);
    showFeedback(`Added product type "${result.productType}" and selected it.`, 'success');
  };

  const handleStartRenameType = (typeName: string) => {
    setEditingTypeOriginal(typeName);
    setEditingTypeValue(typeName);
    setReassigningTypeTarget(null);
  };

  const handleConfirmRenameType = () => {
    if (!editingTypeOriginal) return;
    const result = renameProductType(editingTypeOriginal, editingTypeValue);
    if (!result.success || !result.productType) {
      showFeedback(result.error || 'Could not rename product type.', 'error');
      return;
    }

    setProductTypes(result.types);
    setProfiles(getProductProfiles());

    // If current form productType matched the renamed type, keep it in sync
    if (
      normalizeProductTypeKey(options.productType) ===
      normalizeProductTypeKey(editingTypeOriginal)
    ) {
      updateOption('productType', result.productType);
    }

    const profileNote =
      result.updatedProfileCount > 0
        ? ` and updated ${result.updatedProfileCount} linked profile(s)`
        : '';
    showFeedback(
      `Renamed "${editingTypeOriginal}" to "${result.productType}"${profileNote}.`,
      'success'
    );
    setEditingTypeOriginal(null);
    setEditingTypeValue('');
  };

  const handleAttemptDeleteType = (typeName: string) => {
    const usedBy = getProfilesUsingProductType(typeName);
    if (usedBy.length > 0) {
      // Open explicit reassignment workflow
      const fallbackCandidate =
        productTypes.find(
          (t) => normalizeProductTypeKey(t) !== normalizeProductTypeKey(typeName)
        ) || '';
      setReassigningTypeTarget(typeName);
      setReassignReplacementType(fallbackCandidate);
      setEditingTypeOriginal(null);
      return;
    }

    const result = deleteProductType(typeName);
    if (!result.success) {
      showFeedback(result.error || 'Could not delete product type.', 'error');
      return;
    }

    setProductTypes(result.types);
    if (
      normalizeProductTypeKey(options.productType) === normalizeProductTypeKey(typeName)
    ) {
      updateOption('productType', result.types[0] || 'T-shirt');
    }
    showFeedback(`Deleted product type "${typeName}".`, 'info');
  };

  const handleConfirmReassignAndDeleteType = () => {
    if (!reassigningTypeTarget) return;
    const result = deleteProductType(reassigningTypeTarget, reassignReplacementType);
    if (!result.success) {
      showFeedback(result.error || 'Could not reassign and delete product type.', 'error');
      return;
    }

    setProductTypes(result.types);
    setProfiles(getProductProfiles());
    if (
      normalizeProductTypeKey(options.productType) ===
      normalizeProductTypeKey(reassigningTypeTarget)
    ) {
      updateOption('productType', reassignReplacementType);
    }
    showFeedback(
      `Reassigned ${result.reassignedProfileCount} profile(s) to "${reassignReplacementType}" and deleted "${reassigningTypeTarget}".`,
      'success'
    );
    setReassigningTypeTarget(null);
    setReassignReplacementType('');
  };

  const tones: { id: ProductCopyTone; label: string; desc: string }[] = [
    {
      id: 'sophisticated-editorial',
      label: 'Sophisticated Editorial',
      desc: 'Tactile, quiet luxury & poetic craft',
    },
    {
      id: 'warm-approachable',
      label: 'Warm & Approachable',
      desc: 'Like a trusted shopkeeper recommendation',
    },
    {
      id: 'playfully-cerebral',
      label: 'Playfully Cerebral',
      desc: 'Witty scientific & historical charm',
    },
    {
      id: 'minimalist-luxury',
      label: 'Minimalist Luxury',
      desc: 'Spare, direct, focused on pure form',
    },
    {
      id: 'practical-informative',
      label: 'Practical & Informative',
      desc: 'Specs, durability & daily rituals',
    },
  ];

  // Ensure current options.productType is rendered in the <select> even if loaded from custom state
  const effectiveProductTypes = productTypes.some(
    (t) => normalizeProductTypeKey(t) === normalizeProductTypeKey(options.productType)
  )
    ? productTypes
    : options.productType.trim()
    ? [options.productType.trim(), ...productTypes]
    : productTypes;

  return (
    <div className="space-y-6 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
      {/* Tool Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fae8ff] text-[#a21caf] flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">
              Boutique Product Copy Generator
            </h2>
            <p className="text-[11px] text-[#64748b]">
              Select a reusable product profile, customize item details, and generate e-commerce copy
            </p>
          </div>
        </div>
      </div>

      {/* Active Style Directives Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] text-xs">
        <div className="flex items-center gap-2 text-[#0f766e]">
          <Sliders className="w-3.5 h-3.5 text-[#0f766e] flex-shrink-0" />
          <span className="text-[11px]">
            Active Style Rules:{' '}
            <strong className="font-semibold text-[#0f172a]">Global + Copy Directives</strong>
          </span>
        </div>
        {onOpenStyleLibrary && (
          <button
            type="button"
            onClick={() => onOpenStyleLibrary('copy')}
            className="text-[11px] font-semibold text-[#0f766e] hover:text-[#0d9488] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Edit Rules
          </button>
        )}
      </div>

      {/* Status / Feedback Notice */}
      {feedback && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            feedback.type === 'error'
              ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
              : feedback.type === 'info'
              ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
              : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-0.5 text-current opacity-70 hover:opacity-100 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==========================================
          REUSABLE PRODUCT PROFILES BAR
         ========================================== */}
      <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="product-profile-select"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#a21caf]" />
            <span>Reusable Product Profile</span>
            {activeProfile && hasUnsavedChanges && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                Unsaved Spec Edits
              </span>
            )}
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleStartNewEntry}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#475569] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] transition-colors cursor-pointer"
              title="Clear specification fields and start a new custom product entry without a profile"
            >
              <FilePlus2 className="w-3 h-3" />
              <span>New Entry</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCreatingProfile((prev) => !prev);
                setIsRenamingProfile(false);
                setConfirmDeleteProfileId(null);
                if (!newProfileName && options.productType) {
                  setNewProfileName(`Standard ${options.productType}`);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#a21caf] bg-[#fdf4ff] hover:bg-[#fae8ff] border border-[#f5d0fe] transition-colors cursor-pointer"
              title="Save current product type, features, materials, and dimensions as a new reusable profile"
            >
              <Plus className="w-3 h-3" />
              <span>Save as New Profile</span>
            </button>
          </div>
        </div>

        {/* Profile Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            id="product-profile-select"
            value={selectedProfileId}
            onChange={(e) => handleProfileDropdownChange(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] bg-white text-[#1e293b] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#a21caf]"
          >
            <option value="">-- Custom Product Entry (No Profile Selected) --</option>
            {profiles.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.name} ({prof.productType})
              </option>
            ))}
          </select>

          {/* Actions for Currently Selected Profile */}
          {activeProfile && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleSaveChangesToActiveProfile}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  hasUnsavedChanges
                    ? 'bg-[#0f766e] text-white hover:bg-[#115e59] shadow-2xs'
                    : 'bg-[#e2e8f0] text-[#64748b] cursor-not-allowed opacity-70'
                }`}
                title="Explicitly save current specification changes back to this profile"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRenamingProfile((prev) => !prev);
                  setRenameProfileInput(activeProfile.name);
                  setIsCreatingProfile(false);
                }}
                className="p-2 rounded-xl text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] transition-colors cursor-pointer"
                title="Rename selected profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDuplicateActiveProfile}
                className="p-2 rounded-xl text-[#475569] hover:text-[#0284c7] bg-white hover:bg-[#f0f9ff] border border-[#cbd5e1] transition-colors cursor-pointer"
                title="Duplicate selected profile"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteProfileId(activeProfile.id);
                  setIsRenamingProfile(false);
                  setIsCreatingProfile(false);
                }}
                className="p-2 rounded-xl text-[#64748b] hover:text-[#dc2626] bg-white hover:bg-[#fef2f2] border border-[#cbd5e1] transition-colors cursor-pointer"
                title="Delete selected profile"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Inline Unsaved Edits Warning when Switching Profiles */}
        {pendingSwitchProfileId !== null && (
          <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
              <p>
                You have unsaved changes to the specifications while{' '}
                <strong>{activeProfile?.name}</strong> is selected. Switching profiles without
                saving will discard your unsaved edits in the form.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSwitchProfileId(null)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-[#475569] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => performProfileSelection(pendingSwitchProfileId)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#d97706] hover:bg-[#b45309] cursor-pointer"
              >
                Discard Edits & Switch
              </button>
            </div>
          </div>
        )}

        {/* Inline Save as New Profile Form */}
        {isCreatingProfile && (
          <div className="p-3 rounded-xl bg-white border border-[#e2e8f0] space-y-2">
            <label className="text-[11px] font-bold text-[#0f172a] block">
              New Profile Name (saves Product Type, Concept, Key Features, Materials & Dimensions):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Standard Pullover Hoodie"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf]"
              />
              <button
                type="button"
                onClick={handleSaveNewProfile}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#a21caf] hover:bg-[#86198f] flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingProfile(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline Rename Profile Form */}
        {isRenamingProfile && activeProfile && (
          <div className="p-3 rounded-xl bg-white border border-[#e2e8f0] space-y-2">
            <label className="text-[11px] font-bold text-[#0f172a] block">
              Rename Profile &ldquo;{activeProfile.name}&rdquo;:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={renameProfileInput}
                onChange={(e) => setRenameProfileInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf]"
              />
              <button
                type="button"
                onClick={handleConfirmRenameProfile}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Name</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRenamingProfile(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline Delete Profile Confirmation */}
        {confirmDeleteProfileId && (
          <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex flex-wrap items-center justify-between gap-2">
            <span>
              Delete saved profile{' '}
              <strong>
                &ldquo;{profiles.find((p) => p.id === confirmDeleteProfileId)?.name}&rdquo;
              </strong>
              ? Current form values will remain on screen.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProfileId(null)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#475569] bg-white border border-[#cbd5e1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProfile}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#64748b]">
          Selecting a profile populates <strong>Product Type</strong>, <strong>Concept</strong>,{' '}
          <strong>Key Features</strong>, <strong>Materials</strong>, and{' '}
          <strong>Dimensions</strong> while preserving your item title, audience, occasion, and
          personalization settings.
        </p>
      </div>

      {/* ==========================================
          1. PRODUCT NAME & EDITABLE PRODUCT TYPE DROPDOWN
         ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="product-copy-name-input"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
          >
            <span className="w-5 h-5 rounded-full bg-[#fae8ff] text-[#a21caf] text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            Product Name
          </label>
          <input
            id="product-copy-name-input"
            type="text"
            value={options.productName}
            onChange={(e) => updateOption('productName', e.target.value)}
            placeholder="e.g. Celestial Atlas Hardcover Journal"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="product-copy-type-select"
              className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#a21caf]" />
              <span>Product Type</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingType((prev) => !prev);
                  setIsManagingTypes(false);
                }}
                className="text-[11px] font-semibold text-[#a21caf] hover:text-[#86198f] flex items-center gap-0.5 cursor-pointer"
                title="Add a new product type to the dropdown"
              >
                <Plus className="w-3 h-3" />
                <span>Add Type</span>
              </button>
              <span className="text-[#cbd5e1]">•</span>
              <button
                type="button"
                onClick={() => {
                  setIsManagingTypes((prev) => !prev);
                  setIsAddingType(false);
                  setEditingTypeOriginal(null);
                  setReassigningTypeTarget(null);
                }}
                className="text-[11px] font-semibold text-[#475569] hover:text-[#0f172a] cursor-pointer"
                title="Rename or delete product types"
              >
                {isManagingTypes ? 'Done' : 'Manage'}
              </button>
            </div>
          </div>

          <select
            id="product-copy-type-select"
            value={options.productType}
            onChange={(e) => updateOption('productType', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] font-medium"
          >
            {effectiveProductTypes.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inline Add New Product Type Bar */}
      {isAddingType && (
        <div className="p-3 rounded-xl bg-[#fdf4ff] border border-[#f5d0fe] space-y-2">
          <label className="text-[11px] font-bold text-[#0f172a] block">
            Add New Product Type to Dropdown (persists across sessions):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddProductType();
                }
              }}
              placeholder="e.g. Laptop Sleeve, Desk Mat, Enamel Pin..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#a21caf]"
            />
            <button
              type="button"
              onClick={handleAddProductType}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#a21caf] hover:bg-[#86198f] cursor-pointer"
            >
              Add Type
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingType(false);
                setNewTypeName('');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:bg-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Compact Product Type Manager Panel */}
      {isManagingTypes && (
        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0f172a]">
              Manage Saved Product Types ({productTypes.length})
            </span>
            <span className="text-[10px] text-[#64748b]">
              Renaming a type automatically updates linked profiles
            </span>
          </div>

          {/* Reassignment Prompt when Deleting a Type Referenced by Saved Profiles */}
          {reassigningTypeTarget && (
            <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] space-y-2">
              <p className="font-semibold">
                &ldquo;{reassigningTypeTarget}&rdquo; is used by{' '}
                {getProfilesUsingProductType(reassigningTypeTarget).length} saved profile(s) (
                {getProfilesUsingProductType(reassigningTypeTarget)
                  .map((p) => p.name)
                  .join(', ')}
                ).
              </p>
              <p className="text-[11px]">
                To protect saved profiles, choose a replacement product type to reassign them to
                before deleting:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <select
                  aria-label="Replacement product type"
                  value={reassignReplacementType}
                  onChange={(e) => setReassignReplacementType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-[#cbd5e1] bg-white text-[#0f172a] font-medium"
                >
                  {productTypes
                    .filter(
                      (t) =>
                        normalizeProductTypeKey(t) !==
                        normalizeProductTypeKey(reassigningTypeTarget)
                    )
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleConfirmReassignAndDeleteType}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#d97706] hover:bg-[#b45309] cursor-pointer"
                >
                  Reassign Profiles & Delete
                </button>
                <button
                  type="button"
                  onClick={() => setReassigningTypeTarget(null)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#475569] bg-white border border-[#cbd5e1] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {productTypes.map((typeItem) => {
              const linkedCount = getProfilesUsingProductType(typeItem).length;
              const isEditingThis = editingTypeOriginal === typeItem;

              return (
                <div
                  key={typeItem}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs"
                >
                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingTypeValue}
                        onChange={(e) => setEditingTypeValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded border border-[#cbd5e1]"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmRenameType}
                        className="px-2 py-1 rounded text-[11px] font-semibold text-white bg-[#0f766e] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTypeOriginal(null)}
                        className="px-2 py-1 rounded text-[11px] text-[#64748b] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-[#0f172a] truncate">{typeItem}</span>
                        {linkedCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#475569]">
                            {linkedCount} profile{linkedCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartRenameType(typeItem)}
                          className="p-1 text-[#64748b] hover:text-[#0f172a] rounded cursor-pointer"
                          title={`Rename ${typeItem}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAttemptDeleteType(typeItem)}
                          className="p-1 text-[#64748b] hover:text-[#dc2626] rounded cursor-pointer"
                          title={`Delete ${typeItem}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          2. PRODUCT CONCEPT & STABLE PHYSICAL SPECIFICATIONS
         ========================================== */}
      <div>
        <label
          htmlFor="product-copy-concept-textarea"
          className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
        >
          <Compass className="w-3.5 h-3.5 text-[#a21caf]" />
          <span>Product Concept / Theme / Origin</span>
        </label>
        <textarea
          id="product-copy-concept-textarea"
          rows={2}
          value={options.productConcept}
          onChange={(e) => updateOption('productConcept', e.target.value)}
          placeholder="e.g. Inspired by Galileo Galilei’s 1610 Sidereus Nuncius sketches of the moon and Jupiter's moons. Features gold debossed foil on midnight blue bookbinding cloth."
          className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] placeholder-[#94a3b8] resize-y"
        />
      </div>

      {/* Key Features */}
      <div>
        <label
          htmlFor="product-copy-features-textarea"
          className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-[#a21caf]" />
          <span>Key Features</span>
        </label>
        <textarea
          id="product-copy-features-textarea"
          rows={3}
          value={options.keyFeatures}
          onChange={(e) => updateOption('keyFeatures', e.target.value)}
          placeholder="e.g. 160 pages of fountain pen-friendly paper&#10;Lay-flat thread binding&#10;Silk ribbon page marker&#10;Elastic closure band"
          className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] placeholder-[#94a3b8] resize-y"
        />
      </div>

      {/* Materials & Dimensions (Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="product-copy-materials-textarea"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
          >
            <Package className="w-3.5 h-3.5 text-[#a21caf]" />
            <span>Materials</span>
          </label>
          <textarea
            id="product-copy-materials-textarea"
            rows={2}
            value={options.materials || ''}
            onChange={(e) => updateOption('materials', e.target.value)}
            placeholder="e.g. 120 GSM acid-free archival paper, woven linen bookcloth cover"
            className="w-full p-2.5 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] placeholder-[#94a3b8] resize-y"
          />
        </div>

        <div>
          <label
            htmlFor="product-copy-dimensions-textarea"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#a21caf]" />
            <span>Dimensions & Sizing</span>
          </label>
          <textarea
            id="product-copy-dimensions-textarea"
            rows={2}
            value={options.dimensions || ''}
            onChange={(e) => updateOption('dimensions', e.target.value)}
            placeholder="e.g. 5.5 × 8.25 inches (A5) or Unisex S–3XL"
            className="w-full p-2.5 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] placeholder-[#94a3b8] resize-y"
          />
        </div>
      </div>

      {/* ==========================================
          3. TARGET AUDIENCE, OCCASION & PERSONALIZATION
         ========================================== */}
      <div className="pt-3 border-t border-[#f1f5f9] space-y-4">
        <div>
          <label
            htmlFor="product-copy-audience-input"
            className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#a21caf]" />
            <span>Target Customer / Recipient Persona</span>
          </label>
          <input
            id="product-copy-audience-input"
            type="text"
            value={options.targetCustomer}
            onChange={(e) => updateOption('targetCustomer', e.target.value)}
            placeholder="e.g. Stargazers, writers, physics students, thoughtful gift seekers"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="product-copy-occasion-input"
              className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-[#a21caf]" />
              <span>Occasion / Gifting Context (Optional)</span>
            </label>
            <input
              id="product-copy-occasion-input"
              type="text"
              value={options.occasion || ''}
              onChange={(e) => updateOption('occasion', e.target.value)}
              placeholder="e.g. Graduation, Birthday, Lab Milestone, Holiday"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b]"
            />
          </div>

          <div>
            <label
              htmlFor="product-copy-personalization-input"
              className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a21caf]" />
              <span>Personalization / Custom Details (Optional)</span>
            </label>
            <input
              id="product-copy-personalization-input"
              type="text"
              value={options.personalization || ''}
              onChange={(e) => updateOption('personalization', e.target.value)}
              placeholder="e.g. Custom monogrammed initials, edition numbering"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b]"
            />
          </div>
        </div>
      </div>

      {/* ==========================================
          4. BRAND VOICE & TONE
         ========================================== */}
      <div>
        <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Sliders className="w-3.5 h-3.5 text-[#a21caf]" />
          Brand Voice & Tone
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tones.map((t) => {
            const isSelected = options.tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateOption('tone', t.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#a21caf] bg-[#fdf4ff] ring-1 ring-[#a21caf]'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                }`}
              >
                <p
                  className={`text-xs font-bold ${
                    isSelected ? 'text-[#a21caf]' : 'text-[#1e293b]'
                  }`}
                >
                  {t.label}
                </p>
                <p className="text-[10px] text-[#64748b] mt-0.5 leading-tight">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          5. ADDITIONAL INSTRUCTIONS
         ========================================== */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <label
          htmlFor="product-copy-additional-textarea"
          className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-[#a21caf]" />
          Additional Instructions (Optional)
        </label>
        <textarea
          id="product-copy-additional-textarea"
          rows={2}
          value={options.additionalInstructions || ''}
          onChange={(e) => updateOption('additionalInstructions', e.target.value)}
          placeholder="e.g. Include a suggested gift pairing note, emphasize fountain pen ink absorbency..."
          className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] text-[#1e293b] placeholder-[#94a3b8] resize-y"
        />
      </div>

      {/* Generate Prompt Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#a21caf] via-[#0284c7] to-[#0f766e] hover:from-[#86198f] hover:to-[#0f766e] hover:shadow-lg active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-fuchsia-200" />
          <span>Generate Product Copy Prompt</span>
        </button>
        <p className="text-center text-[11px] text-[#64748b] mt-2">
          Outputs a complete Shopify / Fourthwall product narrative, sensory features & specs prompt
        </p>
      </div>
    </div>
  );
};
