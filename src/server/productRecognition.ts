import { GoogleGenAI, Type } from '@google/genai';
import {
  executeWithModelFallback,
  sanitizeCandidateModelList,
  sharedModelCooldowns,
} from './geminiFallback';

export const PRODUCT_TYPES = [
  'mug',
  'tshirt',
  'sweatshirt',
  'hoodie',
  'notebook',
  'glass',
  'waterBottle',
  'tumbler',
  'poster',
  'other',
] as const;

export const FORM_FACTORS = [
  'flat-accessory',
  'garment',
  'vessel',
  'book-or-notebook',
  'wall-art-print',
  'three-dimensional-object',
] as const;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// ~15 MB JSON envelope / ~14 MB base64 image limit to protect Worker memory
export const MAX_RECOGNITION_REQUEST_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_BASE64_LENGTH = 14 * 1024 * 1024;

export interface ServerRuntimeConfig {
  geminiApiKey?: string;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getGeminiClient(apiKey?: string): GoogleGenAI | null {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: trimmed,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ValidatedImageInput {
  ok: true;
  cleanBase64: string;
  mimeType: string;
  fileName?: string;
  preferredModels: unknown;
}

export interface InvalidImageInput {
  ok: false;
  status: number;
  errorCode: string;
  error: string;
}

export function validateRecognizeProductPayload(
  payload: unknown
): ValidatedImageInput | InvalidImageInput {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      status: 400,
      errorCode: 'INVALID_PAYLOAD',
      error: 'Request body must be a JSON object.',
    };
  }

  const body = payload as Record<string, unknown>;
  const rawImage = body.imageBase64;
  if (typeof rawImage !== 'string' || !rawImage.trim()) {
    return {
      ok: false,
      status: 400,
      errorCode: 'INVALID_IMAGE',
      error: 'Missing imageBase64 payload.',
    };
  }

  let detectedMimeFromPrefix: string | null = null;
  let cleanBase64 = rawImage.trim();

  const dataUrlMatch = cleanBase64.match(/^data:([^;]+);base64,([\s\S]*)$/i);
  if (dataUrlMatch) {
    detectedMimeFromPrefix = dataUrlMatch[1].trim().toLowerCase();
    cleanBase64 = dataUrlMatch[2].trim();
  }

  // Strip whitespace inside base64 if present
  cleanBase64 = cleanBase64.replace(/\s+/g, '');

  if (!cleanBase64) {
    return {
      ok: false,
      status: 400,
      errorCode: 'INVALID_IMAGE',
      error: 'Image payload is empty.',
    };
  }

  if (cleanBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return {
      ok: false,
      status: 413,
      errorCode: 'PAYLOAD_TOO_LARGE',
      error: 'Uploaded image is too large for recognition. Please use a smaller image.',
    };
  }

  const requestedMime =
    typeof body.mimeType === 'string' && body.mimeType.trim()
      ? body.mimeType.trim().toLowerCase()
      : detectedMimeFromPrefix || 'image/jpeg';

  const normalizedMime = requestedMime === 'image/jpg' ? 'image/jpeg' : requestedMime;
  if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedMime)) {
    return {
      ok: false,
      status: 400,
      errorCode: 'UNSUPPORTED_IMAGE_FORMAT',
      error: 'Unsupported image format. Please upload a PNG, JPG, WEBP, or GIF image.',
    };
  }

  // Verify base64 characters cleanly without Node Buffer dependency
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanBase64) || cleanBase64.length % 4 === 1) {
    return {
      ok: false,
      status: 400,
      errorCode: 'MALFORMED_IMAGE_BASE64',
      error: 'Malformed base64 image encoding.',
    };
  }

  const fileName =
    typeof body.fileName === 'string' && body.fileName.trim()
      ? body.fileName.trim().slice(0, 180)
      : undefined;

  return {
    ok: true,
    cleanBase64,
    mimeType: normalizedMime,
    fileName,
    preferredModels: body.preferredModels,
  };
}

function buildAnalysisPrompt(fileName?: string): string {
  return `Analyze this product reference image for an editorial product photography studio.
Classify the physical product into exactly one of these productType values:
- "tshirt": short-sleeve or long-sleeve tee / t-shirt
- "sweatshirt": crewneck pullover sweatshirt without a hood
- "hoodie": hooded sweatshirt (pullover or zip-up with hood)
- "notebook": hardcover or softcover notebook, journal, planner, sketchbook
- "mug": ceramic or enamel coffee/tea mug with handle
- "glass": drinking glass, rocks glass, pint glass, stemless glassware
- "waterBottle": reusable water bottle, vacuum flask, canteen
- "tumbler": insulated travel tumbler, cup with lid/straw
- "poster": wall art print, poster, framed or unframed artwork print
- "other": anything else (such as desk mat, mousepad, laptop sleeve, tote bag, coaster, sticker, enamel pin, cap, pillow, etc.)

Rules:
1. If productType is "other", set customProductType to a concise, accurate product name (e.g. "Desk Mat", "Mousepad", "Laptop Sleeve", "Canvas Tote Bag", "Ceramic Coaster"). Otherwise set customProductType to "".
2. Set detectedLabel to a concise, accurate 1-4 word label for what is shown (e.g. "Heavyweight Pullover Hoodie", "Ceramic Mug", "Desk Mat", "Hardcover Journal").
3. Set surfaceFormFactor to the physical form factor that best describes how this item should be photographed:
   - "garment" for t-shirts, sweatshirts, hoodies
   - "book-or-notebook" for notebooks, journals, books
   - "vessel" for mugs, glasses, water bottles, tumblers, cups
   - "wall-art-print" for posters, art prints, framed prints
   - "flat-accessory" for desk mats, mousepads, laptop sleeves, coasters, flat pouches, tote bags, stickers
   - "three-dimensional-object" for upright 3D objects that are not vessels (e.g., lamps, figurines, sculptures, candles)
4. Set briefNotes to one short phrase noting key visible elements (e.g. "Front chest graphic visible", "Wrap-around illustration with handle", "Rectangular desk mat with stitched edge").${
    fileName ? `\nFilename hint (use only if visually consistent): ${fileName}` : ''
  }`;
}

