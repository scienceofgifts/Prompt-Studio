import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Clock,
  AlertTriangle,
  Power,
} from 'lucide-react';
import {
  AiModelConfig,
  LastRecognitionModelRecord,
  AI_MODELS_UPDATED_EVENT,
  getAiModels,
  getLastRecognitionModel,
  moveAiModel,
  toggleAiModel,
  addAiModel,
  updateAiModel,
  removeAiModel,
  restoreDefaultAiModels,
} from '../../utils/aiModelManager';

interface ServerCooldownInfo {
  modelId: string;
  state: 'daily-quota' | 'rate-limited' | 'unavailable';
  reason: string;
  untilMs: number;
}

interface AiModelsSettingsPanelProps {
  onStatusNotice?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AiModelsSettingsPanel: React.FC<AiModelsSettingsPanelProps> = ({
  onStatusNotice,
}) => {
  const [models, setModels] = useState<AiModelConfig[]>(() => getAiModels());
  const [lastRecord, setLastRecord] = useState<LastRecognitionModelRecord | null>(() =>
    getLastRecognitionModel()
  );
  const [cooldowns, setCooldowns] = useState<ServerCooldownInfo[]>([]);
  const [recognitionAvailable, setRecognitionAvailable] = useState<boolean | null>(null);

  // Add model form state
  const [newModelId, setNewModelId] = useState('');
  const [newModelLabel, setNewModelLabel] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Inline edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModelId, setEditModelId] = useState('');
  const [editModelLabel, setEditModelLabel] = useState('');

