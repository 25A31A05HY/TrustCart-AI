/**
 * TruthCart AI - Vercel Serverless Function Handler
 * Canonical source for the unified Express serverless API entry point.
 */
import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes';

const app = express();

// Register all API routes mounted on both /api and /
registerRoutes(app);

export default app;
