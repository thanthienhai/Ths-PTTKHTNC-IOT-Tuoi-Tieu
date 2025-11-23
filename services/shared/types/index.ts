// Core data models for Smart Irrigation IoT System
// Based on design document specifications

// ============================================================================
// SENSOR READING
// ============================================================================

export type SensorType = 'temperature' | 'soil_moisture' | 'ph' | 'light' | 'co2' | 'water_level';
export type DataQuality = 'good' | 'degraded' | 'invalid';

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  type: SensorType;
  value: number;
  unit: string;
  quality: DataQuality;
  metadata?: Record<string, any>;
}

// ============================================================================
// IRRIGATION ZONE
// ============================================================================

export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';

export interface ZoneConfiguration {
  targetMoisture: number; // Target soil moisture percentage
  minMoisture: number; // Minimum acceptable moisture
  maxMoisture: number; // Maximum acceptable moisture
  irrigationMethod: 'drip' | 'sprinkler' | 'flood';
  wateringDuration: number; // Default duration in minutes
  flowRate: number; // Liters per minute
}

export interface IrrigationZone {
  id: string;
  name: string;
  farmId: string;
  area: number; // m²
  cropType: string;
  growthStage: GrowthStage;
  soilType: string;
  priority: number; // 1-10, higher = more important
  sensors: string[]; // sensor IDs
  actuators: string[]; // valve/pump IDs
  configuration: ZoneConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// IRRIGATION SCHEDULE
// ============================================================================

export type ScheduleStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';

export interface IrrigationSchedule {
  id: string;
  zoneId: string;
  startTime: Date;
  duration: number; // minutes
  flowRate: number; // liters/minute
  waterAmount: number; // liters
  status: ScheduleStatus;
  isManual: boolean;
  createdBy: string;
  executedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WATER DEMAND
// ============================================================================

export interface WaterDemand {
  zoneId: string;
  calculatedAt: Date;
  currentMoisture: number;
  targetMoisture: number;
  deficit: number; // liters
  evapotranspiration: number; // mm/day
  rainfall: number; // mm (predicted)
  adjustedDemand: number; // liters (after considering rain)
}

// ============================================================================
// DEVICE
// ============================================================================

export type DeviceType = 'sensor' | 'valve' | 'pump' | 'controller';
export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'error';

export interface DeviceConfig {
  calibrationCoefficients?: number[];
  samplingInterval?: number; // seconds
  threshold?: number;
  gpioPin?: number;
  i2cAddress?: string;
  [key: string]: any;
}

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
}

export interface Device {
  id: string;
  type: DeviceType;
  model: string;
  firmwareVersion: string;
  status: DeviceStatus;
  lastSeen: Date;
  location: Location;
  configuration: DeviceConfig;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ALERT
// ============================================================================

export type AlertType = 'sensor_error' | 'device_offline' | 'threshold_exceeded' | 'low_water' | 'system_error';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string; // device/sensor ID
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

// ============================================================================
// USER
// ============================================================================

export type UserRole = 'farmer' | 'manager' | 'agronomist' | 'technician' | 'admin';

export interface Permission {
  resource: string;
  actions: string[]; // ['read', 'write', 'delete', etc.]
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions: Permission[];
  farms: string[]; // farm IDs
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// ============================================================================
// WEATHER FORECAST
// ============================================================================

export interface DailyForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  solarRadiation: number; // MJ/m²/day
}

export interface WeatherForecast {
  location: Location;
  timestamp: Date;
  forecasts: DailyForecast[];
}

// ============================================================================
// FARM
// ============================================================================

export interface Farm {
  id: string;
  name: string;
  location: Location;
  area: number; // m²
  ownerId: string;
  zones: string[]; // zone IDs
  waterSources: WaterSource[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WATER SOURCE
// ============================================================================

export type WaterSourceType = 'well' | 'reservoir' | 'river' | 'municipal';

export interface WaterSource {
  id: string;
  farmId: string;
  name: string;
  type: WaterSourceType;
  capacity: number; // liters
  currentLevel: number; // liters
  pumpRate: number; // liters/minute
  location: Location;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// IRRIGATION HISTORY
// ============================================================================

export interface IrrigationHistory {
  id: string;
  scheduleId: string;
  zoneId: string;
  startTime: Date;
  endTime: Date;
  waterUsed: number; // liters
  actualDuration: number; // minutes
  success: boolean;
  notes?: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface WaterUsageAnalysis {
  zoneId: string;
  period: {
    start: Date;
    end: Date;
  };
  totalWaterUsed: number; // liters
  averagePerDay: number; // liters
  efficiency: number; // percentage
  costEstimate?: number;
}

export interface ZoneComparison {
  zones: {
    zoneId: string;
    zoneName: string;
    waterUsed: number;
    efficiency: number;
    area: number;
    waterPerSquareMeter: number;
  }[];
  period: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// REPORT
// ============================================================================

export type ReportType = 'water_usage' | 'sensor_data' | 'irrigation_history' | 'zone_comparison';
export type ReportFormat = 'PDF' | 'CSV' | 'JSON';

export interface ReportConfig {
  type: ReportType;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  zones?: string[];
  includeCharts: boolean;
  format: ReportFormat;
}

export interface Report {
  id: string;
  config: ReportConfig;
  generatedAt: Date;
  generatedBy: string;
  fileUrl?: string;
  data: any;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
