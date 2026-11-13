import { GoogleGenAI, Type } from '@google/genai';
import {
  DesignAnalysisResult,
  DesignAspectProfile,
  DesignCompositionType,
  DesignCurrentBackground,
  SemanticProductFit,
} from '../designToProduct/types';
import {
  executeWithModelFallback,
  sanitizeCandidateModelList,
  sharedModelCooldowns,
} from './geminiFallback';
import {
  jsonResponse,
  MAX_RECOGNITION_REQUEST_BYTES,
  ServerRuntimeConfig,
  validateRecognizeProductPayload,
} from './productRecognition';

const COMPOSITION_TYPES: readonly DesignCompositionType[] = [
  'badge',
  'logo',
  'illustration',
  'pattern',
  'slogan',
  'poster',
  'emblem',
  'infographic',
  'typography',
  'other',
];

const ASPECT_PROFILES: readonly DesignAspectProfile[] = [
  'portrait',
  'square',
  'landscape',
  'wide-panoramic',
];

const BACKGROUND_STATES: readonly DesignCurrentBackground[] = [
  'transparent-clean',
  'solid-light',
  'solid-dark',
  'textured-or-patterned',
  'full-scene-illustration',
  'unknown',
];

const DEFAULT_CATALOG_HINT_IDS = [
  'tshirt',
  'hoodie',
  'sweatshirt',
  'sweater',
  'tank-top',
  'ceramic-mug',
  'beer-glass',
  'whiskey-glass',
  'cocktail-glass',
  'wine-tumbler',
  'water-bottle',
  'insulated-tumbler',
  'notebook',
  'journal',
  'poster',
  'art-print',
  'desk-mat',
  'mousepad',
  'laptop-sleeve',
  'tote-bag',
];

function sanitizeCatalogHint(
  rawCatalog: unknown
): Array<{ id: string; name: string; category: string }> {
  if (!Array.isArray(rawCatalog)) {
    return DEFAULT_CATALOG_HINT_IDS.map((id) => ({
      id,
      name: id.replace(/-/g, ' '),
      category: 'catalog',
    }));
  }

  const clean: Array<{ id: string; name: string; category: string }> = [];
  for (const item of rawCatalog.slice(0, 50)) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== 'string' || !obj.id.trim()) continue;
    clean.push({
      id: obj.id.trim().slice(0, 64),
      name:
        typeof obj.name === 'string' && obj.name.trim()
          ? obj.name.trim().slice(0, 64)
          : obj.id.trim(),
      category:
        typeof obj.category === 'string' && obj.category.trim()
          ? obj.category.trim().slice(0, 32)
          : 'other',
    });
  }

  return clean.length > 0
    ? clean
    : DEFAULT_CATALOG_HINT_IDS.map((id) => ({
        id,
        name: id.replace(/-/g, ' '),
        category: 'catalog',
      }));
}

function toStringArray(val: unknown, maxItems = 8): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, maxItems);
}

function clampScore(val: unknown, fallback = 60): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.max(0, Math.min(100, Math.round(val)));
}

/**
 * Validates and normalizes parsed Gemini JSON into a safe DesignAnalysisResult.
 */