  const refreshServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-models/status');
      if (!res.ok) return;
      const data = await res.json();
      setRecognitionAvailable(
        typeof data.recognitionAvailable === 'boolean' ? data.recognitionAvailable : null
      );
      setCooldowns(Array.isArray(data.cooldowns) ? data.cooldowns : []);
    } catch {
      // Ignore transient status fetch failure
    }
  }, []);

  useEffect(() => {
    refreshServerStatus();
    const handleStorageUpdate = () => {
      setModels(getAiModels());
      setLastRecord(getLastRecognitionModel());
    };
    window.addEventListener(AI_MODELS_UPDATED_EVENT, handleStorageUpdate);
    return () => {
      window.removeEventListener(AI_MODELS_UPDATED_EVENT, handleStorageUpdate);
    };
  }, [refreshServerStatus]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const next = moveAiModel(index, direction);
    setModels(next);
    setEditingIndex(null);
    onStatusNotice?.('Updated AI model fallback priority order.', 'success');
  };

  const handleToggle = (index: number) => {
    const result = toggleAiModel(index);
    setModels(result.models);
    if (!result.success && result.error) {
      onStatusNotice?.(result.error, 'error');
    } else {
      const item = result.models[index];
      onStatusNotice?.(
        `${item.enabled ? 'Enabled' : 'Disabled'} ${item.label} (${item.id}).`,
        'info'
      );
    }
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const result = addAiModel(newModelId, newModelLabel);
    if (!result.success) {
      setFormError(result.error || 'Could not add model.');
      return;
    }
    setModels(result.models);
    setNewModelId('');
    setNewModelLabel('');
    onStatusNotice?.('Added AI model to fallback priority list.', 'success');
  };

  const startEditing = (index: number) => {
    const item = models[index];
    setEditingIndex(index);
    setEditModelId(item.id);
    setEditModelLabel(item.label);
    setFormError(null);
  };

  const handleSaveEdit = (index: number) => {
    setFormError(null);
    const result = updateAiModel(index, {
      id: editModelId,
      label: editModelLabel,
    });
    if (!result.success) {
      setFormError(result.error || 'Could not update model.');
      return;
    }
    setModels(result.models);
    setEditingIndex(null);
    onStatusNotice?.('Updated model configuration.', 'success');
  };

  const handleRemove = (index: number) => {
    const target = models[index];
    const result = removeAiModel(index);
    if (!result.success) {
      onStatusNotice?.(result.error || 'Cannot remove model.', 'error');
      return;
    }
    setModels(result.models);
    setEditingIndex(null);
    onStatusNotice?.(`Removed "${target.id}" from fallback list.`, 'info');
  };

  const handleRestoreDefaults = () => {
    const defaults = restoreDefaultAiModels();
    setModels(defaults);
    setEditingIndex(null);
    setFormError(null);
    onStatusNotice?.('Restored recommended Gemini model priority order.', 'info');
  };

  const handleResetCooldowns = async () => {
    try {
      const res = await fetch('/api/ai-models/reset-cooldowns', { method: 'POST' });
      if (res.ok) {
        setCooldowns([]);
        onStatusNotice?.('Cleared temporary server model cooldowns.', 'info');
      }
    } catch {
      onStatusNotice?.('Unable to reset runtime cooldowns.', 'error');
    }
  };

  const enabledCount = models.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0f172a] font-editorial">
              AI Models &amp; Automatic Fallback
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] text-[10px] font-bold">
              {enabledCount} Active
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Configure Gemini model priority for Smart Product Recognition. If a model hits daily quota or becomes unavailable, the server automatically advances down this list.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-all cursor-pointer flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#64748b]" />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Last Successful Model + Server Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">
            <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Last Successful Recognition Model</span>
          </div>
          {lastRecord ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-mono font-semibold text-[#166534]">
                  {lastRecord.modelId}
                </span>
                {lastRecord.fromCache && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] font-medium">
                    Cached result
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748b] flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>
                  Used {new Date(lastRecord.timestamp).toLocaleString()}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#64748b]">
              No automatic product recognition has run in this browser session yet. Upload an image in Product Photography to test.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748b]">
              <Cpu className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Runtime Recognition Status</span>
            </div>
            {cooldowns.length > 0 && (
              <button
                type="button"
                onClick={handleResetCooldowns}
                className="text-[11px] font-semibold text-[#0284c7] hover:underline cursor-pointer"
              >
                Reset Cooldowns
              </button>
            )}
          </div>
          <div className="text-xs text-[#334155]">
            {recognitionAvailable === false ? (
              <span className="text-[#b91c1c] font-medium">
                Server Gemini API credential is not configured; manual staging remains active.
              </span>
            ) : cooldowns.length === 0 ? (
              <span className="text-[#166534] font-medium">
                Ready • No models currently in quota or availability cooldown.
              </span>
            ) : (
              <span className="text-[#92400e] font-medium">
                {cooldowns.length} model{cooldowns.length === 1 ? '' : 's'} temporarily skipped ({cooldowns.map((c) => c.modelId).join(', ')}).
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warning when all models are disabled */}
      {enabledCount === 0 && (
        <div className="p-3.5 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            All AI models are currently disabled. Enable at least one model below to use automatic product recognition on image upload.
          </span>
        </div>
      )}

      {/* Priority List Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#334155]">
            Model Fallback Priority Order ({models.length})
          </span>
          <span className="text-[11px] text-[#64748b]">
            Tried top-to-bottom on newly uploaded product images
          </span>
        </div>

        <div className="divide-y divide-[#f1f5f9]">
          {models.map((model, index) => {
            const cooldown = cooldowns.find(
              (c) => c.modelId.toLowerCase() === model.id.toLowerCase()
            );
            const isEditing = editingIndex === index;

            return (
              <div
                key={`${model.id}-${index}`}
                className={`p-4 transition-colors ${
                  model.enabled ? 'bg-white' : 'bg-[#f8fafc]/70 opacity-75'
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editModelId}
                        onChange={(e) => setEditModelId(e.target.value)}
                        placeholder="Model ID (e.g. gemini-4-hydrogen)"
                        className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] text-xs font-mono text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                      />
                      <input
                        type="text"
                        value={editModelLabel}
                        onChange={(e) => setEditModelLabel(e.target.value)}
                        placeholder="Display Label"
                        className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(index)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0f766e] text-white hover:bg-[#115e59] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          model.enabled
                            ? 'bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]'
                            : 'bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0]'
                        }`}
                      >
                        #{index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[#0f172a]">
                            {model.label}
                          </span>
                          <code className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] text-[11px] font-mono">
                            {model.id}
                          </code>
                          {!model.enabled && (
                            <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b] text-[10px] font-semibold">
                              Disabled
                            </span>
                          )}
                          {cooldown && (
                            <span
                              className="px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#92400e] border border-[#fde68a] text-[10px] font-semibold"
                              title={cooldown.reason}
                            >
                              {cooldown.state === 'daily-quota'
                                ? 'Daily Quota Cooldown'
                                : cooldown.state === 'rate-limited'
                                ? 'Rate Limit Cooldown'
                                : 'Temporarily Unavailable'}
                            </span>
                          )}
                        </div>
                        {model.notes && (
                          <p className="text-[11px] text-[#64748b] mt-0.5">
                            {model.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggle(index)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                          model.enabled
                            ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0] hover:bg-[#dcfce7]'
                            : 'bg-white text-[#64748b] border-[#cbd5e1] hover:bg-[#f8fafc]'
                        }`}
                        title={model.enabled ? 'Disable this model' : 'Enable this model'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{model.enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        title="Move higher in priority"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === models.length - 1}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        title="Move lower in priority"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditing(index)}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f766e] cursor-pointer"
                        title="Edit model ID or label"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        disabled={models.length <= 1}
                        className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        title="Remove obsolete model"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Model Form */}
      <form
        onSubmit={handleAddModel}
        className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#334155]">
            Add Gemini Model ID
          </h3>
          <span className="text-[11px] text-[#64748b]">
            Keep fallback list current as new models release
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            value={newModelId}
            onChange={(e) => {
              setNewModelId(e.target.value);
              setFormError(null);
            }}
            placeholder="Model ID (e.g. gemini-4-argon)"
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
          />
          <input
            type="text"
            value={newModelLabel}
            onChange={(e) => setNewModelLabel(e.target.value)}
            placeholder="Friendly Name (optional)"
            className="sm:col-span-5 px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e]"
          />
          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {formError && (
          <p className="text-xs text-[#b91c1c] font-medium">{formError}</p>
        )}
      </form>
    </div>
  );
};
