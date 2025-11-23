// Authentication routes
import { Router, Request, Response, NextFunction } from 'express';
import { login, refreshAccessToken, logout } from '../services/authService';
import { LoginCredentialsSchema } from '@irrigation/shared';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';
import { bruteForceProtection, trackLoginFailure, resetOnSuccess } from '../middleware/bruteForceProtection';

const router = Router();

// Apply rate limiting to auth routes
const authRateLimit = createRateLimiter(5, 60); // 5 requests per minute

// Brute-force protection for login
const loginBruteForce = bruteForceProtection((req) => req.body.username || req.ip);
const trackFailure = trackLoginFailure((req) => req.body.username || req.ip);
const resetSuccess = resetOnSuccess((req) => req.body.username || req.ip);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authRateLimit, loginBruteForce, trackFailure, resetSuccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const credentials = LoginCredentialsSchema.parse(req.body);

    // Login
    const result = await login(credentials);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    await logout(req.user.id);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: req.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
