import { AspectRatio, BackgroundStyle, SurfaceStyle } from '../types';

export interface StudioBackgroundOption {
  id: BackgroundStyle;
  label: string;
  desc: string;
  swatchClass: string;
}

export interface StudioSurfaceOption {
  id: SurfaceStyle;
  label: string;
  desc: string;
}

export interface StudioAspectRatioOption {
  id: AspectRatio;
  label: string;
  ratioDesc: string;
  shapeClass: string;
}

export const STUDIO_BACKGROUNDS: StudioBackgroundOption[] = [
  {
    id: 'science-gradient',
    label: 'Science of Gifts Gradient',
    desc: 'Soft blue-to-mint gradient studio backdrop with photographic transition',
    swatchClass: 'bg-gradient-to-br from-[#99BFF9] via-[#C3F3DF] to-[#E0F2FE] border-[#93c5fd]',
  },
  {
    id: 'gradient-wall-neutral-surface',
    label: 'Gradient Wall + Neutral Surface',
    desc: 'Blue/mint backwall with tangible neutral tabletop below',
    swatchClass: 'bg-gradient-to-b from-[#99BFF9] via-[#C3F3DF] to-[#e2e8f0] border-[#93c5fd]',
  },
  {
    id: 'blue-wall-neutral-surface',
    label: 'Blue Wall + Neutral Surface',
    desc: 'Soft muted powder blue backwall with neutral stone tabletop',
    swatchClass: 'bg-gradient-to-b from-[#bae6fd] to-[#e2e8f0] border-[#7dd3fc]',
  },
  {
    id: 'mint-wall-neutral-surface',
    label: 'Mint Wall + Neutral Surface',
    desc: 'Soft seafoam mint backwall with neutral physical surface',
    swatchClass: 'bg-gradient-to-b from-[#a7f3d0] to-[#e2e8f0] border-[#6ee7b7]',
  },
  {
    id: 'neutral-editorial',
    label: 'Neutral Editorial',
    desc: 'Light neutral studio environment with clean off-white tones',
    swatchClass: 'bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] border-[#cbd5e1]',
  },
  {
    id: 'warm-ivory',
    label: 'Warm Ivory Studio',
    desc: 'Pale alabaster & warm ivory matte background',
    swatchClass: 'bg-gradient-to-br from-[#fffdfa] to-[#fef3c7] border-[#fde68a]',
  },
  {
    id: 'branded-editorial-environment',
    label: 'Branded Architectural Environment',
    desc: 'Blue & mint palette woven subtly into real 3D studio depth',
    swatchClass: 'bg-gradient-to-br from-[#e0f2fe] via-[#f1f5f9] to-[#d1fae5] border-[#94a3b8]',
  },
  {
    id: 'dark-editorial',
    label: 'Dark Editorial Studio',
    desc: 'Sophisticated darker studio with sculpted key lighting',
    swatchClass: 'bg-gradient-to-br from-[#334155] to-[#0f172a] border-[#1e293b]',
  },
];

export const STUDIO_SURFACES: StudioSurfaceOption[] = [
  { id: 'editorial-tabletop', label: 'Editorial Tabletop', desc: 'Honed travertine slab or pale white oak' },
  { id: 'light-stone', label: 'Light Limestone', desc: 'Pale honed limestone with fine grain' },
  { id: 'light-wood', label: 'Light White Oak', desc: 'Smooth pale matte white oak wood' },
  { id: 'dark-matte', label: 'Dark Slate Surface', desc: 'Deep charcoal slate or dark stone' },
  { id: 'soft-fabric', label: 'Raw Draped Linen', desc: 'Heavyweight unbleached draped linen' },
  { id: 'paper-archival', label: 'Archival Cotton Paper', desc: '300 GSM cotton rag paper tooth' },
  { id: 'no-visible-surface', label: 'Floating Space', desc: 'Floating seamlessly in negative space' },
];

export const STUDIO_ASPECT_RATIOS: StudioAspectRatioOption[] = [
  { id: '1:1', label: '1:1', ratioDesc: 'Square / E-commerce', shapeClass: 'w-5 h-5' },
  { id: '4:5', label: '4:5', ratioDesc: 'Editorial Portrait', shapeClass: 'w-4 h-5' },
  { id: '3:2', label: '3:2', ratioDesc: 'Classic Catalog', shapeClass: 'w-6 h-4' },
  { id: '16:9', label: '16:9', ratioDesc: 'Widescreen Banner', shapeClass: 'w-7 h-4' },
];
