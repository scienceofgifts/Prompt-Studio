import { ThinkingLevel } from '@google/genai';
import { DEFAULT_AI_MODEL_IDS } from '../utils/aiModelManager';

export type ModelCooldownKind = 'daily-quota' | 'rate-limited' | 'unavailable';

export interface ModelCooldownEntry {
  modelId: string;
  state: ModelCooldownKind;
  reason: string;
  updatedAt: number;
  untilMs: number;
}

export type GeminiErrorCategory =
  | 'auth-error'
  | 'daily-quota'
  | 'rate-limit'
  | 'parameter-error'
  | 'model-unavailable'
  | 'transient'
  | 'unknown';

export interface ClassifiedGeminiError {
  category: GeminiErrorCategory;
  httpStatus?: number;
  retryDelayMs?: number;
  reason: string;
  fatal: boolean;
  retrySameModelWithoutThinking: boolean;
}

export interface ModelAttemptLog {
  modelId: string;
  status: 'success' | 'skipped-cooldown' | 'failed';
  category?: GeminiErrorCategory | 'cooldown';
  reason?: string;
}

export interface FallbackExecutionSuccess<T> {
  ok: true;
  modelUsed: string;
  result: T;
  attemptedModels: string[];
  attemptLogs: ModelAttemptLog[];
}

export interface FallbackExecutionFailure {
  ok: false;
  errorCode:
    | 'NO_MODELS_ENABLED'
    | 'AUTH_OR_BILLING_ERROR'
    | 'ALL_MODELS_COOLDOWN'
    | 'ALL_MODELS_FAILED';
  message: string;
  httpStatus: number;
  attemptedModels: string[];
  attemptLogs: ModelAttemptLog[];
}

export type FallbackExecutionOutcome<T> =
  | FallbackExecutionSuccess<T>
  | FallbackExecutionFailure;

export interface ModelCapabilityConfig {
  thinkingLevel?: ThinkingLevel;
  omitThinkingConfig?: boolean;
}

/**
 * Data-driven model capability profile resolver.
 * Never hard-codes brittle one-off branches for every single version;
 * pairs clean prefix/family rules with automatic 400 parameter-strip retry.
 */
export function getModelCapabilityConfig(modelId: string): ModelCapabilityConfig {
  const normalized = modelId.trim().toLowerCase();

  // Gemini 4 series: Hydrogen supports LOW / MEDIUM / HIGH / XHIGH (never MINIMAL)
  if (normalized.startsWith('gemini-4-')) {
    return { thinkingLevel: ThinkingLevel.LOW };
  }

  // Gemini 3.x lite models support MINIMAL / LOW; Flash models support LOW
  if (normalized.startsWith('gemini-3')) {
    if (normalized.includes('lite')) {
      return { thinkingLevel: ThinkingLevel.MINIMAL };
    }
    return { thinkingLevel: ThinkingLevel.LOW };
  }

  // Gemini 2.5 or unknown custom models: omit thinkingConfig so default reasoning applies
  return { omitThinkingConfig: true };
}

function extractHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const obj = err as Record<string, unknown>;

  if (typeof obj.status === 'number') return obj.status;
  if (typeof obj.statusCode === 'number') return obj.statusCode;
  if (typeof obj.code === 'number') return obj.code;

  if (obj.error && typeof obj.error === 'object') {
    const nested = obj.error as Record<string, unknown>;
    if (typeof nested.code === 'number') return nested.code;
    if (typeof nested.status === 'number') return nested.status;
  }

  const msg = extractErrorMessage(err);
  const statusMatch = msg.match(/\b(400|401|403|404|429|500|502|503|504)\b/);
  if (statusMatch) {
    return Number(statusMatch[1]);
  }
  return undefined;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (obj.error && typeof obj.error === 'object') {
      const nested = obj.error as Record<string, unknown>;
      if (typeof nested.message === 'string') return nested.message;
    }
    try {
      return JSON.stringify(obj);
    } catch {
      return 'Unknown Gemini API error';
    }
  }
  return 'Unknown Gemini API error';
}

