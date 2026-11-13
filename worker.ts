import { handleApiRequest } from './src/server/productRecognition';

export interface AssetsFetcher {
  fetch(request: Request | string): Promise<Response>;
}

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: AssetsFetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle all /api/* requests inside the Worker; never return SPA index.html for API routes
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, {
        geminiApiKey: env.GEMINI_API_KEY,
      });
    }

    // Serve static frontend assets and SPA routes via Cloudflare Assets binding
    return env.ASSETS.fetch(request);
  },
};
