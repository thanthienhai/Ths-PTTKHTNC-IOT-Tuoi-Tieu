// Route setup
import { Application } from 'express';
import { metricsHandler } from '../middleware/metrics';
import authRoutes from './auth';
import proxyRoutes from './proxy';

export function setupRoutes(app: Application) {
  // Metrics endpoint
  app.get('/metrics', metricsHandler);

  // Authentication routes
  app.use('/api/auth', authRoutes);

  // Proxy routes to microservices
  app.use('/api', proxyRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
      timestamp: new Date().toISOString(),
    });
  });
}