function extractRetryDelayMs(err: unknown, message: string): number | undefined {
  const tryParseDuration = (val: unknown): number | undefined => {
    if (typeof val === 'number' && Number.isFinite(val)) {
      return val > 0 ? val : undefined;
    }
    if (typeof val === 'string') {
      const secMatch = val.trim().match(/^(\d+(?:\.\d+)?)s$/i);
      if (secMatch) return Math.round(Number(secMatch[1]) * 1000);
      const msMatch = val.trim().match(/^(\d+(?:\.\d+)?)ms$/i);
      if (msMatch) return Math.round(Number(msMatch[1]));
    }
    return undefined;
  };

  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    const direct = tryParseDuration(obj.retryDelay ?? obj.retryAfter);
    if (direct !== undefined) return direct;

    const details =
      (Array.isArray(obj.details) ? obj.details : null) ||
      (obj.error && typeof obj.error === 'object' && Array.isArray((obj.error as Record<string, unknown>).details)
        ? ((obj.error as Record<string, unknown>).details as unknown[])
        : null);

    if (details) {
      for (const detail of details) {
        if (detail && typeof detail === 'object') {
          const parsed = tryParseDuration((detail as Record<string, unknown>).retryDelay);
          if (parsed !== undefined) return parsed;
        }
      }
    }
  }

  const msgMatch =
    message.match(/retry(?:ing)?\s*(?:in|after)\s*(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|ms)/i) ||
    message.match(/"retryDelay"\s*:\s*"([^"]+)"/i);
  if (msgMatch) {
    if (msgMatch.length === 2) {
      return tryParseDuration(msgMatch[1]);
    }
    const num = Number(msgMatch[1]);
    const unit = msgMatch[2].toLowerCase();
    return unit.startsWith('ms') ? Math.round(num) : Math.round(num * 1000);
  }

  return undefined;
}

/**
 * Classifies Gemini API errors accurately so authentication/billing errors,
 * daily quota exhaustion, short-term rate limits, parameter incompatibilities,
 * and model retirements/404s each trigger the proper behavior.
 */
