import React from 'react';
import {
  Sparkles,
  Layers,
  Compass,
  Palette,
  LayoutGrid,
  Info,
  Sliders,
  FileText,
} from 'lucide-react';
import {
  GenerationSettings,
  ProductType,
  ProductOrientation,
  BackgroundStyle,
  SurfaceStyle,
  PropsStyle,
  AspectRatio,
  imagePromptTemplates,
} from '../types';

interface ConfigurationControlsProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
  onGenerate: () => void;
  hasImage: boolean;
}

export const ConfigurationControls: React.FC<ConfigurationControlsProps> = ({
  settings,
  onChange,
  onGenerate,
  hasImage,
}) => {
  const updateSetting = <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const productTypes: { id: ProductType; label: string; icon: string }[] = [
    { id: 'mug', label: 'Mug', icon: '☕' },
    { id: 'tshirt', label: 'T-shirt', icon: '👕' },
    { id: 'hoodie', label: 'Hoodie', icon: '🧥' },
    { id: 'notebook', label: 'Notebook', icon: '📓' },
    { id: 'glass', label: 'Glass', icon: '🥛' },
    { id: 'waterBottle', label: 'Water bottle', icon: '🧴' },
    { id: 'tumbler', label: 'Tumbler', icon: '🥤' },
    { id: 'poster', label: 'Poster', icon: '🖼️' },
    { id: 'other', label: 'Other', icon: '✨' },
  ];

  const orientations: { id: ProductOrientation; label: string; desc: string }[] = [
    { id: 'upright', label: 'Upright', desc: 'Eye-level / hero orientation' },
    { id: 'folded', label: 'Folded', desc: 'Neat retail fold & drape' },
    { id: 'flat-lay', label: 'Flat-lay', desc: 'Direct 90° top-down layout' },
    { id: 'naturally-arranged', label: 'Naturally arranged', desc: 'Organic, relaxed editorial posture' },
  ];

  const backgrounds: {
    id: BackgroundStyle;
    label: string;
    desc: string;
    swatchClass: string;
  }[] = [
    {
      id: 'neutral-editorial',
      label: 'Neutral Editorial',
      desc: 'Light neutral studio environment with clean, understated background',
      swatchClass: 'bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] border-[#cbd5e1]',
    },
    {
      id: 'science-gradient',
      label: 'Science of Gifts Gradient',
      desc: 'Soft blue-to-mint gradient studio backdrop with photographic lighting',
      swatchClass: 'bg-gradient-to-br from-[#bfdbfe] via-[#ccfbf1] to-[#a7f3d0] border-[#93c5fd]',
    },
    {
      id: 'gradient-wall-neutral-surface',
      label: 'Gradient Wall + Neutral Surface',
      desc: 'Gradient studio wall above, realistic neutral tabletop surface below',
      swatchClass: 'bg-gradient-to-b from-[#bfdbfe] via-[#ccfbf1] to-[#e2e8f0] border-[#93c5fd]',
    },
    {
      id: 'blue-wall-neutral-surface',
      label: 'Blue Wall + Neutral Surface',
      desc: 'Realistic soft muted blue backwall with neutral physical tabletop',
      swatchClass: 'bg-gradient-to-b from-[#bae6fd] to-[#e2e8f0] border-[#7dd3fc]',
    },
    {
      id: 'mint-wall-neutral-surface',
      label: 'Mint Wall + Neutral Surface',
      desc: 'Realistic soft seafoam mint backwall with neutral physical tabletop',
      swatchClass: 'bg-gradient-to-b from-[#a7f3d0] to-[#e2e8f0] border-[#6ee7b7]',
    },
    {
      id: 'branded-editorial-environment',
      label: 'Branded Editorial Environment',
      desc: 'Ambient blue & mint palette woven subtly into real architectural depth',
      swatchClass: 'bg-gradient-to-br from-[#e0f2fe] via-[#f1f5f9] to-[#d1fae5] border-[#94a3b8]',
    },
    {
      id: 'dark-editorial',
      label: 'Dark Editorial',
      desc: 'Sophisticated darker studio with sculpted key lighting & velvety shadows',
      swatchClass: 'bg-gradient-to-br from-[#334155] to-[#0f172a] border-[#1e293b]',
    },
    {
      id: 'custom',
      label: 'Custom',
      desc: 'Described via Additional Instructions field below',
      swatchClass: 'bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9] border-[#94a3b8] border-dashed',
    },
  ];

  const surfaces: { id: SurfaceStyle; label: string; desc: string }[] = [
    { id: 'editorial-tabletop', label: 'Editorial tabletop', desc: 'Honed travertine or natural pale oak' },
    { id: 'light-stone', label: 'Light stone surface', desc: 'Pale limestone or architectural concrete' },
    { id: 'dark-matte', label: 'Dark matte surface', desc: 'Deep charcoal slate or matte stone' },
    { id: 'soft-fabric', label: 'Soft fabric surface', desc: 'Heavyweight unbleached draped linen' },
    { id: 'no-visible-surface', label: 'No visible surface', desc: 'Seamlessly floating in negative space' },
  ];

  const propsOptions: { id: PropsStyle; label: string; desc: string }[] = [
    { id: 'none', label: 'None', desc: 'Pure hero product alone in clean space' },
    { id: 'minimal-subtle', label: 'Minimal subtle props', desc: 'Single dried botanical stem or pale ceramic block' },
    { id: 'subtle-historical', label: 'Subtle historical props', desc: 'Vintage brass caliper or celestial chart fragment' },
    { id: 'books-ephemera', label: 'Books and paper ephemera', desc: 'Antique cloth-bound volumes or deckle-edge paper' },
    { id: 'seasonal-subtle', label: 'Seasonal subtle props', desc: 'Refined eucalyptus pods, pressed leaves, or pine' },
  ];

  const aspectRatios: { id: AspectRatio; label: string; ratioDesc: string; shapeClass: string }[] = [
    { id: '1:1', label: '1:1', ratioDesc: 'Square / E-commerce', shapeClass: 'w-5 h-5' },
    { id: '4:5', label: '4:5', ratioDesc: 'Editorial Portrait', shapeClass: 'w-4 h-5' },
    { id: '3:2', label: '3:2', ratioDesc: 'Classic Catalog', shapeClass: 'w-6 h-4' },
    { id: '16:9', label: '16:9', ratioDesc: 'Widescreen Banner', shapeClass: 'w-7 h-4' },
  ];

  return (
    <div className="space-y-6 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
      {/* 1. Product Type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">1</span>
            Product Type
          </label>
          <span className="text-[11px] text-[#64748b]">Select product category</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {productTypes.map((item) => {
            const isSelected = settings.productType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting('productType', item.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0369a1] font-semibold ring-1 ring-[#0284c7]'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white text-[#334155]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-xs truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom product type field if "other" is chosen */}
        {settings.productType === 'other' && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Specify custom product: e.g. Brass bookmark, enamel pin, canvas tote..."
              value={settings.customProductType || ''}
              onChange={(e) => updateSetting('customProductType', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
            />
          </div>
        )}

        {/* Dynamic Editorial Guidance Badge */}
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-start gap-2 text-[11px] text-[#475569]">
          <Info className="w-3.5 h-3.5 text-[#0284c7] mt-0.5 flex-shrink-0" />
          <span>
            {imagePromptTemplates[settings.productType]?.uiGuidance ||
              imagePromptTemplates.other.uiGuidance}
          </span>
        </div>
      </div>

      {/* 2. Product Orientation */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">2</span>
            Product Orientation
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
          {orientations.map((item) => {
            const isSelected = settings.orientation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting('orientation', item.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                }`}
              >
                <p className={`text-xs font-bold ${isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-[#64748b] mt-0.5 leading-tight">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Background Style */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">3</span>
            Background Style
          </label>
          <span className="text-[11px] text-[#64748b]">Atmospheric setting</span>
        </div>

        <div className="space-y-2">
          {backgrounds.map((bg) => {
            const isSelected = settings.background === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => updateSetting('background', bg.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg border flex-shrink-0 shadow-xs ${bg.swatchClass}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'}`}>
                    {bg.label}
                  </p>
                  <p className="text-[10px] text-[#64748b] mt-0.5 truncate">
                    {bg.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {settings.background === 'custom' && (
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-[#f0f9ff] border border-[#bae6fd] text-[11px] text-[#0369a1] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7] flex-shrink-0" />
            <span>Describe your custom background in the <strong>Additional Instructions</strong> field below.</span>
          </div>
        )}
      </div>

      {/* 4. Surface & 5. Props (Split Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
        {/* Surface */}
        <div>
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">4</span>
            Surface
          </label>
          <div className="space-y-1.5">
            {surfaces.map((s) => {
              const isSelected = settings.surface === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateSetting('surface', s.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0369a1] font-semibold ring-1 ring-[#0284c7]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white text-[#334155]'
                  }`}
                >
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Props */}
        <div>
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">5</span>
            Props
          </label>
          <div className="space-y-1.5">
            {propsOptions.map((p) => {
              const isSelected = settings.props === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateSetting('props', p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0369a1] font-semibold ring-1 ring-[#0284c7]'
                      : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white text-[#334155]'
                  }`}
                >
                  <span className="text-xs font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Aspect Ratio */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold flex items-center justify-center">6</span>
            Aspect Ratio
          </label>
          <span className="text-[11px] text-[#64748b]">Composition framing</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {aspectRatios.map((item) => {
            const isSelected = settings.aspectRatio === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting('aspectRatio', item.id)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] bg-white'
                }`}
              >
                <div
                  className={`border-2 rounded-xs transition-colors ${
                    isSelected ? 'border-[#0284c7] bg-[#bae6fd]' : 'border-[#94a3b8] bg-[#f1f5f9]'
                  } ${item.shapeClass}`}
                />
                <span className={`text-xs font-bold ${isSelected ? 'text-[#0369a1]' : 'text-[#1e293b]'}`}>
                  {item.label}
                </span>
                <span className="text-[9px] text-[#64748b] leading-none">
                  {item.ratioDesc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Additional Instructions */}
      <div className="pt-4 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
            Additional Instructions (Optional)
          </label>
          <span className="text-[11px] text-[#64748b]">Free-text notes</span>
        </div>

        <textarea
          rows={3}
          placeholder="e.g. Focus sharply on the gold foil title, subtle evening raking light from the top-left, emphasize the ribbed collar texture..."
          value={settings.additionalInstructions}
          onChange={(e) => updateSetting('additionalInstructions', e.target.value)}
          className="w-full p-3 text-xs rounded-xl border border-[#cbd5e1] focus:outline-hidden focus:ring-2 focus:ring-[#0284c7] focus:border-transparent resize-y text-[#1e293b] placeholder-[#94a3b8]"
        />
      </div>

      {/* Large Generate Prompt Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          className="w-full py-4 px-6 rounded-xl font-medium text-white shadow-md transition-all flex items-center justify-center gap-2.5 text-base bg-gradient-to-r from-[#0284c7] via-[#0f766e] to-[#0d9488] hover:from-[#0369a1] hover:to-[#0f766e] hover:shadow-lg active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-[#fed7aa]" />
          <span className="font-semibold tracking-wide">Generate Prompt</span>
        </button>

        <p className="text-center text-[11px] text-[#64748b] mt-2">
          100% client-side • Instant generation from specialized product photography templates
        </p>
      </div>
    </div>
  );
};
