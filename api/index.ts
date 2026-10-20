
import 'dotenv/config';
import express from 'express';
import { registerRoutes } from '../src/server/routes';

const app = express();

registerRoutes(app);

export default app;
