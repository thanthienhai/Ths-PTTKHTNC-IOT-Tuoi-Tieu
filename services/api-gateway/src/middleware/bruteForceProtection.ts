// Brute-force protection middleware
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '@irrigation/shared';
import { AppError } from './errorHandler';

const redisClient = getRedisClient();

interface BruteForceConfig {
  maxAttempts: number;
  windowMinutes: number;
  lockoutMinutes: number;
}

const defaultConfig: BruteForceConfig = {
  maxAttempts: 5,
  windowMinutes: 5,
  lockoutMinutes: 15,
};

/**
 * Track failed login attempts
 */
export async function trackFailedAttempt(identifier: string, config: BruteForceConfig = defaultConfig): Promise<void> {
  const key = `bruteforce:${identifier}`;
  const lockKey = `bruteforce:lock:${identifier}`;

  try {
    // Increment failed attempts
    const attempts = await redisClient.incr(key);

    // Set expiration on first attempt
    if (attempts === 1) {
      await redisClient.expire(key, config.windowMinutes * 60);
    }

    // Lock account if max attempts reached
    if (attempts >= config.maxAttempts) {
      await redisClient.setEx(lockKey, config.lockoutMinutes * 60, 'locked');
      console.warn(`Account locked due to brute force: ${identifier}`);
    }
  } catch (error) {
    console.error('Error tracking failed attempt:', error);
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(identifier: string): Promise<boolean> {
  const lockKey = `bruteforce:lock:${identifier}`;

  try {
    const locked = await redisClient.get(lockKey);
    return locked === 'locked';
  } catch (error) {
    console.error('Error checking account lock:', error);
    return false; // Fail open
  }
}

/**
 * Get remaining attempts
 */
export async function getRemainingAttempts(identifier: string, config: BruteForceConfig = defaultConfig): Promise<number> {
  const key = `bruteforce:${identifier}`;

  try {
    const attempts = await redisClient.get(key);
    const current = attempts ? parseInt(attempts, 10) : 0;
    return Math.max(0, config.maxAttempts - current);
  } catch (error) {
    console.error('Error getting remaining attempts:', error);
    return config.maxAttempts; // Fail open
  }
}

/**
 * Get lockout time remaining
 */
export async function getLockoutTimeRemaining(identifier: string): Promise<number> {
  const lockKey = `bruteforce:lock:${identifier}`;

  try {
    const ttl = await redisClient.ttl(lockKey);
    return Math.max(0, ttl);
  } catch (error) {
    console.error('Error getting lockout time:', error);
    return 0;
  }
}

/**
 * Reset failed attempts (on successful login)
 */
export async function resetFailedAttempts(identifier: string): Promise<void> {
  const key = `bruteforce:${identifier}`;
  const lockKey = `bruteforce:lock:${identifier}`;

  try {
    await redisClient.del(key);
    await redisClient.del(lockKey);
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
}

/**
 * Brute-force protection middleware
 */
export function bruteForceProtection(
  getIdentifier: (req: Request) => string,
  config: BruteForceConfig = defaultConfig
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getIdentifier(req);

      // Check if account is locked
      const locked = await isAccountLocked(identifier);

      if (locked) {
        const timeRemaining = await getLockoutTimeRemaining(identifier);
        const minutesRemaining = Math.ceil(timeRemaining / 60);

        throw new AppError(
          429,
          `Account temporarily locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          'ACCOUNT_LOCKED',
          { timeRemaining, minutesRemaining }
        );
      }

      // Get remaining attempts
      const remaining = await getRemainingAttempts(identifier, config);

      // Add remaining attempts to response headers
      res.setHeader('X-RateLimit-Remaining-Attempts', remaining.toString());

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        // On error, allow the request (fail open)
        console.error('Brute force protection error:', error);
        next();
      }
    }
  };
}

/**
 * Middleware to track failed login
 */
export function trackLoginFailure(getIdentifier: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;

    // Override send to check response
    res.send = function (data: any) {
      // Check if login failed (401 status)
      if (res.statusCode === 401) {
        const identifier = getIdentifier(req);
        trackFailedAttempt(identifier).catch(err => {
          console.error('Error tracking failed attempt:', err);
        });
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Middleware to reset attempts on successful login
 */
export function resetOnSuccess(getIdentifier: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;

    // Override send to check response
    res.send = function (data: any) {
      // Check if login succeeded (200 status)
      if (res.statusCode === 200) {
        const identifier = getIdentifier(req);
        resetFailedAttempts(identifier).catch(err => {
          console.error('Error resetting failed attempts:', err);
        });
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}
