// Proxy routes to microservices
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Default rate limit for API routes
const apiRateLimit = createRateLimiter(100, 60); // 100 requests per minute

/**
 * Sensor Service Routes
 */
router.use(
  '/sensors',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.sensor,
    changeOrigin: true,
    pathRewrite: { '^/api/sensors': '' },
    onProxyReq: (proxyReq, req: any) => {
      // Forward user info to service
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Irrigation Service Routes
 */
router.use(
  '/irrigation',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.irrigation,
    changeOrigin: true,
    pathRewrite: { '^/api/irrigation': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Weather Service Routes
 */
router.use(
  '/weather',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.weather,
    changeOrigin: true,
    pathRewrite: { '^/api/weather': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Alert Service Routes
 */
router.use(
  '/alerts',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.alert,
    changeOrigin: true,
    pathRewrite: { '^/api/alerts': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * User Service Routes
 */
router.use(
  '/users',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.user,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Device Service Routes
 */
router.use(
  '/devices',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.device,
    changeOrigin: true,
    pathRewrite: { '^/api/devices': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Analytics Service Routes
 */
router.use(
  '/analytics',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.analytics,
    changeOrigin: true,
    pathRewrite: { '^/api/analytics': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Report Service Routes
 */
router.use(
  '/reports',
  authenticate,
  apiRateLimit,
  createProxyMiddleware({
    target: config.services.report,
    changeOrigin: true,
    pathRewrite: { '^/api/reports': '' },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

export default router;