export function normalizeDesignAnalysisResult(
  raw: unknown,
  validCatalogIds?: Set<string>
): DesignAnalysisResult {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const compositionType = COMPOSITION_TYPES.includes(
    obj.compositionType as DesignCompositionType
  )
    ? (obj.compositionType as DesignCompositionType)
    : 'illustration';

  const aspectProfile = ASPECT_PROFILES.includes(obj.aspectProfile as DesignAspectProfile)
    ? (obj.aspectProfile as DesignAspectProfile)
    : 'square';

  const currentBackground = BACKGROUND_STATES.includes(
    obj.currentBackground as DesignCurrentBackground
  )
    ? (obj.currentBackground as DesignCurrentBackground)
    : 'unknown';

  const textDensity =
    obj.textDensity === 'none' ||
    obj.textDensity === 'low' ||
    obj.textDensity === 'medium' ||
    obj.textDensity === 'high'
      ? obj.textDensity
      : 'low';

  const detailLevel =
    obj.detailLevel === 'minimal' ||
    obj.detailLevel === 'moderate' ||
    obj.detailLevel === 'intricate'
      ? obj.detailLevel
      : 'moderate';

  const rawFits = Array.isArray(obj.suggestedProductFits) ? obj.suggestedProductFits : [];
  const suggestedProductFits: SemanticProductFit[] = [];
  const seenFitIds = new Set<string>();

  for (const item of rawFits.slice(0, 12)) {
    if (!item || typeof item !== 'object') continue;
    const fit = item as Record<string, unknown>;
    const productId = typeof fit.productId === 'string' ? fit.productId.trim() : '';
    if (!productId || seenFitIds.has(productId)) continue;
    if (validCatalogIds && !validCatalogIds.has(productId)) continue;
    seenFitIds.add(productId);
    suggestedProductFits.push({
      productId,
      reason:
        typeof fit.reason === 'string' && fit.reason.trim()
          ? fit.reason.trim()
          : 'Strong thematic and visual alignment with the design.',
      conceptFitScore: clampScore(fit.conceptFitScore, 70),
      visualFitScore: clampScore(fit.visualFitScore, 70),
    });
  }

  return {
    conceptSummary:
      typeof obj.conceptSummary === 'string' && obj.conceptSummary.trim()
        ? obj.conceptSummary.trim()
        : 'Original graphic design artwork',
    themeOrTopic:
      typeof obj.themeOrTopic === 'string' && obj.themeOrTopic.trim()
        ? obj.themeOrTopic.trim()
        : 'Editorial gift theme',
    intendedAudience:
      typeof obj.intendedAudience === 'string' && obj.intendedAudience.trim()
        ? obj.intendedAudience.trim()
        : 'Enthusiasts and thoughtful gift recipients',
    visualIdentity:
      typeof obj.visualIdentity === 'string' && obj.visualIdentity.trim()
        ? obj.visualIdentity.trim()
        : 'Clean illustrative graphic style',
    compositionType,
    aspectProfile,
    elementDistribution:
      typeof obj.elementDistribution === 'string' && obj.elementDistribution.trim()
        ? obj.elementDistribution.trim()
        : 'Balanced central focal arrangement',
    typographyStyle:
      typeof obj.typographyStyle === 'string' && obj.typographyStyle.trim()
        ? obj.typographyStyle.trim()
        : 'None or integrated display lettering',
    textDensity,
    exactVisibleText:
      typeof obj.exactVisibleText === 'string' ? obj.exactVisibleText.trim() : '',
    importantElements: toStringArray(obj.importantElements, 8),
    dominantColors: toStringArray(obj.dominantColors, 5),
    supportingColors: toStringArray(obj.supportingColors, 5),
    currentBackground,
    detailLevel,
    suitableForSmallPrint:
      typeof obj.suitableForSmallPrint === 'boolean' ? obj.suitableForSmallPrint : true,
    expandableToWideOrFullBleed:
      typeof obj.expandableToWideOrFullBleed === 'boolean'
        ? obj.expandableToWideOrFullBleed
        : false,
    readabilityNotes:
      typeof obj.readabilityNotes === 'string' && obj.readabilityNotes.trim()
        ? obj.readabilityNotes.trim()
        : 'Inspect text contrast and line crispness at final product print scale.',
    worksWithoutModification:
      typeof obj.worksWithoutModification === 'boolean'
        ? obj.worksWithoutModification
        : false,
    prefersTransparentBackground:
      typeof obj.prefersTransparentBackground === 'boolean'
        ? obj.prefersTransparentBackground
        : compositionType !== 'poster',
    contrastRiskNotes:
      typeof obj.contrastRiskNotes === 'string' && obj.contrastRiskNotes.trim()
        ? obj.contrastRiskNotes.trim()
        : 'Verify foreground ink contrast against light, dark, or clear surfaces.',
    recommendedDefaultProductColor:
      typeof obj.recommendedDefaultProductColor === 'string' &&
      obj.recommendedDefaultProductColor.trim()
        ? obj.recommendedDefaultProductColor.trim()
        : 'Balanced neutral tone matching artwork contrast',
    elementsToPreserve: toStringArray(obj.elementsToPreserve, 8),
    suggestedProductFits,
  };
}

