export interface User {
  id: string;
  username: string;
  email: string;
  role: 'farmer' | 'manager' | 'agronomist' | 'technician' | 'admin';
  farms: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  type: 'temperature' | 'soil_moisture' | 'ph' | 'light' | 'co2' | 'water_level';
  value: number;
  unit: string;
  quality: 'good' | 'degraded' | 'invalid';
}

export interface IrrigationZone {
  id: string;
  name: string;
  farmId: string;
  area: number;
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  soilType: string;
  priority: number;
  sensors: string[];
  actuators: string[];
}

export interface IrrigationSchedule {
  id: string;
  zoneId: string;
  zoneName?: string;
  startTime: Date;
  duration: number;
  flowRate: number;
  waterAmount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
  isManual: boolean;
  createdBy: string;
  executedAt?: Date;
  completedAt?: Date;
}

export interface Device {
  id: string;
  type: 'sensor' | 'valve' | 'pump' | 'controller';
  model: string;
  firmwareVersion: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSeen: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Alert {
  id: string;
  type: 'sensor_error' | 'device_offline' | 'threshold_exceeded' | 'low_water' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

export interface WaterSource {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  pumpRate: number;
}

export interface Report {
  id: string;
  type: 'water_usage' | 'sensor_data' | 'irrigation_history';
  startDate: Date;
  endDate: Date;
  data: any;
  charts: Chart[];
}

export interface Chart {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any;
}

export interface Statistics {
  totalWaterUsed: number;
  averageMoisture: number;
  irrigationCount: number;
  efficiency: number;
}
