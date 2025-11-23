// Manual Control Routes
import { Router } from 'express';
import { prisma } from '../index';
import { RealtimeDataManager, getRedisClient } from '@irrigation/shared';

const router = Router();
const realtimeManager = new RealtimeDataManager(getRedisClient());

// Manual valve control
router.post('/valve', async (req, res) => {
  try {
    const { zoneId, action, duration } = req.body;
    const userId = req.headers['x-user-id'] as string || 'system';

    if (!['open', 'close'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    // Get zone
    const zone = await prisma.irrigationZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    // Create manual schedule if opening valve
    if (action === 'open' && duration) {
      const config = zone.configuration as any;
      const flowRate = config.flowRate || 10;

      const schedule = await prisma.irrigationSchedule.create({
        data: {
          zoneId,
          startTime: new Date(),
          duration,
          flowRate,
          waterAmount: flowRate * duration,
          status: 'active',
          isManual: true,
          createdBy: userId,
        },
      });

      // Store active schedule in cache
      await realtimeManager.storeActiveSchedule(zoneId, schedule);

      res.json({ success: true, data: { action, schedule } });
    } else {
      // Clear active schedule
      await realtimeManager.clearActiveSchedule(zoneId);
      
      res.json({ success: true, data: { action } });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active schedule for zone
router.get('/active/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    
    const schedule = await realtimeManager.getActiveSchedule(zoneId);
    
    if (!schedule) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
