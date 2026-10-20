
import express from 'express';

export default async function handler(req: any, res: any) {
  try {
    const app = express();

    // Dynamically load the real backend so import errors can be caught.
    const routes = await import('../src/server/routes');

    routes.registerRoutes(app);

    return res.status(200).json({
      success: true,
      message: 'Backend modules loaded and routes registered'
    });
  } catch (error: any) {
    console.error('[Backend diagnostic]', error);

    return res.status(500).json({
      success: false,
      errorName: error?.name ?? 'Error',
      errorMessage: error?.message ?? String(error)
    });
  }
}