/**
 * Shared product-recognition request handler for both Cloudflare Workers and local Express dev server.
 */
export async function handleRecognizeProductRequest(
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

  const ai = getGeminiClient(config.geminiApiKey);
  if (!ai) {
    return jsonResponse(
      {
        available: false,
        errorCode: 'API_KEY_MISSING',
        error: 'Product recognition service is unavailable (GEMINI_API_KEY is not configured).',
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
          error: 'Request payload exceeds maximum allowed size.',
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
        error: 'Request payload exceeds maximum allowed size.',
      },
      413
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = rawBodyText ? JSON.parse(rawBodyText) : null;
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

  const { models: candidateModels } = sanitizeCandidateModelList(validated.preferredModels);
  const analysisPrompt = buildAnalysisPrompt(validated.fileName);

  const fallbackOutcome = await executeWithModelFallback({
    candidateModels,
    cooldowns: sharedModelCooldowns,
    invokeModel: async (modelId, capability) => {
      const requestConfig: Record<string, unknown> = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productType: {
              type: Type.STRING,
              enum: [...PRODUCT_TYPES],
              description: 'Mapped ProductType category.',
            },
            customProductType: {
              type: Type.STRING,
              description: 'Specific product name when productType is other, otherwise empty string.',
            },
            detectedLabel: {
              type: Type.STRING,
              description: 'Short human-readable label for the detected product.',
            },
            surfaceFormFactor: {
              type: Type.STRING,
              enum: [...FORM_FACTORS],
              description: 'Physical form factor for staging orientation.',
            },
            confidence: {
              type: Type.STRING,
              enum: ['high', 'medium', 'low'],
            },
            briefNotes: {
              type: Type.STRING,
              description: 'Short phrase describing key visual elements for staging.',
            },
          },
          required: [
            'productType',
            'customProductType',
            'detectedLabel',
            'surfaceFormFactor',
            'confidence',
            'briefNotes',
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
        throw new Error(`Empty recognition response from ${modelId}.`);
      }

      const parsed = JSON.parse(rawText);
      const productType = PRODUCT_TYPES.includes(parsed.productType)
        ? parsed.productType
        : 'other';
      const surfaceFormFactor = FORM_FACTORS.includes(parsed.surfaceFormFactor)
        ? parsed.surfaceFormFactor
        : 'three-dimensional-object';

      return {
        productType,
        customProductType:
          productType === 'other' && typeof parsed.customProductType === 'string'
            ? parsed.customProductType.trim()
            : '',
        detectedLabel:
          typeof parsed.detectedLabel === 'string' && parsed.detectedLabel.trim()
            ? parsed.detectedLabel.trim()
            : productType,
        surfaceFormFactor,
        confidence:
          parsed.confidence === 'high' ||
          parsed.confidence === 'medium' ||
          parsed.confidence === 'low'
            ? parsed.confidence
            : 'medium',
        briefNotes:
          typeof parsed.briefNotes === 'string' ? parsed.briefNotes.trim() : '',
      };
    },
  });

  if (fallbackOutcome.ok) {
    return jsonResponse(
      {
        available: true,
        modelUsed: fallbackOutcome.modelUsed,
        attemptedModels: fallbackOutcome.attemptedModels,
        recognition: fallbackOutcome.result,
      },
      200
    );
  }

  console.error(
    '[productRecognition] Gemini recognition fallback exhausted:',
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

/**
 * Unified Fetch API router for all /api/* endpoints shared between Cloudflare Workers and local dev server.
 * Guarantees /api/* requests always receive JSON and never fall through to SPA HTML.
 */
export async function handleApiRequest(
  request: Request,
  config: ServerRuntimeConfig
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === '/api/health') {
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }
    return jsonResponse({
      ok: true,
      recognitionAvailable: Boolean(config.geminiApiKey?.trim()),
    });
  }

  if (pathname === '/api/ai-models/status') {
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }
    return jsonResponse({
      recognitionAvailable: Boolean(config.geminiApiKey?.trim()),
      cooldowns: sharedModelCooldowns.getAllActive(),
    });
  }

  if (pathname === '/api/ai-models/reset-cooldowns') {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }
    sharedModelCooldowns.clearAll();
    return jsonResponse({
      ok: true,
      cooldowns: [],
    });
  }

  if (pathname === '/api/recognize-product' || pathname === '/api/analyze-product') {
    return handleRecognizeProductRequest(request, config);
  }

  return jsonResponse(
    {
      errorCode: 'API_NOT_FOUND',
      error: 'API endpoint not found.',
    },
    404
  );
}
