import React from 'react';
import { Link as LinkIcon, Plus, Trash2, Globe } from 'lucide-react';
import { InternalLink } from '../../utils/internalLinks';

interface InternalLinksManagerProps {
  links: InternalLink[];
  onChange: (links: InternalLink[]) => void;
  accentColor?: 'teal' | 'sky' | 'indigo' | 'emerald';
}

export const InternalLinksManager: React.FC<InternalLinksManagerProps> = ({
  links,
  onChange,
  accentColor = 'teal',
}) => {
  const isExpanded = links.length > 0;

  const handleAddLink = () => {
    const newLink: InternalLink = {
      id: crypto.randomUUID(),
      description: '',
      url: '',
    };
    onChange([...links, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  const handleUpdateLink = (id: string, field: 'description' | 'url', value: string) => {
    onChange(
      links.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const accentStyles = {
    teal: {
      text: 'text-[#0f766e]',
      border: 'border-[#ccfbf1]',
      bg: 'bg-[#f0fdfa]',
      ring: 'focus:ring-[#0f766e]',
      btnBg: 'bg-[#f0fdfa] text-[#0f766e] hover:bg-[#ccfbf1]',
    },
    sky: {
      text: 'text-[#0284c7]',
      border: 'border-[#bae6fd]',
      bg: 'bg-[#f0f9ff]',
      ring: 'focus:ring-[#0284c7]',
      btnBg: 'bg-[#f0f9ff] text-[#0284c7] hover:bg-[#e0f2fe]',
    },
    indigo: {
      text: 'text-[#4f46e5]',
      border: 'border-[#c7d2fe]',
      bg: 'bg-[#eef2ff]',
      ring: 'focus:ring-[#4f46e5]',
      btnBg: 'bg-[#eef2ff] text-[#4f46e5] hover:bg-[#c7d2fe]',
    },
    emerald: {
      text: 'text-[#059669]',
      border: 'border-[#a7f3d0]',
      bg: 'bg-[#ecfdf5]',
      ring: 'focus:ring-[#059669]',
      btnBg: 'bg-[#ecfdf5] text-[#059669] hover:bg-[#a7f3d0]',
    },
  }[accentColor];

  return (
    <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
          <LinkIcon className={`w-3.5 h-3.5 ${accentStyles.text}`} />
          <span>Internal Links</span>
          <span className="text-[10px] font-normal lowercase text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full border border-[#e2e8f0]">
            optional ({links.length})
          </span>
        </label>

        {!isExpanded && (
          <button
            type="button"
            onClick={handleAddLink}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${accentStyles.btnBg}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Links</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <p className="text-[11px] text-[#64748b] leading-normal">
            Add relevant Science of Gifts pages to potentially incorporate into the content with natural anchor text.
          </p>

          <div className="space-y-2">
            {links.map((link, index) => (
              <div
                key={link.id || index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] items-center text-xs"
              >
                {/* Description / Anchor context */}
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={link.description}
                    onChange={(e) => handleUpdateLink(link.id, 'description', e.target.value)}
                    placeholder="e.g. History gifts or Gifts for stargazers"
                    className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-1 ${accentStyles.ring} text-[#1e293b] bg-white`}
                  />
                </div>

                {/* URL */}
                <div className="sm:col-span-6 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0" />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                    placeholder="https://www.scienceofgifts.com/..."
                    className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:outline-hidden focus:ring-1 ${accentStyles.ring} text-[#1e293b] bg-white`}
                  />
                </div>

                {/* Remove Button */}
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link.id)}
                    className="p-1.5 text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors cursor-pointer"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddLink}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed transition-all flex items-center gap-1.5 cursor-pointer ${accentStyles.btnBg}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another link</span>
            </button>

            {links.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-[#64748b] hover:text-[#dc2626] transition-colors cursor-pointer"
              >
                Clear all links
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
