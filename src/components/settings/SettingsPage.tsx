import React, { useState, useEffect } from 'react';
import {
  Camera,
  Gift,
  FileText,
  ShoppingBag,
  Database,
  Sliders,
  RotateCcw,
  Save,
  Download,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Search,
  CheckCircle2,
  FileCode,
  Eye,
  X,
} from 'lucide-react';
import { GeneratorId } from '../../prompts/templates/types';
import {
  GENERATOR_TEMPLATES_CONFIG,
  DEFAULT_PHOTOGRAPHY_SECTIONS,
  DEFAULT_GIFT_GUIDES_SECTIONS,
  DEFAULT_ARTICLES_SECTIONS,
  DEFAULT_PRODUCT_COPY_SECTIONS,
  DEFAULT_PRODUCT_DATA_SECTIONS,
} from '../../prompts/templates/defaults';
import {
  getTemplateSection,
  saveTemplateSection,
  resetTemplateSection,
  resetGeneratorTemplates,
  resetAllTemplates,
  isTemplateCustomized,
  countCustomizedTemplates,
  exportAllTemplatesAsJson,
  importTemplatesFromJson,
  TEMPLATES_UPDATED_EVENT,
} from '../../utils/templateManager';

interface SettingsPageProps {
  onBackToStudio?: () => void;
  onSelectGenerator?: (generator: GeneratorId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBackToStudio,
}) => {
  const [activeGenerator, setActiveGenerator] = useState<GeneratorId>('photography');
  const [sectionValues, setSectionValues] = useState<Record<string, string>>({});
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [filterCustomizedOnly, setFilterCustomizedOnly] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [savedSectionKey, setSavedSectionKey] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewSectionKey, setPreviewSectionKey] = useState<string | null>(null);

  const generatorList: { id: GeneratorId; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'photography',
      label: 'Product Photography',
      icon: <Camera className="w-4 h-4" />,
      count: Object.keys(DEFAULT_PHOTOGRAPHY_SECTIONS).length,
    },
    {
      id: 'giftGuides',
      label: 'Gift Guides',
      icon: <Gift className="w-4 h-4" />,
      count: Object.keys(DEFAULT_GIFT_GUIDES_SECTIONS).length,
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: <FileText className="w-4 h-4" />,
      count: Object.keys(DEFAULT_ARTICLES_SECTIONS).length,
    },
    {
      id: 'productCopy',
      label: 'Product Copy',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: Object.keys(DEFAULT_PRODUCT_COPY_SECTIONS).length,
    },
    {
      id: 'productData',
      label: 'Product Data',
      icon: <Database className="w-4 h-4" />,
      count: Object.keys(DEFAULT_PRODUCT_DATA_SECTIONS).length,
    },
  ];

  // Load current values for the active generator
  const loadGeneratorValues = (genId: GeneratorId) => {
    const config = GENERATOR_TEMPLATES_CONFIG[genId];
    if (!config) return;
    const values: Record<string, string> = {};
    for (const key of Object.keys(config.sections)) {
      values[key] = getTemplateSection(genId, key);
    }
    setSectionValues(values);
  };

  useEffect(() => {
    loadGeneratorValues(activeGenerator);
  }, [activeGenerator]);

  // Listen to external template updates
  useEffect(() => {
    const handleUpdate = () => {
      loadGeneratorValues(activeGenerator);
    };
    window.addEventListener(TEMPLATES_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(TEMPLATES_UPDATED_EVENT, handleUpdate);
    };
  }, [activeGenerator]);

  const showStatus = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  const handleTextChange = (key: string, value: string) => {
    setSectionValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSection = (key: string) => {
    const value = sectionValues[key];
    if (value !== undefined) {
      saveTemplateSection(activeGenerator, key, value);
      setSavedSectionKey(key);
      setTimeout(() => setSavedSectionKey(null), 2000);
      showStatus(`Saved "${GENERATOR_TEMPLATES_CONFIG[activeGenerator].metadata[key]?.label || key}" template.`, 'success');
    }
  };

  const handleResetSection = (key: string) => {
    resetTemplateSection(activeGenerator, key);
    const defaultValue = GENERATOR_TEMPLATES_CONFIG[activeGenerator].sections[key];
    setSectionValues((prev) => ({
      ...prev,
      [key]: defaultValue,
    }));
    showStatus(`Restored "${GENERATOR_TEMPLATES_CONFIG[activeGenerator].metadata[key]?.label || key}" to default.`, 'info');
  };

  const handleResetGenerator = () => {
    if (window.confirm(`Are you sure you want to reset all templates for ${GENERATOR_TEMPLATES_CONFIG[activeGenerator].label} back to built-in defaults?`)) {
      resetGeneratorTemplates(activeGenerator);
      loadGeneratorValues(activeGenerator);
      showStatus(`All templates for ${GENERATOR_TEMPLATES_CONFIG[activeGenerator].label} restored to default.`, 'info');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset ALL templates across all 5 generators to built-in defaults?')) {
      resetAllTemplates();
      loadGeneratorValues(activeGenerator);
      showStatus('All prompt templates restored to built-in defaults.', 'info');
    }
  };

  const handleExportBackup = () => {
    const jsonString = exportAllTemplatesAsJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `science-of-gifts-prompt-templates-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Exported prompt templates JSON backup.', 'success');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const result = importTemplatesFromJson(text);
          if (result.success) {
            loadGeneratorValues(activeGenerator);
            showStatus(result.message, 'success');
          } else {
            showStatus(result.message, 'error');
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const currentConfig = GENERATOR_TEMPLATES_CONFIG[activeGenerator];
  const totalCustomizedAll = countCustomizedTemplates();
  const currentGenCustomized = isTemplateCustomized(activeGenerator);

  // Filter sections based on search and customized filter
  const filteredSectionKeys = Object.keys(currentConfig.sections).filter((key) => {
    const meta = currentConfig.metadata[key];
    const text = sectionValues[key] || '';
    const isCustom = isTemplateCustomized(activeGenerator, key);

    if (filterCustomizedOnly && !isCustom) return false;

    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const matchLabel = meta?.label?.toLowerCase().includes(q);
      const matchDesc = meta?.description?.toLowerCase().includes(q);
      const matchContent = text.toLowerCase().includes(q);
      return matchLabel || matchDesc || matchContent;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Settings Top Hero Banner */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#f0fdfa] via-[#f0f9ff] to-transparent pointer-events-none rounded-bl-full -z-0 opacity-70" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] border border-[#a7f3d0] flex items-center justify-center text-[#0f766e] shadow-2xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] font-editorial">
                  Studio Settings & Prompt Templates
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b]">
                  Customize the underlying instructional rules and schema prompts without modifying source code
                </p>
              </div>
            </div>
          </div>

          {/* Backup & Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] shadow-2xs transition-all cursor-pointer"
              title="Export all customizable templates as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Export Backup</span>
            </button>

            <button
              type="button"
              onClick={handleImportBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#0f172a] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] shadow-2xs transition-all cursor-pointer"
              title="Import customized templates from JSON backup"
            >
              <Upload className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Import JSON</span>
            </button>

            {totalCustomizedAll > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] shadow-2xs transition-all cursor-pointer"
                title="Reset all prompt templates across all generators to built-in defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#dc2626]" />
                <span>Reset All ({totalCustomizedAll})</span>
              </button>
            )}

            {onBackToStudio && (
              <button
                type="button"
                onClick={onBackToStudio}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-xs transition-all cursor-pointer"
              >
                <span>Back to Studio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Toast / Notice Bar */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
                : statusMessage.type === 'error'
                ? 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
                : 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-[#dc2626]" />}
              {statusMessage.type === 'info' && <Info className="w-4 h-4 text-[#0284c7]" />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Generator Selection */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b] px-3 py-2 flex items-center justify-between">
              <span>Prompt Templates</span>
              <span className="text-[10px] lowercase font-normal bg-[#f1f5f9] px-2 py-0.5 rounded-full text-[#475569]">
                5 generators
              </span>
            </h2>

            <div className="space-y-1.5 mt-2">
              {generatorList.map((gen) => {
                const isActive = activeGenerator === gen.id;
                const isCustom = isTemplateCustomized(gen.id);

                return (
                  <button
                    key={gen.id}
                    type="button"
                    onClick={() => {
                      setActiveGenerator(gen.id);
                      setActiveSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f0fdfa] text-[#0f766e] font-semibold border border-[#99f6e4] shadow-xs'
                        : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? 'bg-[#0f766e] text-white'
                            : 'bg-[#f1f5f9] text-[#64748b]'
                        }`}
                      >
                        {gen.icon}
                      </div>
                      <div>
                        <div className="font-semibold">{gen.label}</div>
                        <div className="text-[10px] text-[#64748b] font-normal">
                          {gen.count} customizable sections
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCustom && (
                        <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-bold">
                          Modified
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#0f766e]' : 'text-[#cbd5e1]'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architectural Notes Card */}
          <div className="bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] p-4 text-xs text-[#64748b] space-y-2.5">
            <div className="flex items-center gap-2 text-[#0f172a] font-semibold">
              <Info className="w-4 h-4 text-[#0f766e]" />
              <span>Prompt Architecture</span>
            </div>
            <p className="leading-relaxed">
              When you generate a prompt in the Studio, the app dynamically combines your <strong>Customizable Template Instructions</strong> with your <strong>Active Form Options & User Inputs</strong>.
            </p>
            <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0] font-mono text-[11px] text-[#0f766e]">
              [Template Instructions] + [Dynamic Option Values] = [Generated Prompt]
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              All edits are saved locally to your browser's persistent storage and apply immediately to newly generated prompts.
            </p>
          </div>
        </div>

        {/* Right Content Area: Sections Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Generator Header Bar */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#0f172a] font-editorial">
                  {currentConfig.label}
                </h2>
                {currentGenCustomized ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-bold">
                    Customized
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-[10px] font-semibold">
                    Built-in Defaults
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b] mt-1">
                {currentConfig.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentGenCustomized && (
                <button
                  type="button"
                  onClick={handleResetGenerator}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] transition-all cursor-pointer"
                  title="Reset this generator's templates to default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Generator</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={activeSearch}
                onChange={(e) => setActiveSearch(e.target.value)}
                placeholder={`Search ${currentConfig.label} sections...`}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => setActiveSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterCustomizedOnly(!filterCustomizedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filterCustomizedOnly
                  ? 'bg-[#0f766e] text-white shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modified Only</span>
            </button>
          </div>

          {/* Section Editors List */}
          {filteredSectionKeys.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#64748b] space-y-2">
              <FileCode className="w-8 h-8 text-[#94a3b8] mx-auto" />
              <p className="text-sm font-semibold text-[#0f172a]">No sections match your search</p>
              <p className="text-xs">Try clearing the search query or filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSectionKeys.map((sectionKey, index) => {
                const metadata = currentConfig.metadata[sectionKey] || {
                  id: sectionKey,
                  label: sectionKey,
                  description: '',
                  category: activeGenerator,
                };
                const currentValue = sectionValues[sectionKey] || '';
                const defaultValue = currentConfig.sections[sectionKey] || '';
                const isCustomized = isTemplateCustomized(activeGenerator, sectionKey);
                const isSaved = savedSectionKey === sectionKey;
                const isModifiedFromDefault = currentValue.trim() !== defaultValue.trim();

                return (
                  <div
                    key={sectionKey}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isCustomized
                        ? 'border-[#fde68a] shadow-xs ring-1 ring-[#fef3c7]'
                        : 'border-[#e2e8f0] shadow-2xs hover:border-[#cbd5e1]'
                    }`}
                  >
                    {/* Section Card Header */}
                    <div className="p-4 sm:p-5 border-b border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white to-[#f8fafc]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f1f5f9] text-[#64748b] text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <h3 className="text-sm font-bold text-[#0f172a]">
                            {metadata.label}
                          </h3>
                          {isCustomized ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-bold">
                              Customized
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-[10px] font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        {metadata.description && (
                          <p className="text-xs text-[#64748b] pl-7">
                            {metadata.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pl-7 sm:pl-0">
                        {isCustomized && (
                          <button
                            type="button"
                            onClick={() => handleResetSection(sectionKey)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:text-[#b91c1c] hover:bg-[#fef2f2] border border-[#e2e8f0] transition-all cursor-pointer"
                            title="Reset this section back to built-in default"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSaveSection(sectionKey)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-[#16a34a] text-white'
                              : 'bg-[#0f766e] hover:bg-[#115e59] text-white'
                          }`}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Saved' : 'Save Section'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Card Content / Textarea */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="relative">
                        <textarea
                          rows={Math.min(18, Math.max(5, currentValue.split('\n').length + 1))}
                          value={currentValue}
                          onChange={(e) => handleTextChange(sectionKey, e.target.value)}
                          className="w-full p-3.5 bg-[#fafafa] focus:bg-white border border-[#e2e8f0] focus:border-[#0f766e] rounded-xl text-xs font-mono text-[#1e293b] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all resize-y"
                          placeholder="Enter template instructions..."
                          spellCheck={false}
                        />
                      </div>

                      {/* Footer Stats & Helper */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#94a3b8] gap-2 pt-1">
                        <div className="flex items-center gap-3">
                          <span>{currentValue.length} characters</span>
                          <span>•</span>
                          <span>{currentValue.trim().split(/\s+/).filter(Boolean).length} words</span>
                          <span>•</span>
                          <span>{currentValue.split('\n').length} lines</span>
                        </div>

                        {isModifiedFromDefault && !isCustomized && (
                          <span className="text-[#d97706] font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unsaved edits (click Save Section)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
