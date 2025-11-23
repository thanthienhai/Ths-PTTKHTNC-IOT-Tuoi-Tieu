// API Gateway - Main Entry Point
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { metricsMiddleware } from './middleware/metrics';
import { setupRoutes } from './routes';
import { connectRedis } from '@irrigation/shared';
import { PrismaClient } from '@prisma/client';

const app: Application = express();
export const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging and metrics
app.use(requestLogger);
app.use(metricsMiddleware);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// Setup routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Connect to Redis
    await connectRedis(config.redis.url);
    console.log('✅ Redis connected');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 API Gateway running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
