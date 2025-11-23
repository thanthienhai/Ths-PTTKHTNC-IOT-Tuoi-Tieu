// Redis client and cache utilities
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function connectRedis(url: string): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Too many reconnection attempts');
          return new Error('Too many reconnection attempts');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis reconnecting...');
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });

  await redisClient.connect();

  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis first.');
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected');
  }
}

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

export class CacheManager {
  private client: RedisClientType;
  private defaultTTL: number = 300; // 5 minutes

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttl);
    return value;
  }
}

// ============================================================================
// CACHE KEY BUILDERS
// ============================================================================

export const CacheKeys = {
  // Active sessions
  session: (userId: string) => `session:${userId}`,
  
  // Device status
  deviceStatus: (deviceId: string) => `device:status:${deviceId}`,
  allDeviceStatus: (farmId: string) => `device:status:farm:${farmId}:*`,
  
  // Latest sensor readings
  latestReading: (sensorId: string) => `sensor:latest:${sensorId}`,
  zoneReadings: (zoneId: string) => `sensor:zone:${zoneId}`,
  
  // Weather forecasts
  weatherForecast: (lat: number, lon: number) => `weather:${lat}:${lon}`,
  
  // Water availability
  waterAvailability: (farmId: string) => `water:availability:${farmId}`,
  
  // Irrigation schedules (active)
  activeSchedules: (zoneId: string) => `schedule:active:${zoneId}`,
  
  // User permissions
  userPermissions: (userId: string) => `user:permissions:${userId}`,
  
  // Rate limiting
  rateLimit: (userId: string, endpoint: string) => `ratelimit:${userId}:${endpoint}`,
  
  // Analytics cache
  analytics: (type: string, zoneId: string, period: string) => 
    `analytics:${type}:${zoneId}:${period}`,
};

// ============================================================================
// REAL-TIME DATA STRUCTURES
// ============================================================================

export class RealtimeDataManager {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Store latest sensor reading
   */
  async storeLatestReading(sensorId: string, reading: any): Promise<void> {
    const key = CacheKeys.latestReading(sensorId);
    await this.client.setEx(key, 600, JSON.stringify(reading)); // 10 minutes TTL
  }

  /**
   * Get latest sensor reading
   */
  async getLatestReading(sensorId: string): Promise<any | null> {
    const key = CacheKeys.latestReading(sensorId);
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(deviceId: string, status: any): Promise<void> {
    const key = CacheKeys.deviceStatus(deviceId);
    await this.client.setEx(key, 300, JSON.stringify(status)); // 5 minutes TTL
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<any | null> {
    const key = CacheKeys.deviceStatus(deviceId);
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Store active schedule
   */
  async storeActiveSchedule(zoneId: string, schedule: any): Promise<void> {
    const key = CacheKeys.activeSchedules(zoneId);
    await this.client.setEx(key, 3600, JSON.stringify(schedule)); // 1 hour TTL
  }

  /**
   * Get active schedule
   */
  async getActiveSchedule(zoneId: string): Promise<any | null> {
    const key = CacheKeys.activeSchedules(zoneId);
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Clear active schedule
   */
  async clearActiveSchedule(zoneId: string): Promise<void> {
    const key = CacheKeys.activeSchedules(zoneId);
    await this.client.del(key);
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export class RateLimiter {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Check and increment rate limit
   * @returns true if allowed, false if rate limit exceeded
   */
  async checkLimit(
    userId: string,
    endpoint: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<boolean> {
    const key = CacheKeys.rateLimit(userId, endpoint);
    
    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        // First request in window, set expiration
        await this.client.expire(key, windowSeconds);
      }
      
      return current <= maxRequests;
    } catch (error) {
      console.error('Rate limit check error:', error);
      // On error, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get remaining requests
   */
  async getRemaining(
    userId: string,
    endpoint: string,
    maxRequests: number
  ): Promise<number> {
    const key = CacheKeys.rateLimit(userId, endpoint);
    
    try {
      const current = await this.client.get(key);
      const used = current ? parseInt(current, 10) : 0;
      return Math.max(0, maxRequests - used);
    } catch (error) {
      console.error('Get remaining error:', error);
      return maxRequests;
    }
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export class SessionManager {
  private client: RedisClientType;
  private sessionTTL: number = 86400; // 24 hours

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Store user session
   */
  async storeSession(userId: string, sessionData: any): Promise<void> {
    const key = CacheKeys.session(userId);
    await this.client.setEx(key, this.sessionTTL, JSON.stringify(sessionData));
  }

  /**
   * Get user session
   */
  async getSession(userId: string): Promise<any | null> {
    const key = CacheKeys.session(userId);
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete user session
   */
  async deleteSession(userId: string): Promise<void> {
    const key = CacheKeys.session(userId);
    await this.client.del(key);
  }

  /**
   * Refresh session TTL
   */
  async refreshSession(userId: string): Promise<void> {
    const key = CacheKeys.session(userId);
    await this.client.expire(key, this.sessionTTL);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});
