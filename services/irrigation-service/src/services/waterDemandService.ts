// Water Demand Calculation Service
import { prisma } from '../index';
import axios from 'axios';

interface WaterDemand {
  zoneId: string;
  calculatedAt: Date;
  currentMoisture: number;
  targetMoisture: number;
  deficit: number;
  evapotranspiration: number;
  rainfall: number;
  adjustedDemand: number;
}

export async function calculateWaterDemand(zoneId: string): Promise<WaterDemand> {
  // Get zone configuration
  const zone = await prisma.irrigationZone.findUnique({
    where: { id: zoneId },
    include: { farm: true },
  });

  if (!zone) {
    throw new Error('Zone not found');
  }

  const config = zone.configuration as any;

  // Get current soil moisture from sensor service
  let currentMoisture = config.targetMoisture || 60;
  try {
    const sensorId = zone.sensors[0];
    if (sensorId) {
      const sensorResponse = await axios.get(
        `${process.env.SENSOR_SERVICE_URL}/readings/${sensorId}?limit=1`
      );
      if (sensorResponse.data.success && sensorResponse.data.data.length > 0) {
        currentMoisture = sensorResponse.data.data[0].value;
      }
    }
  } catch (error) {
    console.error('Error fetching sensor data:', error);
  }

  // Get weather forecast
  let rainfall = 0;
  let evapotranspiration = 5; // Default ET in mm/day
  try {
    const location = zone.farm.location as any;
    const weatherResponse = await axios.get(
      `${process.env.WEATHER_SERVICE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}`
    );
    if (weatherResponse.data.success) {
      const forecast = weatherResponse.data.data.forecasts[0];
      rainfall = forecast.rainfall || 0;
      
      // Simple ET calculation based on temperature and humidity
      const temp = forecast.temperature.avg;
      const humidity = forecast.humidity;
      evapotranspiration = (temp * 0.2) - (humidity * 0.05);
      evapotranspiration = Math.max(0, evapotranspiration);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }

  // Calculate water deficit
  const targetMoisture = config.targetMoisture || 70;
  const moistureDeficit = Math.max(0, targetMoisture - currentMoisture);
  
  // Convert moisture deficit to liters
  // Formula: deficit (%) * area (m²) * depth (m) * 1000 (L/m³)
  const depth = 0.3; // 30cm root depth
  const deficitLiters = (moistureDeficit / 100) * zone.area * depth * 1000;
  
  // Add ET losses
  const etLiters = (evapotranspiration / 1000) * zone.area * 1000;
  
  // Subtract expected rainfall
  const rainfallLiters = (rainfall / 1000) * zone.area * 1000;
  
  // Calculate adjusted demand
  const adjustedDemand = Math.max(0, deficitLiters + etLiters - rainfallLiters);

  return {
    zoneId,
    calculatedAt: new Date(),
    currentMoisture,
    targetMoisture,
    deficit: deficitLiters,
    evapotranspiration,
    rainfall,
    adjustedDemand,
  };
}