export function classifyGeminiError(err: unknown): ClassifiedGeminiError {
  const message = extractErrorMessage(err);
  const lower = message.toLowerCase();
  const httpStatus = extractHttpStatus(err);
  const retryDelayMs = extractRetryDelayMs(err, message);

  // 1. Auth, invalid API key, or project-wide billing/permission failures (DO NOT misclassify as model quota)
  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid api key') ||
    lower.includes('permission_denied') ||
    lower.includes('unauthenticated') ||
    lower.includes('billing account') ||
    lower.includes('billing is not enabled') ||
    lower.includes('project has been suspended')
  ) {
    return {
      category: 'auth-error',
      httpStatus: httpStatus === 401 ? 401 : 403,
      reason: 'Gemini API authentication or project permission failed.',
      fatal: true,
      retrySameModelWithoutThinking: false,
    };
  }

  // 2. Model retirement, unknown model ID, or unsupported endpoint/method for this model
  const mentionsModelMissing =
    lower.includes('is not found for api version') ||
    lower.includes('model not found') ||
    lower.includes('not supported for generatecontent') ||
    lower.includes('unsupported model') ||
    lower.includes('model has been retired') ||
    lower.includes('model is deprecated') ||
    lower.includes('does not exist');

  if (httpStatus === 404 || lower.includes('not_found') || mentionsModelMissing) {
    return {
      category: 'model-unavailable',
      httpStatus: httpStatus || 404,
      reason: 'Model not found, retired, or unsupported for image analysis.',
      fatal: false,
      retrySameModelWithoutThinking: false,
    };
  }

  // 3. Thinking / parameter mismatch on a valid model (retry same model without thinkingConfig)
  const mentionsThinkingParam =
    lower.includes('thinking_level') ||
    lower.includes('thinkinglevel') ||
    lower.includes('thinking_config') ||
    lower.includes('thinkingconfig') ||
    lower.includes('thinking budget');

  if ((httpStatus === 400 || lower.includes('invalid_argument')) && mentionsThinkingParam) {
    return {
      category: 'parameter-error',
      httpStatus: 400,
      reason: 'Model rejected thinkingConfig parameter; retrying without thinkingConfig.',
      fatal: false,
      retrySameModelWithoutThinking: true,
    };
  }

  // 4. Quota exhaustion vs short-term rate limits (429 / RESOURCE_EXHAUSTED)
  const isQuotaOrRateLimit =
    httpStatus === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests');

  if (isQuotaOrRateLimit) {
    const indicatesDailyQuota =
      lower.includes('perday') ||
      lower.includes('per_day') ||
      lower.includes('per day') ||
      lower.includes('daily') ||
      lower.includes('requestsperday') ||
      lower.includes('generate_content_free_tier_requests') ||
      (retryDelayMs !== undefined && retryDelayMs > 60_000);

    if (indicatesDailyQuota) {
      return {
        category: 'daily-quota',
        httpStatus: 429,
        retryDelayMs,
        reason: 'Daily quota exhausted for this model; cooled down until quota reset.',
        fatal: false,
        retrySameModelWithoutThinking: false,
      };
    }

    return {
      category: 'rate-limit',
      httpStatus: 429,
      retryDelayMs,
      reason: 'Short-term rate limit reached; falling back cleanly.',
      fatal: false,
      retrySameModelWithoutThinking: false,
    };
  }

  // 5. Model-specific 503 overload or bad request for this model
  if (httpStatus === 503 || lower.includes('overloaded') || lower.includes('unavailable')) {
    return {
      category: 'model-unavailable',
      httpStatus: 503,
      retryDelayMs,
      reason: 'Model temporarily overloaded or unavailable.',
      fatal: false,
      retrySameModelWithoutThinking: false,
    };
  }

  if (httpStatus === 400 || lower.includes('invalid_argument')) {
    return {
      category: 'model-unavailable',
      httpStatus: 400,
      reason: 'Model rejected the request configuration.',
      fatal: false,
      retrySameModelWithoutThinking: false,
    };
  }

  // 6. Transient network/parsing failure
  return {
    category: 'transient',
    httpStatus: httpStatus || 502,
    reason: message || 'Transient recognition failure.',
    fatal: false,
    retrySameModelWithoutThinking: false,
  };
}

/**
 * Estimates cooldown duration until next Pacific Time midnight for daily quotas
 * without hard-coding assumed request limits.
 */
export function computeDailyResetCooldownMs(nowMs = Date.now(), explicitRetryDelayMs?: number): number {
  if (explicitRetryDelayMs && explicitRetryDelayMs > 60_000) {
    return Math.min(explicitRetryDelayMs, 24 * 60 * 60 * 1000);
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = formatter.formatToParts(new Date(nowMs));
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const second = Number(parts.find((p) => p.type === 'second')?.value ?? '0');

    const secondsSinceMidnight = hour * 3600 + minute * 60 + second;
    const secondsUntilMidnight = Math.max(15 * 60, 24 * 3600 - secondsSinceMidnight + 60);
    return secondsUntilMidnight * 1000;
  } catch {
    return 60 * 60 * 1000;
  }
}

export class ModelCooldownRegistry {
  private entries = new Map<string, ModelCooldownEntry>();

  getActiveCooldown(modelId: string, nowMs = Date.now()): ModelCooldownEntry | null {
    const key = modelId.trim().toLowerCase();
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (nowMs >= entry.untilMs) {
      this.entries.delete(key);
      return null;
    }
    return entry;
  }

