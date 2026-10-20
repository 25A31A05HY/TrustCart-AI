/**
 * TruthCart AI - Shared Express API Routes
 * Implements typed API endpoints for Chat, Catalogue, Ingestion, Retrieval,
 * Verification, Policies, Health, Readiness, and Adversarial Evaluation.
 */
import express, { Request, Response } from 'express';
import { processUserMessage } from '../engine/agent';
import { runAdversarialBenchmark } from '../engine/benchmark';
import { indexStore } from '../engine/indexStore';
import { hybridRetrieve } from '../engine/retrieval';
import { verifyClaims } from '../engine/verifier';
import { BenchmarkSuiteSummary, EngineMode, UserConstraints } from '../types';

// In-memory evaluation runs cache
const evaluationRuns: BenchmarkSuiteSummary[] = [];

// Simple in-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();

export function createApiRouter(): express.Router {
  const router = express.Router();

  // 1. Health & Readiness
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      message: 'TruthCart AI backend is running and healthy',
      service: 'TruthCart AI Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  router.get('/readiness', (req: Request, res: Response) => {
    const status = indexStore.getStatus();
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    res.json({
      ready: status.initialized && status.productCount > 0,
      indexStatus: status,
      modelAdapters: {
        deterministicOffline: { ready: true, model: 'TruthCart Rule & Index Engine' },
        geminiOnline: { ready: hasGeminiKey, model: configuredModel }
      }
    });
  });

  // 2. Chat & Multi-turn Conversational Shopping
  router.post('/chat', async (req: Request, res: Response) => {
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
      console.error('[TrustShield API] Error in /chat:', err);

      let status = 500;
      let code = 'INTERNAL_ERROR';
      let category = 'SERVER_ERROR';
      let userFriendlyMessage = 'Internal shopping assistant processing error';
      let retryable = false;

      const rawMsg = String(err?.message || '');
      const rawStatus = err?.status;

      if (err?.code === 'GEMINI_API_KEY_MISSING' || rawMsg.includes('GEMINI_API_KEY is not configured')) {
        status = 401;
        code = 'MISSING_API_KEY';
        category = 'CONFIGURATION_ERROR';
        userFriendlyMessage = 'Gemini API key is not configured on the server. Please add your GEMINI_API_KEY in the environment or Secrets panel.';
      } else if (rawStatus === 404 || rawMsg.includes('not found') || rawMsg.includes('models/')) {
        status = 502;
        code = 'GEMINI_MODEL_NOT_FOUND';
        category = 'MODEL_ERROR';
        userFriendlyMessage = 'Configured Gemini model was not found or is unavailable for this API key. Please check GEMINI_MODEL in your server configuration.';
        retryable = true;
      } else if (rawStatus === 429 || rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('Quota exceeded')) {
        status = 429;
        code = 'GEMINI_QUOTA_EXCEEDED';
        category = 'RATE_LIMIT';
        userFriendlyMessage = 'Google Gemini free tier request quota exceeded. Please toggle to "Offline Grounded" mode in the header or retry later.';
        retryable = true;
      } else if (rawStatus === 401 || rawStatus === 403 || rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid')) {
        status = 401;
        code = 'GEMINI_AUTH_FAILED';
        category = 'AUTHENTICATION_ERROR';
        userFriendlyMessage = 'Gemini API authentication failed. The supplied GEMINI_API_KEY is invalid or unauthorized.';
      } else if (err?.code === 'TIMEOUT' || rawStatus === 504 || rawMsg.includes('timed out')) {
        status = 504;
        code = 'GEMINI_TIMEOUT';
        category = 'TIMEOUT';
        userFriendlyMessage = 'Request to Gemini AI timed out after multiple retry attempts. Please click Retry.';
        retryable = true;
      } else if (rawStatus === 503 || rawMsg.includes('503') || rawMsg.includes('high demand') || err?.code === 'ECONNRESET') {
        status = 503;
        code = 'GEMINI_UNAVAILABLE';
        category = 'SERVICE_OVERLOAD';
        userFriendlyMessage = 'Google Gemini service is temporarily unavailable or experiencing high demand. Please retry shortly.';
        retryable = true;
      } else {
        userFriendlyMessage = rawMsg || userFriendlyMessage;
      }

      res.status(status).json({
        error: true,
        code,
        category,
        message: userFriendlyMessage,
        details: err?.originalError || err?.message,
        upstreamStatus: rawStatus,
        retryable
      });
    }
  });

  // 3. Products Discovery & Filtering
  router.get('/products', (req: Request, res: Response) => {
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

  router.get('/products/:productId', (req: Request, res: Response) => {
    const prod = indexStore.getProductById(req.params.productId);
    if (!prod) {
      res.status(404).json({ error: `Product ID '${req.params.productId}' not found in catalogue.` });
      return;
    }
    res.json(prod);
  });

  // 4. Policy Retrieval
  router.get('/policies', (req: Request, res: Response) => {
    res.json(indexStore.getAllPolicies());
  });

  router.get('/policies/search', (req: Request, res: Response) => {
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
  router.post('/retrieve', (req: Request, res: Response) => {
    const { query, constraints, topK = 5 } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }
    const results = hybridRetrieve(query, constraints, topK);
    res.json(results);
  });

  router.post('/verify', (req: Request, res: Response) => {
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
  router.post('/admin/import/catalogue', (req: Request, res: Response) => {
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

  router.post('/admin/import/policies', (req: Request, res: Response) => {
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

  router.get('/admin/history', (req: Request, res: Response) => {
    res.json(indexStore.getIngestionHistory());
  });

  router.post('/admin/reset', (req: Request, res: Response) => {
    indexStore.initializeDefaultData();
    res.json({
      message: 'Catalogue and policies reset to canonical baseline',
      currentStatus: indexStore.getStatus()
    });
  });

  // 7. Evaluation & Adversarial Benchmark
  router.post('/evaluation/run', async (req: Request, res: Response) => {
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

  router.get('/evaluation/runs', (req: Request, res: Response) => {
    res.json({
      totalRuns: evaluationRuns.length,
      latestRun: evaluationRuns[0] || null,
      runs: evaluationRuns.slice(0, 10)
    });
  });

  router.get('/evaluation/runs/:runId', (req: Request, res: Response) => {
    const idParam = req.params.runId;
    const idx = parseInt(idParam, 10);
    
    if (!isNaN(idx) && idx >= 0 && idx < evaluationRuns.length) {
      res.json(evaluationRuns[idx]);
      return;
    }

    const matched = evaluationRuns.find(r => r.runTimestamp === idParam);
    if (matched) {
      res.json(matched);
      return;
    }

    res.status(404).json({ error: `Evaluation run '${idParam}' not found.` });
  });

  return router;
}

export function registerRoutes(app: express.Express) {
  app.use(express.json({ limit: '20mb' }));

  // Request logger for diagnostic tracing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/readiness') {
      const start = Date.now();
      res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${ms}ms)`);
      });
    }
    next();
  });

  const apiRouter = createApiRouter();

  // Mount router on BOTH '/api' and '/' to ensure full compatibility with
  // both local Express server and Vercel serverless functions (with or without prefix stripping)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);
}
