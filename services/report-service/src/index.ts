// Report Service - Main Entry Point
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { connectMongoDB, SensorReading, IrrigationHistory } from '@irrigation/shared';

const app = express();
const PORT = process.env.PORT || 3008;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// Generate report
app.post('/reports', async (req, res) => {
  try {
    const { type, title, period, zones, includeCharts, format } = req.body;
    const userId = req.headers['x-user-id'] as string || 'system';
    
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    let data: any = {};

    // Collect data based on report type
    if (type === 'water_usage') {
      const history = await IrrigationHistory.find({
        zoneId: { $in: zones || [] },
        startTime: { $gte: startDate, $lte: endDate },
      });

      data.totalWaterUsed = history.reduce((sum, h) => sum + h.waterUsed, 0);
      data.irrigationCount = history.length;
      data.averageDuration = history.length > 0 
        ? history.reduce((sum, h) => sum + h.actualDuration, 0) / history.length 
        : 0;
    } else if (type === 'sensor_data') {
      const readings = await SensorReading.find({
        zoneId: { $in: zones || [] },
        timestamp: { $gte: startDate, $lte: endDate },
      }).limit(1000);

      data.readingCount = readings.length;
      data.avgTemperature = readings
        .filter(r => r.type === 'temperature')
        .reduce((sum, r, _, arr) => sum + r.value / arr.length, 0);
      data.avgMoisture = readings
        .filter(r => r.type === 'soil_moisture')
        .reduce((sum, r, _, arr) => sum + r.value / arr.length, 0);
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        config: { type, title, period, zones, includeCharts, format },
        generatedBy: userId,
        data,
      },
    });

    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reports
app.get('/reports', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const where: any = {};
    
    if (userId) where.generatedBy = userId;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export report (mock)
app.get('/reports/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'PDF' } = req.query;
    
    const report = await prisma.report.findUnique({ where: { id } });
    
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Mock export - in production, generate actual PDF/CSV
    const exportData = {
      format,
      report,
      exportedAt: new Date(),
      message: `Report exported as ${format}`,
    };

    res.json({ success: true, data: exportData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await connectMongoDB(process.env.MONGODB_URL!);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Report Service on port ${PORT}`));
}

start();
