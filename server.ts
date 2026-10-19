/**
 * TruthCart AI - Full-Stack Express Server with Vite Middleware
 * Implements typed API endpoints for Chat, Catalogue, Ingestion, Retrieval,
 * Verification, Policies, and Adversarial Evaluation.
 */
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { processUserMessage } from './src/engine/agent';
import { runAdversarialBenchmark } from './src/engine/benchmark';
import { indexStore } from './src/engine/indexStore';
import { hybridRetrieve } from './src/engine/retrieval';
import { verifyClaims } from './src/engine/verifier';
import { BenchmarkSuiteSummary, EngineMode, UserConstraints } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory evaluation runs cache
const evaluationRuns: BenchmarkSuiteSummary[] = [];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // Request logger for diagnostic tracing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const start = Date.now();
      res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${ms}ms)`);
      });
    }
    next();
  });

  // 1. Health & Readiness
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'TruthCart AI Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/readiness', (req: Request, res: Response) => {
    const status = indexStore.getStatus();
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    res.json({
      ready: status.initialized && status.productCount > 0,
      indexStatus: status,
      modelAdapters: {
        deterministicOffline: { ready: true, model: 'TruthCart Rule & Index Engine' },
        geminiOnline: { ready: hasGeminiKey, model: configuredModel }
      }
    });
  });

  // Simple in-memory rate limiting map (IP -> timestamps)
  const rateLimitMap = new Map<string, number[]>();

  // 2. Chat & Multi-turn Conversational Shopping
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
      const now = Date.now();
      const windowMs = 60 * 1000;
      const maxRequests = 40;

      // Rate limiting check
      let timestamps = rateLimitMap.get(clientIp) || [];
      timestamps = timestamps.filter(t => now - t < windowMs);
      if (timestamps.length >= maxRequests) {
        res.status(429).json({
          error: true,
          message: 'Too many requests. Please wait a minute before sending more shopping messages.',
          retryable: true
        });
        return;
      }
      timestamps.push(now);
      rateLimitMap.set(clientIp, timestamps);

      const {
        message,
        history = [],
        constraints = { inStockOnly: false, requiredFeatures: [] },
        engineMode = Boolean(process.env.GEMINI_API_KEY) ? 'gemini' : 'deterministic_offline'
      } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: true, message: 'Field "message" is required and cannot be empty.' });
        return;
      }

      const response = await processUserMessage(
        message.trim(),
        Array.isArray(history) ? history : [],
        constraints as UserConstraints,
        engineMode as EngineMode
      );

      res.json(response);
    } catch (err: any) {
      console.error('Error in /api/chat:', err);
      const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
      res.status(status).json({
        error: true,
        message: err?.message || 'Internal shopping assistant processing error',
        details: err?.originalError || err?.message,
        retryable: status === 503 || status === 429 || status === 500 || err?.code === 'ECONNRESET'
      });
    }
  });

  // 3. Products Discovery & Filtering
  app.get('/api/products', (req: Request, res: Response) => {
    let prods = indexStore.getAllProducts();
    const { category, brand, maxPrice, minPrice, inStock, minRating, q } = req.query;

    if (category) {
      prods = prods.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (brand) {
      prods = prods.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (maxPrice) {
      const max = parseFloat(String(maxPrice));
      if (!isNaN(max)) prods = prods.filter(p => p.price <= max);
    }
    if (minPrice) {
      const min = parseFloat(String(minPrice));
      if (!isNaN(min)) prods = prods.filter(p => p.price >= min);
    }
    if (inStock === 'true') {
      prods = prods.filter(p => p.inStock && p.stockCount > 0);
    }
    if (minRating) {
      const r = parseFloat(String(minRating));
      if (!isNaN(r)) prods = prods.filter(p => p.rating >= r);
    }
    if (q) {
      const term = String(q).toLowerCase();
      prods = prods.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    res.json({
      total: prods.length,
      products: prods
    });
  });

  app.get('/api/products/:productId', (req: Request, res: Response) => {
    const prod = indexStore.getProductById(req.params.productId);
    if (!prod) {
      res.status(404).json({ error: `Product ID '${req.params.productId}' not found in catalogue.` });
      return;
    }
    res.json(prod);
  });

  // 4. Policy Retrieval
  app.get('/api/policies', (req: Request, res: Response) => {
    res.json(indexStore.getAllPolicies());
  });

  app.get('/api/policies/search', (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q) {
      res.json(indexStore.getAllPolicies());
      return;
    }

    const ret = hybridRetrieve(String(q), undefined, 6);
    const policyChunks = ret.results.filter(r => r.chunk.type === 'policy_clause');
    res.json({
      query: q,
      totalMatched: policyChunks.length,
      clauses: policyChunks.map(c => ({
        clauseId: c.chunk.sourceId,
        title: c.chunk.sourceTitle,
        snippet: c.chunk.content,
        score: c.combinedScore
      }))
    });
  });

  // 5. Diagnostics: Direct Retrieval and Direct Claim Verification
  app.post('/api/retrieve', (req: Request, res: Response) => {
    const { query, constraints, topK = 5 } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }
    const results = hybridRetrieve(query, constraints, topK);
    res.json(results);
  });

  app.post('/api/verify', (req: Request, res: Response) => {
    const { text, productId } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text parameter is required' });
      return;
    }
    const chunks = indexStore.getChunks();
    const product = productId ? indexStore.getProductById(productId) : undefined;
    const report = verifyClaims(text, chunks, product ? [product] : []);
    res.json(report);
  });

  // 6. Administration: Ingestion
  app.post('/api/admin/import/catalogue', (req: Request, res: Response) => {
    const { products, mode = 'append' } = req.body;
    if (!Array.isArray(products)) {
      res.status(400).json({ error: 'Payload must contain a "products" array' });
      return;
    }
    const log = indexStore.importProducts(products, mode);
    res.json({
      success: log.recordsFailed === 0,
      log,
      currentStatus: indexStore.getStatus()
    });
  });

  app.post('/api/admin/import/policies', (req: Request, res: Response) => {
    const { policies, mode = 'append' } = req.body;
    if (!Array.isArray(policies)) {
      res.status(400).json({ error: 'Payload must contain a "policies" array' });
      return;
    }
    const log = indexStore.importPolicies(policies, mode);
    res.json({
      success: log.recordsFailed === 0,
      log,
      currentStatus: indexStore.getStatus()
    });
  });

  app.get('/api/admin/history', (req: Request, res: Response) => {
    res.json(indexStore.getIngestionHistory());
  });

  app.post('/api/admin/reset', (req: Request, res: Response) => {
    indexStore.initializeDefaultData();
    res.json({
      message: 'Catalogue and policies reset to canonical baseline',
      currentStatus: indexStore.getStatus()
    });
  });

  // 7. Evaluation & Adversarial Benchmark
  app.post('/api/evaluation/run', async (req: Request, res: Response) => {
    try {
      const { engineMode = 'deterministic_offline' } = req.body;
      const summary = await runAdversarialBenchmark(engineMode as EngineMode);
      evaluationRuns.unshift(summary);
      res.json(summary);
    } catch (err: any) {
      console.error('Error running evaluation:', err);
      res.status(500).json({ error: 'Evaluation run failed', details: err?.message });
    }
  });

  app.get('/api/evaluation/runs', (req: Request, res: Response) => {
    res.json({
      totalRuns: evaluationRuns.length,
      latestRun: evaluationRuns[0] || null,
      runs: evaluationRuns.slice(0, 10)
    });
  });

  app.get('/api/evaluation/runs/:runId', (req: Request, res: Response) => {
    const idParam = req.params.runId;
    const idx = parseInt(idParam, 10);
    
    // Check if index
    if (!isNaN(idx) && idx >= 0 && idx < evaluationRuns.length) {
      res.json(evaluationRuns[idx]);
      return;
    }

    // Check if matching timestamp or ID
    const matched = evaluationRuns.find(r => r.runTimestamp === idParam);
    if (matched) {
      res.json(matched);
      return;
    }

    res.status(404).json({ error: `Evaluation run '${idParam}' not found.` });
  });

  // 8. Serve Frontend (Vite middleware in dev, static files in production)
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TruthCart AI] Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start TruthCart server:', err);
  process.exit(1);
});
