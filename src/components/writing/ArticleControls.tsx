import React from 'react';
import {
  FileText,
  Sparkles,
  Search,
  Compass,
  Sliders,
  Tag,
  Lightbulb,
  ListTree,
  PenTool,
  Wand2,
  Scissors,
} from 'lucide-react';
import {
  ArticleOptions,
  ArticleType,
  ArticleTone,
  ArticleSearchIntent,
  ArticleWorkflowTab,
} from '../../prompts/writing/types';
import { WritingStyleKey } from '../../prompts/writing/styles';
import { InternalLinksManager } from './InternalLinksManager';

interface ArticleControlsProps {
  options: ArticleOptions;
  onChange: (options: ArticleOptions) => void;
  onGenerate: () => void;
  onOpenStyleLibrary?: (tab?: WritingStyleKey) => void;
}

export const ArticleControls: React.FC<ArticleControlsProps> = ({
  options,
  onChange,
  onGenerate,
  onOpenStyleLibrary,
}) => {
  const activeTab = options.activeWorkflowTab || 'writing-article';

  const updateOption = <K extends keyof ArticleOptions>(
    key: K,
    value: ArticleOptions[K]
  ) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  const handleTabChange = (tab: ArticleWorkflowTab) => {
    onChange({
      ...options,
      activeWorkflowTab: tab,
    });
  };

  const articleTypes: { id: ArticleType; label: string; desc: string }[] = [
    { id: 'informational', label: 'Informational', desc: 'Deep dive into history, craft & science' },
    { id: 'how-to', label: 'How-to', desc: 'Sequential, beautiful practical guidance' },
    { id: 'explainer', label: 'Explainer', desc: 'Demystifying psychology & mechanics' },
    { id: 'advice', label: 'Advice', desc: 'Empathetic counsel on nuanced dilemmas' },
    { id: 'etiquette', label: 'Etiquette', desc: 'Contemporary gifting customs & manners' },
    { id: 'problem-solving', label: 'Problem-Solving', desc: 'Actionable solutions for real friction' },
  ];

  const tones: { id: ArticleTone; label: string }[] = [
    { id: 'conversational-editorial', label: 'Conversational Editorial' },
    { id: 'warm-helpful', label: 'Warm & Helpful' },
    { id: 'witty-refined', label: 'Witty but Refined' },
    { id: 'practical', label: 'Practical & Grounded' },
    { id: 'informational', label: 'Informational & Scholarly' },
    { id: 'authoritative', label: 'Authoritative Cultural Essay' },
  ];

  const searchIntents: { id: ArticleSearchIntent; label: string }[] = [
    { id: 'informational', label: 'Informational (Learning)' },
    { id: 'commercial-investigation', label: 'Commercial Investigation (Comparison)' },
    { id: 'how-to-guide', label: 'How-To Guide (Execution)' },
    { id: 'inspiration-ideas', label: 'Inspiration & Ideas (Browsing)' },
  ];

  return (
    <div className="space-y-6 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
      {/* Tool Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">
              Editorial Article Studio
            </h2>
            <p className="text-[11px] text-[#64748b]">
              Structured research, article writing, and humanizing editorial workflow
            </p>
          </div>
        </div>
      </div>

      {/* ARTICLE WORKFLOW NAVIGATION: RESEARCH -> WRITING -> EDITING */}
      <div className="p-1.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-1.5">
        <div className="grid grid-cols-3 gap-1.5">
          {/* RESEARCH CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase px-2 block">
              1. Research
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('research-angles')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'research-angles'
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="truncate">Angles</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('research-outline')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'research-outline'
                    ? 'bg-[#0284c7] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span className="truncate">Outline</span>
              </button>
            </div>
          </div>

          {/* WRITING CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#0f766e] tracking-wider uppercase px-2 block">
              2. Writing
            </span>
            <button
              type="button"
              onClick={() => handleTabChange('writing-article')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'writing-article'
                  ? 'bg-[#0f766e] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Article</span>
            </button>
          </div>

          {/* EDITING CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#a21caf] tracking-wider uppercase px-2 block">
              3. Editing
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('editing-humanize')}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'editing-humanize'
                    ? 'bg-[#a21caf] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
                }`}
              >
                <Wand2 className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Base Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('editing-tighten')}
                className={`py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'editing-tighten'
                    ? 'bg-[#a21caf] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
                }`}
              >
                <Scissors className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Tighten</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Style Directives Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f0fdfa] border border-[#ccfbf1] text-xs">
        <div className="flex items-center gap-2 text-[#0f766e]">
          <Sliders className="w-3.5 h-3.5 text-[#0f766e] flex-shrink-0" />
          <span className="text-[11px]">
            Active Style Rules: <strong className="font-semibold text-[#0f172a]">Global + Editorial Directives</strong>
          </span>
        </div>
        {onOpenStyleLibrary && (
          <button
            type="button"
            onClick={() => onOpenStyleLibrary('editorial')}
            className="text-[11px] font-semibold text-[#0f766e] hover:text-[#0d9488] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Edit Rules
          </button>
        )}
      </div>

      {/* ========================================== */}
      {/* TAB 1: RESEARCH - ANGLES                    */}
      {/* ========================================== */}
      {activeTab === 'research-angles' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd]">
            <h3 className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#0284c7]" />
              <span>Research Step 1: Explore 5 Editorial Angles</span>
            </h3>
            <p className="text-[11px] text-[#0369a1]/80 mt-0.5">
              Generates a prompt asking your LLM for 5 distinct, non-generic article perspectives focusing on insights and observations.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider block mb-1.5">
              Article Topic / Title Idea
            </label>
            <input
              type="text"
              value={options.topic}
              onChange={(e) => updateOption('topic', e.target.value)}
              placeholder="e.g. The Architecture of Memory: Why Physical Keepsakes Matter in a Digital Age"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Generate Angles Research Prompt</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: RESEARCH - OUTLINE                   */}
      {/* ========================================== */}
      {activeTab === 'research-outline' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 rounded-xl bg-[#f0f9ff] border border-[#bae6fd]">
            <h3 className="text-xs font-bold text-[#0369a1] flex items-center gap-1.5">
              <ListTree className="w-4 h-4 text-[#0284c7]" />
              <span>Research Step 2: Develop Loose Narrative Flow</span>
            </h3>
            <p className="text-[11px] text-[#0369a1]/80 mt-0.5">
              Generates a prompt for a loose, fluid narrative outline based on your selected angle without rigid, mechanical section lists.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider block mb-1.5">
              Selected Editorial Angle / Perspective
            </label>
            <textarea
              rows={3}
              value={options.researchAngleInput || options.articleAngle || ''}
              onChange={(e) => {
                updateOption('researchAngleInput', e.target.value);
                updateOption('articleAngle', e.target.value);
              }}
              placeholder="e.g. Victorian curiosity cabinets as pre-digital physical keepsakes reflecting tactile psychology..."
              className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b] placeholder-[#94a3b8] resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Generate Narrative Outline Prompt</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: WRITING - ARTICLE                    */}
      {/* ========================================== */}
      {activeTab === 'writing-article' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 1. Topic */}
          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">1</span>
              Article Topic / Title Idea
            </label>
            <input
              type="text"
              value={options.topic}
              onChange={(e) => updateOption('topic', e.target.value)}
              placeholder="e.g. The Architecture of Memory: Why Physical Keepsakes Matter in a Digital Age"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
            />
          </div>

          {/* 2. Intended Reader */}
          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">2</span>
              Intended Reader / Target Demographic
            </label>
            <input
              type="text"
              value={options.intendedReader}
              onChange={(e) => updateOption('intendedReader', e.target.value)}
              placeholder="e.g. Design-conscious intellectuals, culture writers, intentional shoppers"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
            />
          </div>

          {/* 3. Optional Angle & Loose Outline */}
          <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#0284c7]" />
                Optional Editorial Angle & Outline Guidance
              </span>
              <span className="text-[10px] text-[#64748b]">Used as editorial direction</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] block mb-1">
                Editorial Angle (Optional)
              </label>
              <input
                type="text"
                value={options.articleAngle || ''}
                onChange={(e) => updateOption('articleAngle', e.target.value)}
                placeholder="e.g. Victorian curiosity cabinets as pre-digital physical keepsakes"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#334155] block mb-1">
                Loose Narrative Outline (Optional)
              </label>
              <textarea
                rows={2}
                value={options.articleOutline || ''}
                onChange={(e) => updateOption('articleOutline', e.target.value)}
                placeholder="e.g. 1. Hook with Victorian memory boxes, 2. The tactile psychology of touch, 3. Synthesis..."
                className="w-full p-2.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b] resize-y"
              />
            </div>
          </div>

          {/* 4. Article Type Grid */}
          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Compass className="w-3.5 h-3.5 text-[#0284c7]" />
              Article Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {articleTypes.map((t) => {
                const isSelected = options.articleType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateOption('articleType', t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                    }`}
                  >
                    <p className={`text-xs font-bold ${isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'}`}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-[#64748b] mt-0.5 leading-tight">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tone & Search Intent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
            <div>
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#0284c7]" />
                Tone
              </label>
              <select
                value={options.tone}
                onChange={(e) => updateOption('tone', e.target.value as ArticleTone)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] bg-white text-[#1e293b]"
              >
                {tones.map((tone) => (
                  <option key={tone.id} value={tone.id}>
                    {tone.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Search className="w-3.5 h-3.5 text-[#0284c7]" />
                Search Intent
              </label>
              <select
                value={options.searchIntent}
                onChange={(e) => updateOption('searchIntent', e.target.value as ArticleSearchIntent)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] bg-white text-[#1e293b]"
              >
                {searchIntents.map((intent) => (
                  <option key={intent.id} value={intent.id}>
                    {intent.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. SEO Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
            <div>
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0284c7]" />
                Primary Keyword
              </label>
              <input
                type="text"
                value={options.primaryKeyword}
                onChange={(e) => updateOption('primaryKeyword', e.target.value)}
                placeholder="e.g. mindful gift giving"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0284c7]" />
                Secondary Keywords
              </label>
              <input
                type="text"
                value={options.secondaryKeywords}
                onChange={(e) => updateOption('secondaryKeywords', e.target.value)}
                placeholder="e.g. heirloom keepsakes, intentional gifts"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b]"
              />
            </div>
          </div>

          {/* 7. OPTIONAL INTERNAL LINKS */}
          <InternalLinksManager
            links={options.internalLinks || []}
            onChange={(links) => updateOption('internalLinks', links)}
            accentColor="sky"
          />

          {/* 8. Additional Instructions */}
          <div className="pt-4 border-t border-[#f1f5f9]">
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
              Additional Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={options.additionalInstructions || ''}
              onChange={(e) => updateOption('additionalInstructions', e.target.value)}
              placeholder="e.g. Include a historical reference to early Victorian curiosity cabinets, emphasize psychological studies on relational gratitude..."
              className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] text-[#1e293b] placeholder-[#94a3b8] resize-y"
            />
          </div>

          {/* Generate Prompt Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#0284c7] via-[#0f766e] to-[#0d9488] hover:from-[#0369a1] hover:to-[#0f766e] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Generate Article Prompt</span>
            </button>
            <p className="text-center text-[11px] text-[#64748b] mt-2">
              Creates an intellectually rich prompt structured like a Kinfolk or New Yorker essay
            </p>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: EDITING - BASE PROMPT (HUMANIZE)     */}
      {/* ========================================== */}
      {activeTab === 'editing-humanize' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 rounded-xl bg-[#fdf4ff] border border-[#f5d0fe]">
            <h3 className="text-xs font-bold text-[#a21caf] flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-[#a21caf]" />
              <span>Editing Step 1: Base Prompt (Humanize & Unstructure)</span>
            </h3>
            <p className="text-[11px] text-[#a21caf]/80 mt-0.5">
              Generates a prompt to rewrite draft text to vary sentence length, add natural prose rhythm, and remove generic AI structures.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider block mb-1.5">
              Draft Article Content to Humanize
            </label>
            <textarea
              rows={8}
              value={options.draftToEdit || ''}
              onChange={(e) => updateOption('draftToEdit', e.target.value)}
              placeholder="Paste your generated or written draft article here..."
              className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] font-mono text-[#1e293b] placeholder-[#94a3b8] resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#a21caf] to-[#701a75] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-200" />
              <span>Generate Base Editing Prompt</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: EDITING - TIGHTEN                    */}
      {/* ========================================== */}
      {activeTab === 'editing-tighten' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 rounded-xl bg-[#fdf4ff] border border-[#f5d0fe]">
            <h3 className="text-xs font-bold text-[#a21caf] flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-[#a21caf]" />
              <span>Editing Step 2: Tighten & Refine</span>
            </h3>
            <p className="text-[11px] text-[#a21caf]/80 mt-0.5">
              Generates a prompt to strip fluff, improve sentence precision, and tighten pacing without losing voice or personality.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider block mb-1.5">
              Draft Article Content to Tighten
            </label>
            <textarea
              rows={8}
              value={options.draftToEdit || ''}
              onChange={(e) => updateOption('draftToEdit', e.target.value)}
              placeholder="Paste your draft article here to tighten..."
              className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#a21caf] font-mono text-[#1e293b] placeholder-[#94a3b8] resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onGenerate}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-sm bg-gradient-to-r from-[#a21caf] to-[#701a75] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-200" />
              <span>Generate Tighten Prompt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
