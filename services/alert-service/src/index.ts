// Alert Service - Main Entry Point
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3004;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});

// Create alert
app.post('/alerts', async (req, res) => {
  try {
    const { type, severity, title, message, sourceId } = req.body;
    
    const alert = await prisma.alert.create({
      data: { type, severity, title, message, sourceId },
    });

    // TODO: Send notification (push, email, SMS)
    console.log(`Alert created: ${title} (${severity})`);

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get alerts
app.get('/alerts', async (req, res) => {
  try {
    const { severity, type, acknowledged } = req.query;
    const where: any = {};
    
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (acknowledged === 'false') where.acknowledgedAt = null;
    if (acknowledged === 'true') where.acknowledgedAt = { not: null };

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Acknowledge alert
app.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.headers['x-user-id'] as string;
    
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
        notes,
      },
    });

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve alert
app.post('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await prisma.alert.update({
      where: { id },
      data: { resolvedAt: new Date() },
    });

    res.json({ success: true, data: alert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check thresholds and create alerts
app.post('/alerts/check-thresholds', async (req, res) => {
  try {
    const { sensorId, value, threshold, type } = req.body;
    
    if (value > threshold) {
      const alert = await prisma.alert.create({
        data: {
          type: 'threshold_exceeded',
          severity: 'high',
          title: `${type} threshold exceeded`,
          message: `Sensor ${sensorId} reported ${value}, exceeding threshold of ${threshold}`,
          sourceId: sensorId,
        },
      });

      return res.json({ success: true, data: { alertCreated: true, alert } });
    }

    res.json({ success: true, data: { alertCreated: false } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Alert Service on port ${PORT}`));
}

start();
