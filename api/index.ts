/**
 * TruthCart AI - Vercel Serverless Function Handler
 * Wraps the Express application routes for Vercel deployment.
 */
import 'dotenv/config';
import express from 'express';
import { registerRoutes } from '../src/server/routes';

const app = express();

// Register all API routes
registerRoutes(app);

export default app;