  setCooldown(
    modelId: string,
    state: ModelCooldownKind,
    durationMs: number,
    reason: string,
    nowMs = Date.now()
  ): ModelCooldownEntry {
    const key = modelId.trim().toLowerCase();
    const entry: ModelCooldownEntry = {
      modelId: modelId.trim(),
      state,
      reason,
      updatedAt: nowMs,
      untilMs: nowMs + Math.max(1000, durationMs),
    };
    this.entries.set(key, entry);
    return entry;
  }

  clearModel(modelId: string): void {
    this.entries.delete(modelId.trim().toLowerCase());
  }

  clearAll(): void {
    this.entries.clear();
  }

  getAllActive(nowMs = Date.now()): ModelCooldownEntry[] {
    const active: ModelCooldownEntry[] = [];
    for (const [key, entry] of this.entries.entries()) {
      if (nowMs >= entry.untilMs) {
        this.entries.delete(key);
      } else {
        active.push(entry);
      }
    }
    return active;
  }
}

export const sharedModelCooldowns = new ModelCooldownRegistry();

export function sanitizeCandidateModelList(preferredModels: unknown): {
  models: string[];
  explicitlyEmpty: boolean;
} {
  if (preferredModels === undefined || preferredModels === null) {
    return { models: [...DEFAULT_AI_MODEL_IDS], explicitlyEmpty: false };
  }

  if (!Array.isArray(preferredModels)) {
    return { models: [...DEFAULT_AI_MODEL_IDS], explicitlyEmpty: false };
  }

  if (preferredModels.length === 0) {
    return { models: [], explicitlyEmpty: true };
  }

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const item of preferredModels) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || /\s/.test(trimmed) || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    cleaned.push(trimmed);
    if (cleaned.length >= 20) break;
  }

  if (cleaned.length === 0) {
    return { models: [], explicitlyEmpty: true };
  }

  return { models: cleaned, explicitlyEmpty: false };
}

