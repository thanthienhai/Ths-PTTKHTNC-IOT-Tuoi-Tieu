// Schedule Routes
import { Router } from 'express';
import { prisma } from '../index';
import { createSchedule, optimizeSchedules } from '../services/schedulingService';

const router = Router();

// Get schedules
router.get('/', async (req, res) => {
  try {
    const { zoneId, status } = req.query;
    const where: any = {};
    
    if (zoneId) where.zoneId = zoneId as string;
    if (status) where.status = status as string;

    const schedules = await prisma.irrigationSchedule.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create schedule
router.post('/', async (req, res) => {
  try {
    const { zoneId, isManual = false } = req.body;
    const userId = req.headers['x-user-id'] as string || 'system';

    const schedule = await createSchedule(zoneId, userId, isManual);
    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Optimize schedules for farm
router.post('/optimize', async (req, res) => {
  try {
    const { farmId } = req.body;
    const schedules = await optimizeSchedules(farmId);
    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await prisma.irrigationSchedule.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
