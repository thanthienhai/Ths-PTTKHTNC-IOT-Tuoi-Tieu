// Analytics Service - Main Entry Point
import express from 'express';
import { connectMongoDB, IrrigationHistory } from '@irrigation/shared';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3007;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// Water usage analysis
app.get('/water-usage/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { start, end } = req.query;
    
    const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end as string) : new Date();

    const history = await IrrigationHistory.find({
      zoneId,
      startTime: { $gte: startDate, $lte: endDate },
    });

    const totalWaterUsed = history.reduce((sum, h) => sum + h.waterUsed, 0);
    const irrigationCount = history.length;
    const averageDuration = irrigationCount > 0 
      ? history.reduce((sum, h) => sum + h.actualDuration, 0) / irrigationCount 
      : 0;

    // Get zone area for efficiency calculation
    const zone = await prisma.irrigationZone.findUnique({ where: { id: zoneId } });
    const efficiency = zone ? (totalWaterUsed / zone.area) : 0;

    res.json({
      success: true,
      data: {
        zoneId,
        period: { start: startDate, end: endDate },
        totalWaterUsed,
        irrigationCount,
        averageDuration,
        efficiency,
        averagePerDay: totalWaterUsed / Math.max(1, (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Zone comparison
app.get('/compare-zones', async (req, res) => {
  try {
    const { farmId, start, end } = req.query;
    
    if (!farmId) {
      return res.status(400).json({ success: false, error: 'farmId required' });
    }

    const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end as string) : new Date();

    const zones = await prisma.irrigationZone.findMany({
      where: { farmId: farmId as string },
    });

    const comparisons = await Promise.all(
      zones.map(async (zone) => {
        const history = await IrrigationHistory.find({
          zoneId: zone.id,
          startTime: { $gte: startDate, $lte: endDate },
        });

        const waterUsed = history.reduce((sum, h) => sum + h.waterUsed, 0);
        const efficiency = waterUsed / zone.area;

        return {
          zoneId: zone.id,
          zoneName: zone.name,
          waterUsed,
          efficiency,
          area: zone.area,
          waterPerSquareMeter: waterUsed / zone.area,
        };
      })
    );

    res.json({
      success: true,
      data: {
        zones: comparisons,
        period: { start: startDate, end: endDate },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trend analysis
app.get('/trends/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const history = await IrrigationHistory.find({
      zoneId,
      startTime: { $gte: startDate, $lte: endDate },
    }).sort({ startTime: 1 });

    // Group by day
    const dailyData: Record<string, { waterUsed: number; count: number }> = {};
    
    history.forEach((h) => {
      const day = h.startTime.toISOString().split('T')[0];
      if (!dailyData[day]) {
        dailyData[day] = { waterUsed: 0, count: 0 };
      }
      dailyData[day].waterUsed += h.waterUsed;
      dailyData[day].count += 1;
    });

    const trends = Object.entries(dailyData).map(([date, data]) => ({
      date,
      waterUsed: data.waterUsed,
      irrigationCount: data.count,
    }));

    res.json({ success: true, data: trends });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await connectMongoDB(process.env.MONGODB_URL!);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Analytics Service on port ${PORT}`));
}

start();
