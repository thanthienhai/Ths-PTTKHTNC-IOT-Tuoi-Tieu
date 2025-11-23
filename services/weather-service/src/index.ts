// Weather Service - Main Entry Point
import express from 'express';
import axios from 'axios';
import { connectRedis, CacheManager, getRedisClient, WeatherData } from '@irrigation/shared';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3003;
const prisma = new PrismaClient();

app.use(express.json());

// Health checks
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// Get weather forecast
app.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'lat and lon required' });
    }
    
    const cache = new CacheManager(getRedisClient());
    const cacheKey = `weather:${lat}:${lon}`;
    
    // Check cache
    let forecast = await cache.get(cacheKey);
    if (forecast) {
      return res.json({ success: true, data: forecast, cached: true });
    }
    
    // Fetch from external API (mock for now)
    forecast = {
      location: { latitude: Number(lat), longitude: Number(lon) },
      timestamp: new Date(),
      forecasts: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000),
        temperature: { min: 15 + i, max: 25 + i, avg: 20 + i },
        humidity: 60 + i,
        rainfall: Math.random() * 10,
        windSpeed: 10 + Math.random() * 5,
        solarRadiation: 15 + Math.random() * 5,
      })),
    };
    
    // Cache for 1 hour
    await cache.set(cacheKey, forecast, 3600);
    
    res.json({ success: true, data: forecast, cached: false });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await connectRedis(process.env.REDIS_URL!);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Weather Service on port ${PORT}`));
}

start();
