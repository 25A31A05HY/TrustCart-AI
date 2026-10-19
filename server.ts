/**
 * TruthCart AI - Full-Stack Express Server with Vite Middleware
 * Implements typed API endpoints for Chat, Catalogue, Ingestion, Retrieval,
 * Verification, Policies, and Adversarial Evaluation.
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { registerRoutes } from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Register all shared API routes
  registerRoutes(app);

  // 8. Serve Frontend (Vite middleware in dev, static files in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('[Vite] Middleware mode setup warning:', e);
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TruthCart AI] Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[TruthCart AI] Port ${PORT} is already in use.`);
    } else {
      console.error('[TruthCart AI] Server error:', err);
    }
  });
}

startServer().catch(err => {
  console.error('Failed to start TruthCart server:', err);
});
