import { z } from 'zod';

// ============================================================================
// LOCATION SCHEMA
// ============================================================================

export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  address: z.string().optional(),
});

// ============================================================================
// SENSOR READING SCHEMA
// ============================================================================

export const SensorReadingSchema = z.object({
  id: z.string().uuid(),
  sensorId: z.string().uuid(),
  timestamp: z.date(),
  type: z.enum(['temperature', 'soil_moisture', 'ph', 'light', 'co2', 'water_level']),
  value: z.number(),
  unit: z.string(),
  quality: z.enum(['good', 'degraded', 'invalid']),
  metadata: z.record(z.any()).optional(),
});

export const CreateSensorReadingSchema = SensorReadingSchema.omit({ id: true });

// ============================================================================
// IRRIGATION ZONE SCHEMA
// ============================================================================

export const ZoneConfigurationSchema = z.object({
  targetMoisture: z.number().min(0).max(100),
  minMoisture: z.number().min(0).max(100),
  maxMoisture: z.number().min(0).max(100),
  irrigationMethod: z.enum(['drip', 'sprinkler', 'flood']),
  wateringDuration: z.number().positive(),
  flowRate: z.number().positive(),
}).refine(
  (data) => data.minMoisture < data.targetMoisture && data.targetMoisture < data.maxMoisture,
  {
    message: 'Moisture levels must be: min < target < max',
  }
);

export const IrrigationZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  farmId: z.string().uuid(),
  area: z.number().positive(),
  cropType: z.string().min(1),
  growthStage: z.enum(['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest']),
  soilType: z.string().min(1),
  priority: z.number().int().min(1).max(10),
  sensors: z.array(z.string().uuid()),
  actuators: z.array(z.string().uuid()),
  configuration: ZoneConfigurationSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateIrrigationZoneSchema = IrrigationZoneSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateIrrigationZoneSchema = CreateIrrigationZoneSchema.partial();

// ============================================================================
// IRRIGATION SCHEDULE SCHEMA
// ============================================================================

export const IrrigationScheduleSchema = z.object({
  id: z.string().uuid(),
  zoneId: z.string().uuid(),
  startTime: z.date(),
  duration: z.number().positive(),
  flowRate: z.number().positive(),
  waterAmount: z.number().positive(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled', 'failed']),
  isManual: z.boolean(),
  createdBy: z.string().uuid(),
  executedAt: z.date().optional(),
  completedAt: z.date().optional(),
  failureReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateIrrigationScheduleSchema = IrrigationScheduleSchema.omit({
  id: true,
  status: true,
  executedAt: true,
  completedAt: true,
  failureReason: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// WATER DEMAND SCHEMA
// ============================================================================

export const WaterDemandSchema = z.object({
  zoneId: z.string().uuid(),
  calculatedAt: z.date(),
  currentMoisture: z.number().min(0).max(100),
  targetMoisture: z.number().min(0).max(100),
  deficit: z.number().nonnegative(),
  evapotranspiration: z.number().nonnegative(),
  rainfall: z.number().nonnegative(),
  adjustedDemand: z.number().nonnegative(),
});

// ============================================================================
// DEVICE SCHEMA
// ============================================================================

export const DeviceConfigSchema = z.object({
  calibrationCoefficients: z.array(z.number()).optional(),
  samplingInterval: z.number().positive().optional(),
  threshold: z.number().optional(),
  gpioPin: z.number().int().optional(),
  i2cAddress: z.string().optional(),
}).catchall(z.any());

export const DeviceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['sensor', 'valve', 'pump', 'controller']),
  model: z.string().min(1),
  firmwareVersion: z.string().min(1),
  status: z.enum(['online', 'offline', 'maintenance', 'error']),
  lastSeen: z.date(),
  location: LocationSchema,
  configuration: DeviceConfigSchema,
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateDeviceSchema = DeviceSchema.omit({
  id: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateDeviceSchema = CreateDeviceSchema.partial();

// ============================================================================
// ALERT SCHEMA
// ============================================================================

export const AlertSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['sensor_error', 'device_offline', 'threshold_exceeded', 'low_water', 'system_error']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  source: z.string().uuid(),
  createdAt: z.date(),
  acknowledgedAt: z.date().optional(),
  acknowledgedBy: z.string().uuid().optional(),
  resolvedAt: z.date().optional(),
  notes: z.string().max(1000).optional(),
});

export const CreateAlertSchema = AlertSchema.omit({
  id: true,
  createdAt: true,
  acknowledgedAt: true,
  acknowledgedBy: true,
  resolvedAt: true,
  notes: true,
});

// ============================================================================
// USER SCHEMA
// ============================================================================

export const PermissionSchema = z.object({
  resource: z.string().min(1),
  actions: z.array(z.string()),
});

export const UserPreferencesSchema = z.object({
  language: z.string().default('vi'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  theme: z.enum(['light', 'dark']).default('light'),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(['farmer', 'manager', 'agronomist', 'technician', 'admin']),
  permissions: z.array(PermissionSchema),
  farms: z.array(z.string().uuid()),
  preferences: UserPreferencesSchema,
  createdAt: z.date(),
  lastLogin: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  password: z.string().min(8).max(100),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true });

export const LoginCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ============================================================================
// WEATHER FORECAST SCHEMA
// ============================================================================

export const DailyForecastSchema = z.object({
  date: z.date(),
  temperature: z.object({
    min: z.number(),
    max: z.number(),
    avg: z.number(),
  }),
  humidity: z.number().min(0).max(100),
  rainfall: z.number().nonnegative(),
  windSpeed: z.number().nonnegative(),
  solarRadiation: z.number().nonnegative(),
});

export const WeatherForecastSchema = z.object({
  location: LocationSchema,
  timestamp: z.date(),
  forecasts: z.array(DailyForecastSchema).min(1).max(7),
});

// ============================================================================
// FARM SCHEMA
// ============================================================================

export const FarmSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  location: LocationSchema,
  area: z.number().positive(),
  ownerId: z.string().uuid(),
  zones: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateFarmSchema = FarmSchema.omit({
  id: true,
  zones: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// WATER SOURCE SCHEMA
// ============================================================================

export const WaterSourceSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['well', 'reservoir', 'river', 'municipal']),
  capacity: z.number().positive(),
  currentLevel: z.number().nonnegative(),
  pumpRate: z.number().positive(),
  location: LocationSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine(
  (data) => data.currentLevel <= data.capacity,
  {
    message: 'Current level cannot exceed capacity',
  }
);

export const CreateWaterSourceSchema = WaterSourceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// REPORT SCHEMA
// ============================================================================

export const ReportConfigSchema = z.object({
  type: z.enum(['water_usage', 'sensor_data', 'irrigation_history', 'zone_comparison']),
  title: z.string().min(1).max(200),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(
    (data) => data.start < data.end,
    {
      message: 'Start date must be before end date',
    }
  ),
  zones: z.array(z.string().uuid()).optional(),
  includeCharts: z.boolean().default(true),
  format: z.enum(['PDF', 'CSV', 'JSON']),
});

export const ReportSchema = z.object({
  id: z.string().uuid(),
  config: ReportConfigSchema,
  generatedAt: z.date(),
  generatedBy: z.string().uuid(),
  fileUrl: z.string().url().optional(),
  data: z.any(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function formatValidationErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
