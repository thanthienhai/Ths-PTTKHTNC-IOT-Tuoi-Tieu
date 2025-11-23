// Irrigation Service - Main Entry Point
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { connectMongoDB, connectRedis } from '@irrigation/shared';
import scheduleRoutes from './routes/schedules';
import zoneRoutes from './routes/zones';
import controlRoutes from './routes/control';

const app = express();
const PORT = process.env.PORT || 3002;
export const prisma = new PrismaClient();

app.use(express.json());

// Health checks
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});

// Routes
app.use('/schedules', scheduleRoutes);
app.use('/zones', zoneRoutes);
app.use('/control', controlRoutes);

async function start() {
  await connectMongoDB(process.env.MONGODB_URL!);
  await connectRedis(process.env.REDIS_URL!);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Irrigation Service on port ${PORT}`));
}

start();
