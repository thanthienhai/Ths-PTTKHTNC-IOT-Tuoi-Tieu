// Zone Routes
import { Router } from 'express';
import { prisma } from '../index';
import { calculateWaterDemand } from '../services/waterDemandService';

const router = Router();

// Get zones
router.get('/', async (req, res) => {
  try {
    const { farmId } = req.query;
    const where: any = {};
    
    if (farmId) where.farmId = farmId as string;

    const zones = await prisma.irrigationZone.findMany({
      where,
      orderBy: { priority: 'desc' },
    });

    res.json({ success: true, data: zones });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get zone by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const zone = await prisma.irrigationZone.findUnique({
      where: { id },
      include: { farm: true },
    });

    if (!zone) {
      return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    res.json({ success: true, data: zone });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate water demand for zone
router.get('/:id/demand', async (req, res) => {
  try {
    const { id } = req.params;
    const demand = await calculateWaterDemand(id);
    res.json({ success: true, data: demand });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create zone
router.post('/', async (req, res) => {
  try {
    const zone = await prisma.irrigationZone.create({
      data: req.body,
    });

    res.json({ success: true, data: zone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update zone
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const zone = await prisma.irrigationZone.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, data: zone });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
