// Configuration
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  postgres: {
    url: process.env.POSTGRES_URL || 'postgresql://irrigation_user:irrigation_pass@localhost:5432/irrigation_db',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
    refreshExpiresIn: '7d',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Service URLs
  services: {
    sensor: process.env.SENSOR_SERVICE_URL || 'http://sensor-service:3001',
    irrigation: process.env.IRRIGATION_SERVICE_URL || 'http://irrigation-service:3002',
    weather: process.env.WEATHER_SERVICE_URL || 'http://weather-service:3003',
    alert: process.env.ALERT_SERVICE_URL || 'http://alert-service:3004',
    user: process.env.USER_SERVICE_URL || 'http://user-service:3005',
    device: process.env.DEVICE_SERVICE_URL || 'http://device-service:3006',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3007',
    report: process.env.REPORT_SERVICE_URL || 'http://report-service:3008',
  },
};