export interface ExecuteWithFallbackOptions<T> {
  candidateModels: string[];
  cooldowns?: ModelCooldownRegistry;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  invokeModel: (
    modelId: string,
    capability: ModelCapabilityConfig
  ) => Promise<T>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Executes a Gemini model request across prioritized candidate models with
 * cooldown awareness, parameter fallback, and strict error classification.
 */
export async function executeWithModelFallback<T>(
  options: ExecuteWithFallbackOptions<T>
): Promise<FallbackExecutionOutcome<T>> {
  const {
    candidateModels,
    cooldowns = sharedModelCooldowns,
    now = () => Date.now(),
    sleep = defaultSleep,
    invokeModel,
  } = options;

  if (candidateModels.length === 0) {
    return {
      ok: false,
      errorCode: 'NO_MODELS_ENABLED',
      message: 'No AI recognition models are enabled in Studio Settings. Enable a model or configure manually.',
      httpStatus: 400,
      attemptedModels: [],
      attemptLogs: [],
    };
  }

  const attemptLogs: ModelAttemptLog[] = [];
  const attemptedModels: string[] = [];
  let allSkippedByCooldown = true;

  for (const modelId of candidateModels) {
    const activeCooldown = cooldowns.getActiveCooldown(modelId, now());
    if (activeCooldown) {
      attemptLogs.push({
        modelId,
        status: 'skipped-cooldown',
        category: 'cooldown',
        reason: activeCooldown.reason,
      });
      continue;
    }

    allSkippedByCooldown = false;
    attemptedModels.push(modelId);
    const capability = getModelCapabilityConfig(modelId);

    try {
      const result = await invokeModel(modelId, capability);
      cooldowns.clearModel(modelId);
      attemptLogs.push({ modelId, status: 'success' });
      return {
        ok: true,
        modelUsed: modelId,
        result,
        attemptedModels,
        attemptLogs,
      };
    } catch (err) {
      let classified = classifyGeminiError(err);

      // Auth / invalid key / project billing: halt fallback immediately
      if (classified.fatal) {
        attemptLogs.push({
          modelId,
          status: 'failed',
          category: classified.category,
          reason: classified.reason,
        });
        return {
          ok: false,
          errorCode: 'AUTH_OR_BILLING_ERROR',
          message: classified.reason,
          httpStatus: classified.httpStatus || 403,
          attemptedModels,
          attemptLogs,
        };
      }

      // Parameter incompatibility (e.g. thinkingConfig unsupported on custom model):
      // Retry the SAME model once with thinkingConfig omitted
      if (classified.retrySameModelWithoutThinking && !capability.omitThinkingConfig) {
        try {
          const retryResult = await invokeModel(modelId, { omitThinkingConfig: true });
          cooldowns.clearModel(modelId);
          attemptLogs.push({ modelId, status: 'success' });
          return {
            ok: true,
            modelUsed: modelId,
            result: retryResult,
            attemptedModels,
            attemptLogs,
          };
        } catch (retryErr) {
          classified = classifyGeminiError(retryErr);
          if (classified.fatal) {
            attemptLogs.push({
              modelId,
              status: 'failed',
              category: classified.category,
              reason: classified.reason,
            });
            return {
              ok: false,
              errorCode: 'AUTH_OR_BILLING_ERROR',
              message: classified.reason,
              httpStatus: classified.httpStatus || 403,
              attemptedModels,
              attemptLogs,
            };
          }
        }
      }

      // Short-term rate limit with small retryDelay: one bounded wait before falling back
      if (
        classified.category === 'rate-limit' &&
        classified.retryDelayMs !== undefined &&
        classified.retryDelayMs > 0 &&
        classified.retryDelayMs <= 2000
      ) {
        await sleep(classified.retryDelayMs);
        try {
          const rateRetryResult = await invokeModel(modelId, capability);
          cooldowns.clearModel(modelId);
          attemptLogs.push({ modelId, status: 'success' });
          return {
            ok: true,
            modelUsed: modelId,
            result: rateRetryResult,
            attemptedModels,
            attemptLogs,
          };
        } catch (rateRetryErr) {
          classified = classifyGeminiError(rateRetryErr);
          if (classified.fatal) {
            attemptLogs.push({
              modelId,
              status: 'failed',
              category: classified.category,
              reason: classified.reason,
            });
            return {
              ok: false,
              errorCode: 'AUTH_OR_BILLING_ERROR',
              message: classified.reason,
              httpStatus: classified.httpStatus || 403,
              attemptedModels,
              attemptLogs,
            };
          }
        }
      }

      // Record appropriate cooldown state for the failed model before advancing
      if (classified.category === 'daily-quota') {
        const cooldownMs = computeDailyResetCooldownMs(now(), classified.retryDelayMs);
        cooldowns.setCooldown(modelId, 'daily-quota', cooldownMs, classified.reason, now());
      } else if (classified.category === 'rate-limit') {
        const cooldownMs = Math.max(classified.retryDelayMs ?? 15_000, 15_000);
        cooldowns.setCooldown(
          modelId,
          'rate-limited',
          Math.min(cooldownMs, 5 * 60_000),
          classified.reason,
          now()
        );
      } else if (classified.category === 'model-unavailable') {
        const durationMs = classified.httpStatus === 503 ? 60_000 : 15 * 60_000;
        cooldowns.setCooldown(modelId, 'unavailable', durationMs, classified.reason, now());
      }

      attemptLogs.push({
        modelId,
        status: 'failed',
        category: classified.category,
        reason: classified.reason,
      });
    }
  }

  return {
    ok: false,
    errorCode: allSkippedByCooldown ? 'ALL_MODELS_COOLDOWN' : 'ALL_MODELS_FAILED',
    message: allSkippedByCooldown
      ? 'All configured Gemini recognition models are currently in quota or availability cooldown. Configure product settings manually below or reset cooldowns in Studio Settings.'
      : 'All configured Gemini recognition models failed to analyze the image. Configure product settings manually below.',
    httpStatus: allSkippedByCooldown ? 429 : 502,
    attemptedModels,
    attemptLogs,
  };
}
