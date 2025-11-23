// MongoDB schemas for time-series data
// Smart Irrigation IoT System

import { Schema, model, Document } from 'mongoose';

// ============================================================================
// SENSOR READINGS (Time-series)
// ============================================================================

export interface ISensorReading extends Document {
  sensorId: string;
  timestamp: Date;
  type: 'temperature' | 'soil_moisture' | 'ph' | 'light' | 'co2' | 'water_level';
  value: number;
  unit: string;
  quality: 'good' | 'degraded' | 'invalid';
  metadata?: Record<string, any>;
  farmId: string;
  zoneId?: string;
}

const SensorReadingSchema = new Schema<ISensorReading>(
  {
    sensorId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['temperature', 'soil_moisture', 'ph', 'light', 'co2', 'water_level'],
      index: true,
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    quality: {
      type: String,
      required: true,
      enum: ['good', 'degraded', 'invalid'],
      default: 'good',
    },
    metadata: { type: Schema.Types.Mixed },
    farmId: { type: String, required: true, index: true },
    zoneId: { type: String, index: true },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'sensorId',
      granularity: 'minutes',
    },
    collection: 'sensor_readings',
  }
);

// Compound indexes for efficient queries
SensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
SensorReadingSchema.index({ farmId: 1, timestamp: -1 });
SensorReadingSchema.index({ zoneId: 1, timestamp: -1 });
SensorReadingSchema.index({ type: 1, timestamp: -1 });

export const SensorReading = model<ISensorReading>('SensorReading', SensorReadingSchema);

// ============================================================================
// DEVICE LOGS (Time-series)
// ============================================================================

export interface IDeviceLog extends Document {
  deviceId: string;
  timestamp: Date;
  eventType: 'status_change' | 'command_received' | 'command_executed' | 'error' | 'maintenance';
  status?: 'online' | 'offline' | 'maintenance' | 'error';
  command?: string;
  result?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  farmId: string;
}

const DeviceLogSchema = new Schema<IDeviceLog>(
  {
    deviceId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ['status_change', 'command_received', 'command_executed', 'error', 'maintenance'],
      index: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance', 'error'],
    },
    command: { type: String },
    result: { type: String },
    errorMessage: { type: String },
    metadata: { type: Schema.Types.Mixed },
    farmId: { type: String, required: true, index: true },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'deviceId',
      granularity: 'seconds',
    },
    collection: 'device_logs',
  }
);

DeviceLogSchema.index({ deviceId: 1, timestamp: -1 });
DeviceLogSchema.index({ farmId: 1, timestamp: -1 });
DeviceLogSchema.index({ eventType: 1, timestamp: -1 });

export const DeviceLog = model<IDeviceLog>('DeviceLog', DeviceLogSchema);

// ============================================================================
// IRRIGATION HISTORY (Time-series)
// ============================================================================

export interface IIrrigationHistory extends Document {
  scheduleId: string;
  zoneId: string;
  farmId: string;
  startTime: Date;
  endTime: Date;
  waterUsed: number; // liters
  actualDuration: number; // minutes
  plannedDuration: number; // minutes
  flowRate: number; // liters/minute
  success: boolean;
  failureReason?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

const IrrigationHistorySchema = new Schema<IIrrigationHistory>(
  {
    scheduleId: { type: String, required: true, index: true },
    zoneId: { type: String, required: true, index: true },
    farmId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    waterUsed: { type: Number, required: true },
    actualDuration: { type: Number, required: true },
    plannedDuration: { type: Number, required: true },
    flowRate: { type: Number, required: true },
    success: { type: Boolean, required: true, default: true },
    failureReason: { type: String },
    notes: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timeseries: {
      timeField: 'startTime',
      metaField: 'zoneId',
      granularity: 'hours',
    },
    collection: 'irrigation_history',
  }
);

IrrigationHistorySchema.index({ zoneId: 1, startTime: -1 });
IrrigationHistorySchema.index({ farmId: 1, startTime: -1 });
IrrigationHistorySchema.index({ scheduleId: 1 });

export const IrrigationHistory = model<IIrrigationHistory>('IrrigationHistory', IrrigationHistorySchema);

// ============================================================================
// WEATHER DATA (Time-series)
// ============================================================================

export interface IWeatherData extends Document {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  timestamp: Date;
  temperature: number; // Celsius
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  solarRadiation?: number; // MJ/m²/day
  pressure?: number; // hPa
  cloudCover?: number; // %
  source: 'forecast' | 'actual' | 'sensor';
  metadata?: Record<string, any>;
}

const WeatherDataSchema = new Schema<IWeatherData>(
  {
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      name: { type: String },
    },
    timestamp: { type: Date, required: true, index: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true, default: 0 },
    windSpeed: { type: Number, required: true },
    solarRadiation: { type: Number },
    pressure: { type: Number },
    cloudCover: { type: Number },
    source: {
      type: String,
      required: true,
      enum: ['forecast', 'actual', 'sensor'],
      default: 'forecast',
    },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'location',
      granularity: 'hours',
    },
    collection: 'weather_data',
  }
);

WeatherDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1, timestamp: -1 });
WeatherDataSchema.index({ source: 1, timestamp: -1 });

export const WeatherData = model<IWeatherData>('WeatherData', WeatherDataSchema);

// ============================================================================
// WATER USAGE ANALYTICS (Aggregated data)
// ============================================================================

export interface IWaterUsageAnalytics extends Document {
  zoneId: string;
  farmId: string;
  date: Date; // Daily aggregation
  totalWaterUsed: number; // liters
  irrigationCount: number;
  averageDuration: number; // minutes
  efficiency: number; // percentage
  costEstimate?: number;
  metadata?: Record<string, any>;
}

const WaterUsageAnalyticsSchema = new Schema<IWaterUsageAnalytics>(
  {
    zoneId: { type: String, required: true, index: true },
    farmId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    totalWaterUsed: { type: Number, required: true },
    irrigationCount: { type: Number, required: true },
    averageDuration: { type: Number, required: true },
    efficiency: { type: Number, required: true },
    costEstimate: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    collection: 'water_usage_analytics',
  }
);

WaterUsageAnalyticsSchema.index({ zoneId: 1, date: -1 });
WaterUsageAnalyticsSchema.index({ farmId: 1, date: -1 });

export const WaterUsageAnalytics = model<IWaterUsageAnalytics>('WaterUsageAnalytics', WaterUsageAnalyticsSchema);

// ============================================================================
// SYSTEM EVENTS (Audit log)
// ============================================================================

export interface ISystemEvent extends Document {
  timestamp: Date;
  eventType: string;
  userId?: string;
  farmId?: string;
  resource: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const SystemEventSchema = new Schema<ISystemEvent>(
  {
    timestamp: { type: Date, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    farmId: { type: String, index: true },
    resource: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'eventType',
      granularity: 'seconds',
    },
    collection: 'system_events',
  }
);

SystemEventSchema.index({ userId: 1, timestamp: -1 });
SystemEventSchema.index({ farmId: 1, timestamp: -1 });
SystemEventSchema.index({ resource: 1, action: 1, timestamp: -1 });

export const SystemEvent = model<ISystemEvent>('SystemEvent', SystemEventSchema);
