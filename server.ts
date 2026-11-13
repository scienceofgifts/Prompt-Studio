import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './src/server/productRecognition';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const app = express();

  // Share the exact Web Fetch API handler used by Cloudflare Worker (worker.ts)
  app.use('/api', express.raw({ type: '*/*', limit: '16mb' }), async (req, res) => {
    try {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || `localhost:${PORT}`;
      const targetUrl = `${protocol}://${host}${req.originalUrl}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          for (const item of value) {
            headers.append(key, item);
          }
        }
      }

      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const bodyBuffer =
        hasBody && Buffer.isBuffer(req.body) && req.body.length > 0
          ? new Uint8Array(req.body)
          : undefined;

      const webRequest = new Request(targetUrl, {
        method: req.method,
        headers,
        body: bodyBuffer,
      });

      const webResponse = await handleApiRequest(webRequest, {
        geminiApiKey: process.env.GEMINI_API_KEY,
      });

      res.status(webResponse.status);
      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const responseText = await webResponse.text();
      return res.send(responseText);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error.';
      console.error('[server.ts] Failed to process /api request:', message);
      return res.status(500).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        error: 'Unable to process API request.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Science of Gifts Prompt Studio running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
