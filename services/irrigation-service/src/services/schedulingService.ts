// Scheduling Service
import { prisma } from '../index';
import { calculateWaterDemand } from './waterDemandService';

export async function createSchedule(zoneId: string, userId: string, isManual: boolean = false) {
  // Calculate water demand
  const demand = await calculateWaterDemand(zoneId);

  // Get zone configuration
  const zone = await prisma.irrigationZone.findUnique({
    where: { id: zoneId },
  });

  if (!zone) {
    throw new Error('Zone not found');
  }

  const config = zone.configuration as any;
  const flowRate = config.flowRate || 10; // liters/minute

  // Calculate duration
  const duration = Math.ceil(demand.adjustedDemand / flowRate);

  // Determine optimal start time (early morning: 6 AM)
  const startTime = new Date();
  startTime.setHours(6, 0, 0, 0);
  if (startTime < new Date()) {
    startTime.setDate(startTime.getDate() + 1);
  }

  // Check for conflicts
  const conflicts = await prisma.irrigationSchedule.findMany({
    where: {
      zoneId,
      status: { in: ['pending', 'active'] },
      startTime: {
        gte: new Date(startTime.getTime() - duration * 60000),
        lte: new Date(startTime.getTime() + duration * 60000),
      },
    },
  });

  if (conflicts.length > 0 && !isManual) {
    throw new Error('Schedule conflict detected');
  }

  // Create schedule
  const schedule = await prisma.irrigationSchedule.create({
    data: {
      zoneId,
      startTime,
      duration,
      flowRate,
      waterAmount: demand.adjustedDemand,
      status: 'pending',
      isManual,
      createdBy: userId,
    },
  });

  return schedule;
}

export async function optimizeSchedules(farmId: string) {
  // Get all zones for farm
  const zones = await prisma.irrigationZone.findMany({
    where: { farmId },
    orderBy: { priority: 'desc' },
  });

  const schedules = [];

  for (const zone of zones) {
    try {
      const schedule = await createSchedule(zone.id, 'system', false);
      schedules.push(schedule);
    } catch (error) {
      console.error(`Error creating schedule for zone ${zone.id}:`, error);
    }
  }

  return schedules;
}

export async function checkWaterAvailability(farmId: string) {
  const waterSources = await prisma.waterSource.findMany({
    where: { farmId, isActive: true },
  });

  const totalAvailable = waterSources.reduce((sum, source) => sum + source.currentLevel, 0);
  const totalCapacity = waterSources.reduce((sum, source) => sum + source.capacity, 0);

  return {
    available: totalAvailable,
    capacity: totalCapacity,
    percentage: (totalAvailable / totalCapacity) * 100,
    isLow: totalAvailable < totalCapacity * 0.2,
  };
}
