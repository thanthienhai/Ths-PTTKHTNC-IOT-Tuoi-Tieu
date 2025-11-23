// Rate limiting middleware
import { Request, Response, NextFunction } from 'express';
import { RateLimiter, getRedisClient } from '@irrigation/shared';
import { config } from '../config';
import { AppError } from './errorHandler';

const rateLimiter = new RateLimiter(getRedisClient());

export function createRateLimiter(maxRequests?: number, windowSeconds?: number) {
  const max = maxRequests || config.rateLimit.maxRequests;
  const window = windowSeconds || config.rateLimit.windowMs / 1000;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user ID from auth or use IP address
      const userId = (req as any).user?.id || req.ip || 'anonymous';
      const endpoint = req.path;

      const allowed = await rateLimiter.checkLimit(userId, endpoint, max, window);

      if (!allowed) {
        const remaining = await rateLimiter.getRemaining(userId, endpoint, max);
        
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', (Date.now() + window * 1000).toString());

        throw new AppError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED');
      }

      const remaining = await rateLimiter.getRemaining(userId, endpoint, max);
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        // On error, allow the request (fail open)
        console.error('Rate limit check error:', error);
        next();
      }
    }
  };
}
