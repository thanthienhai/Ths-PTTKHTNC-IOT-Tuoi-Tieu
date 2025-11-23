// Device Service - Main Entry Point
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { connectMongoDB, DeviceLog } from '@irrigation/shared';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3006;
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

// Register device
app.post('/devices', async (req, res) => {
  try {
    const { farmId, type, model, firmwareVersion, location, configuration } = req.body;
    
    const device = await prisma.device.create({
      data: {
        farmId,
        type,
        model,
        firmwareVersion,
        location,
        configuration: configuration || {},
        metadata: {},
        securityKey: crypto.randomBytes(32).toString('hex'),
        status: 'offline',
      },
    });

    res.json({ success: true, data: device });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get devices
app.get('/devices', async (req, res) => {
  try {
    const { farmId, type, status } = req.query;
    const where: any = {};
    
    if (farmId) where.farmId = farmId as string;
    if (type) where.type = type;
    if (status) where.status = status;

    const devices = await prisma.device.findMany({ where });
    res.json({ success: true, data: devices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update device status
app.put('/devices/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const device = await prisma.device.update({
      where: { id },
      data: { status, lastSeen: new Date() },
    });

    // Log status change
    await DeviceLog.create({
      deviceId: id,
      timestamp: new Date(),
      eventType: 'status_change',
      status,
      farmId: device.farmId,
    });

    res.json({ success: true, data: device });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authenticate device
app.post('/devices/authenticate', async (req, res) => {
  try {
    const { deviceId, securityKey } = req.body;
    
    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    
    if (!device || device.securityKey !== securityKey) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await prisma.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date(), status: 'online' },
    });

    res.json({ success: true, data: { authenticated: true, device } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await connectMongoDB(process.env.MONGODB_URL!);
  await prisma.$connect();
  app.listen(PORT, () => console.log(`Device Service on port ${PORT}`));
}

start();