function buildDesignAnalysisPrompt(
  catalog: Array<{ id: string; name: string; category: string }>,
  fileName?: string
): string {
  const catalogList = catalog
    .map((item) => `- "${item.id}" (${item.name}, category: ${item.category})`)
    .join('\n');

  return `You are an expert merchandise art director evaluating a finished graphic design image for physical print merchandise production (such as apparel, drinkware, notebooks/posters, and desk accessories).

The attached image is the authoritative visual source of truth.
Do NOT invent text, characters, illustrations, or cultural references that are not visible or clearly depicted.
If readable text appears in the artwork, transcribe its EXACT spelling and wording verbatim into "exactVisibleText".

Analyze BOTH:
1. DESIGN CONCEPT & MEANING (independent of image aspect ratio):
   - What is the joke, reference, domain, or concept?
   - Who is the obvious recipient or gift audience?
   - Notice conceptual fit: e.g., a cocktail recipe or spirits gag belongs on cocktail/whiskey glassware or barware even if uploaded square; a coffeehouse badge suits ceramic mugs or apparel; an intricate botanical/celestial chart needs larger flat print surface (poster, art-print, desk-mat, or notebook) rather than tiny curved glassware.
2. VISUAL COMPOSITION & PRINT PRODUCTION NEEDS:
   - Identify compositionType, aspectProfile, element distribution, typography, textDensity, dominant/supporting colors, background state, detailLevel, small-print readability, expandability to wide/full-bleed, transparency desirability, contrast risks on dark/light/clear surfaces, and elements to preserve.
3. PRODUCT SUITABILITY RANKING:
   - Evaluate products from this exact catalog list and return the top 5–6 best-fitting entries in "suggestedProductFits" ordered best-first, with short 1-sentence explanations referencing the actual design and honest 0–100 conceptFitScore & visualFitScore scores.

Available Catalog Product IDs:
${catalogList}${
    fileName
      ? `\n\nOptional filename hint (trust visual pixels over filename if they differ): ${fileName}`
      : ''
  }`;
}

