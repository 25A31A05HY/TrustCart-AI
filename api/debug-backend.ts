
import express from 'express';
import { registerRoutes } from '../src/server/routes';

const app = express();

registerRoutes(app);

export default function handler(req: any, res: any) {
  return res.status(200).json({
    success: true,
    message: 'Backend modules loaded and routes registered'
  });
}
