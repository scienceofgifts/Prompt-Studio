import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  RotateCcw,
  Save,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  MerchandiseCategory,
  MerchandiseDefaultBackground,
  MerchandiseProductProfile,
} from '../../designToProduct/types';
import {
  D2P_PROFILES_UPDATED_EVENT,
  addCustomMerchandiseProfile,
  deleteCustomMerchandiseProfile,
  getMerchandiseProfiles,
  isMerchandiseProfileCustomized,
  resetAllMerchandiseProfileCustomizations,
  resetBuiltInProfileOverride,
  saveMerchandiseProfile,
} from '../../designToProduct/profileManager';

interface MerchandiseProfilesSettingsPanelProps {
  onStatusNotice?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORY_LABELS: Record<MerchandiseCategory, string> = {
  apparel: 'Apparel',
  drinkware: 'Drinkware',
  'paper-wall-art': 'Paper & Wall Art',
  'desk-accessories': 'Desk & Accessories',
  other: 'Other',
};

const EMPTY_NEW_PROFILE = {
  name: '',
  category: 'other' as MerchandiseCategory,
  typicalOrientation: 'flexible' as MerchandiseProductProfile['typicalOrientation'],
  defaultBackgroundTreatment: 'context-dependent' as MerchandiseDefaultBackground,
  preferredComposition: '',
  printSurfaceCharacteristics: '',
  supportedProductColors: '',
  printingMethod: '',
  colorAndContrastConsiderations: '',
  recommendedDesignAdjustments: '',
  exactPrintSpecifications: '',
  additionalInstructions: '',
};

export const MerchandiseProfilesSettingsPanel: React.FC<MerchandiseProfilesSettingsPanelProps> = ({
  onStatusNotice,
}) => {
  const [profiles, setProfiles] = useState<MerchandiseProductProfile[]>(() =>
    getMerchandiseProfiles()
  );
  const [categoryFilter, setCategoryFilter] = useState<'all' | MerchandiseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, MerchandiseProductProfile>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  // New custom product modal / panel state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_NEW_PROFILE);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setProfiles(getMerchandiseProfiles());
    };
    window.addEventListener(D2P_PROFILES_UPDATED_EVENT, sync);
    return () => window.removeEventListener(D2P_PROFILES_UPDATED_EVENT, sync);
  }, []);

  const openEditor = (profile: MerchandiseProductProfile) => {
    if (expandedId === profile.id) {
      setExpandedId(null);
      return;
    }
    setDrafts((prev) => ({
      ...prev,
      [profile.id]: {
        ...profile,
        supportedProductColors: [...profile.supportedProductColors],
      },
    }));
    setExpandedId(profile.id);
  };

  const updateDraft = <K extends keyof MerchandiseProductProfile>(
    id: string,
    field: K,
    value: MerchandiseProductProfile[K]
  ) => {
    setDrafts((prev) => {
      const base =
        prev[id] || profiles.find((p) => p.id === id);
      if (!base) return prev;
      return {
        ...prev,
        [id]: {
          ...base,
          [field]: value,
        },
      };
    });
  };

  const handleSave = (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    const res = saveMerchandiseProfile(id, draft);
    if (!res.success) {
      onStatusNotice?.(res.error || 'Could not save product profile.', 'error');
      return;
    }
    setProfiles(getMerchandiseProfiles());
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
    onStatusNotice?.(`Saved merchandise profile "${draft.name}".`, 'success');
  };

  const handleResetBuiltIn = (id: string, name: string) => {
    resetBuiltInProfileOverride(id);
    const updatedList = getMerchandiseProfiles();
    setProfiles(updatedList);
    const fresh = updatedList.find((p) => p.id === id);
    if (fresh) {
      setDrafts((prev) => ({
        ...prev,
        [id]: { ...fresh, supportedProductColors: [...fresh.supportedProductColors] },
      }));
    }
    onStatusNotice?.(`Restored "${name}" to built-in default profile.`, 'info');
  };

  const handleDeleteCustom = (id: string, name: string) => {
    if (deleteCustomMerchandiseProfile(id)) {
      setProfiles(getMerchandiseProfiles());
      if (expandedId === id) setExpandedId(null);
      onStatusNotice?.(`Deleted custom product profile "${name}".`, 'info');
    }
  };

  const handleResetAll = () => {
    resetAllMerchandiseProfileCustomizations();
    setProfiles(getMerchandiseProfiles());
    setDrafts({});
    setExpandedId(null);
    onStatusNotice?.('Restored all merchandise profiles to built-in defaults.', 'info');
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const colors = newForm.supportedProductColors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = addCustomMerchandiseProfile({
      name: newForm.name,
      category: newForm.category,
      typicalOrientation: newForm.typicalOrientation,
      defaultBackgroundTreatment: newForm.defaultBackgroundTreatment,
      preferredComposition: newForm.preferredComposition,
      printSurfaceCharacteristics: newForm.printSurfaceCharacteristics,
      supportedProductColors: colors,
      printingMethod: newForm.printingMethod,
      colorAndContrastConsiderations: newForm.colorAndContrastConsiderations,
      recommendedDesignAdjustments: newForm.recommendedDesignAdjustments,
      exactPrintSpecifications: newForm.exactPrintSpecifications,
      additionalInstructions: newForm.additionalInstructions,
    });

    if (!res.success || !res.profile) {
      setAddError(res.error || 'Could not add custom product profile.');
      return;
    }

    setProfiles(getMerchandiseProfiles());
    setNewForm(EMPTY_NEW_PROFILE);
    setShowAddForm(false);
    setExpandedId(res.profile.id);
    onStatusNotice?.(`Added new custom product profile "${res.profile.name}".`, 'success');
  };

  const customizedOrCustomCount = profiles.filter(
    (p) => p.isCustom || isMerchandiseProfileCustomized(p.id)
  ).length;

  const filtered = profiles.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.preferredComposition.toLowerCase().includes(q) ||
        p.printingMethod.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category].toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0f766e]" />
            <h2 className="text-lg font-bold text-[#0f172a] font-editorial">
              Merchandise Product Profiles
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[10px] font-bold">
              {profiles.length} products
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Customize print surface notes, transparency defaults, printing methods, or exact specs for Design to Product, or add new merchandise blanks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customizedOrCustomCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Customizations</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowAddForm((prev) => !prev);
              setAddError(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-xs transition-all cursor-pointer"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'Cancel' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Add New Custom Product Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddCustom}
          className="bg-white rounded-2xl border border-[#99f6e4] p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <h3 className="text-sm font-bold text-[#0f172a]">Add Custom Merchandise Product</h3>
            <span className="text-[11px] text-[#0f766e] font-medium">
              Immediately available in recommendations & dropdowns
            </span>
          </div>

          {addError && (
            <div className="p-2.5 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={newForm.name}
                onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Enamel Camp Mug or Throw Blanket"
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Category
              </label>
              <select
                value={newForm.category}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, category: e.target.value as MerchandiseCategory }))
                }
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Typical Orientation
              </label>
              <select
                value={newForm.typicalOrientation}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    typicalOrientation: e.target.value as MerchandiseProductProfile['typicalOrientation'],
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              >
                <option value="vertical">Vertical</option>
                <option value="square">Square</option>
                <option value="horizontal">Horizontal</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Default Background Treatment
              </label>
              <select
                value={newForm.defaultBackgroundTreatment}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    defaultBackgroundTreatment: e.target.value as MerchandiseDefaultBackground,
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              >
                <option value="transparent">Transparent PNG</option>
                <option value="full-background">Full Background</option>
                <option value="context-dependent">Context-Dependent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Preferred Composition
              </label>
              <textarea
                rows={2}
                value={newForm.preferredComposition}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, preferredComposition: e.target.value }))
                }
                placeholder="How artwork should be framed or placed..."
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                Supported Product Colors (comma-separated)
              </label>
              <input
                type="text"
                value={newForm.supportedProductColors}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, supportedProductColors: e.target.value }))
                }
                placeholder="e.g., Black, Cream, Forest Green"
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
              <label className="block text-[11px] font-semibold text-[#334155] mt-2 mb-1">
                Printing Method
              </label>
              <input
                type="text"
                value={newForm.printingMethod}
                onChange={(e) => setNewForm((p) => ({ ...p, printingMethod: e.target.value }))}
                placeholder="e.g., Sublimation wrap, DTG, Laser engraving"
                className="w-full px-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, print method, or guidance..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
              categoryFilter === 'all'
                ? 'bg-[#0f766e] text-white'
                : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
            }`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_LABELS) as MerchandiseCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                categoryFilter === cat
                  ? 'bg-[#0f766e] text-white'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filtered.map((profile) => {
          const isExpanded = expandedId === profile.id;
          const isCustomOverride = isMerchandiseProfileCustomized(profile.id);
          const draft = drafts[profile.id] || profile;
          const isSaved = savedId === profile.id;

          return (
            <div
              key={profile.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isCustomOverride || profile.isCustom
                  ? 'border-[#fde68a] shadow-xs'
                  : 'border-[#e2e8f0] shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => openEditor(profile)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[#f8fafc]/70 transition-colors cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#0f172a]">{profile.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[10px] font-semibold">
                      {CATEGORY_LABELS[profile.category]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] text-[10px] font-medium">
                      {profile.defaultBackgroundTreatment.replace('-', ' ')}
                    </span>
                    {profile.isCustom ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] text-[10px] font-bold">
                        Custom Product
                      </span>
                    ) : isCustomOverride ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-bold">
                        Modified
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#64748b] truncate">
                    {profile.preferredComposition}
                  </p>
                </div>

                <div className="shrink-0 text-[#64748b]">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-[#f1f5f9] bg-[#fafafa] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => updateDraft(profile.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                          Category
                        </label>
                        <select
                          value={draft.category}
                          onChange={(e) =>
                            updateDraft(
                              profile.id,
                              'category',
                              e.target.value as MerchandiseCategory
                            )
                          }
                          className="w-full px-2.5 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                        >
                          {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                          Default Background
                        </label>
                        <select
                          value={draft.defaultBackgroundTreatment}
                          onChange={(e) =>
                            updateDraft(
                              profile.id,
                              'defaultBackgroundTreatment',
                              e.target.value as MerchandiseDefaultBackground
                            )
                          }
                          className="w-full px-2.5 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                        >
                          <option value="transparent">Transparent</option>
                          <option value="full-background">Full Background</option>
                          <option value="context-dependent">Context-Dependent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Preferred Composition
                      </label>
                      <textarea
                        rows={2}
                        value={draft.preferredComposition}
                        onChange={(e) =>
                          updateDraft(profile.id, 'preferredComposition', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Print Surface Characteristics
                      </label>
                      <textarea
                        rows={2}
                        value={draft.printSurfaceCharacteristics}
                        onChange={(e) =>
                          updateDraft(profile.id, 'printSurfaceCharacteristics', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Supported Product Colors (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={draft.supportedProductColors.join(', ')}
                        onChange={(e) =>
                          updateDraft(
                            profile.id,
                            'supportedProductColors',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Printing Method
                      </label>
                      <input
                        type="text"
                        value={draft.printingMethod}
                        onChange={(e) => updateDraft(profile.id, 'printingMethod', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Color & Contrast Considerations
                      </label>
                      <textarea
                        rows={2}
                        value={draft.colorAndContrastConsiderations}
                        onChange={(e) =>
                          updateDraft(profile.id, 'colorAndContrastConsiderations', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Recommended Design Adjustments
                      </label>
                      <textarea
                        rows={2}
                        value={draft.recommendedDesignAdjustments}
                        onChange={(e) =>
                          updateDraft(profile.id, 'recommendedDesignAdjustments', e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Exact Print Specifications (optional — e.g. verified px/DPI)
                      </label>
                      <input
                        type="text"
                        value={draft.exactPrintSpecifications || ''}
                        onChange={(e) =>
                          updateDraft(profile.id, 'exactPrintSpecifications', e.target.value)
                        }
                        placeholder="Add verified supplier print area or dimensions if known"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] mb-1">
                        Additional Prompt Instructions (optional)
                      </label>
                      <input
                        type="text"
                        value={draft.additionalInstructions || ''}
                        onChange={(e) =>
                          updateDraft(profile.id, 'additionalInstructions', e.target.value)
                        }
                        placeholder="Any extra rule injected into generated prompts"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0f766e]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e2e8f0]">
                    <div>
                      {profile.isCustom ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(profile.id, profile.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] border border-[#fecaca] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Custom Product</span>
                        </button>
                      ) : isCustomOverride ? (
                        <button
                          type="button"
                          onClick={() => handleResetBuiltIn(profile.id, profile.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#b91c1c] hover:bg-[#fef2f2] border border-[#e2e8f0] cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset to Default</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8]">
                          Built-in profile
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave(profile.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-[#16a34a]'
                          : 'bg-[#0f766e] hover:bg-[#115e59]'
                      }`}
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{isSaved ? 'Saved' : 'Save Profile'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