export async function handleAnalyzeDesignRequest(
  request: Request,
  config: ServerRuntimeConfig
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(
      {
        available: Boolean(config.geminiApiKey?.trim()),
        errorCode: 'METHOD_NOT_ALLOWED',
        error: 'Method not allowed. Use POST.',
      },
      405
    );
  }

  const trimmedKey = config.geminiApiKey?.trim();
  if (!trimmedKey) {
    return jsonResponse(
      {
        available: false,
        errorCode: 'API_KEY_MISSING',
        error: 'Design analysis service is unavailable (GEMINI_API_KEY is not configured).',
      },
      503
    );
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > MAX_RECOGNITION_REQUEST_BYTES) {
      return jsonResponse(
        {
          available: true,
          errorCode: 'PAYLOAD_TOO_LARGE',
          error: 'Uploaded artwork request exceeds maximum allowed size.',
        },
        413
      );
    }
  }

  let rawBodyText: string;
  try {
    rawBodyText = await request.text();
  } catch {
    return jsonResponse(
      {
        available: true,
        errorCode: 'INVALID_BODY',
        error: 'Could not read request body.',
      },
      400
    );
  }

  if (rawBodyText.length > MAX_RECOGNITION_REQUEST_BYTES) {
    return jsonResponse(
      {
        available: true,
        errorCode: 'PAYLOAD_TOO_LARGE',
        error: 'Uploaded artwork request exceeds maximum allowed size.',
      },
      413
    );
  }

  let parsedBody: Record<string, unknown>;
  try {
    parsedBody = rawBodyText ? (JSON.parse(rawBodyText) as Record<string, unknown>) : {};
  } catch {
    return jsonResponse(
      {
        available: true,
        errorCode: 'INVALID_JSON',
        error: 'Request body must be valid JSON.',
      },
      400
    );
  }

  const validated = validateRecognizeProductPayload(parsedBody);
  if (!validated.ok) {
    return jsonResponse(
      {
        available: true,
        errorCode: validated.errorCode,
        error: validated.error,
      },
      validated.status
    );
  }

  const catalogHint = sanitizeCatalogHint(parsedBody.catalog);
  const validCatalogIds = new Set(catalogHint.map((c) => c.id));
  const { models: candidateModels } = sanitizeCandidateModelList(validated.preferredModels);
  const analysisPrompt = buildDesignAnalysisPrompt(catalogHint, validated.fileName);

  const ai = new GoogleGenAI({
    apiKey: trimmedKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const fallbackOutcome = await executeWithModelFallback({
    candidateModels,
    cooldowns: sharedModelCooldowns,
    invokeModel: async (modelId, capability) => {
      const requestConfig: Record<string, unknown> = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptSummary: { type: Type.STRING },
            themeOrTopic: { type: Type.STRING },
            intendedAudience: { type: Type.STRING },
            visualIdentity: { type: Type.STRING },
            compositionType: {
              type: Type.STRING,
              enum: [...COMPOSITION_TYPES],
            },
            aspectProfile: {
              type: Type.STRING,
              enum: [...ASPECT_PROFILES],
            },
            elementDistribution: { type: Type.STRING },
            typographyStyle: { type: Type.STRING },
            textDensity: {
              type: Type.STRING,
              enum: ['none', 'low', 'medium', 'high'],
            },
            exactVisibleText: { type: Type.STRING },
            importantElements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dominantColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            supportingColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            currentBackground: {
              type: Type.STRING,
              enum: [...BACKGROUND_STATES],
            },
            detailLevel: {
              type: Type.STRING,
              enum: ['minimal', 'moderate', 'intricate'],
            },
            suitableForSmallPrint: { type: Type.BOOLEAN },
            expandableToWideOrFullBleed: { type: Type.BOOLEAN },
            readabilityNotes: { type: Type.STRING },
            worksWithoutModification: { type: Type.BOOLEAN },
            prefersTransparentBackground: { type: Type.BOOLEAN },
            contrastRiskNotes: { type: Type.STRING },
            recommendedDefaultProductColor: { type: Type.STRING },
            elementsToPreserve: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedProductFits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  conceptFitScore: { type: Type.NUMBER },
                  visualFitScore: { type: Type.NUMBER },
                },
                required: ['productId', 'reason', 'conceptFitScore', 'visualFitScore'],
              },
            },
          },
          required: [
            'conceptSummary',
            'themeOrTopic',
            'intendedAudience',
            'visualIdentity',
            'compositionType',
            'aspectProfile',
            'elementDistribution',
            'typographyStyle',
            'textDensity',
            'exactVisibleText',
            'importantElements',
            'dominantColors',
            'supportingColors',
            'currentBackground',
            'detailLevel',
            'suitableForSmallPrint',
            'expandableToWideOrFullBleed',
            'readabilityNotes',
            'worksWithoutModification',
            'prefersTransparentBackground',
            'contrastRiskNotes',
            'recommendedDefaultProductColor',
            'elementsToPreserve',
            'suggestedProductFits',
          ],
        },
      };

      if (!capability.omitThinkingConfig && capability.thinkingLevel) {
        requestConfig.thinkingConfig = { thinkingLevel: capability.thinkingLevel };
      }

      const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: validated.mimeType,
                data: validated.cleanBase64,
              },
            },
            {
              text: analysisPrompt,
            },
          ],
        },
        config: requestConfig,
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error(`Empty design analysis response from ${modelId}.`);
      }

      const parsed = JSON.parse(rawText);
      return normalizeDesignAnalysisResult(parsed, validCatalogIds);
    },
  });

  if (fallbackOutcome.ok) {
    return jsonResponse(
      {
        available: true,
        modelUsed: fallbackOutcome.modelUsed,
        attemptedModels: fallbackOutcome.attemptedModels,
        analysis: fallbackOutcome.result,
      },
      200
    );
  }

  console.error(
    '[designAnalysis] Gemini design analysis fallback exhausted:',
    fallbackOutcome.errorCode
  );

  return jsonResponse(
    {
      available: fallbackOutcome.errorCode !== 'AUTH_OR_BILLING_ERROR',
      errorCode: fallbackOutcome.errorCode,
      error: fallbackOutcome.message,
      attemptedModels: fallbackOutcome.attemptedModels,
    },
    fallbackOutcome.httpStatus
  );
}
