# Shared Types and Utilities

This package contains shared TypeScript types, validation schemas, and database configurations used across all microservices.

## Contents

### Types (`types/index.ts`)
- Core data models (TypeScript interfaces)
- Sensor readings, irrigation zones, schedules, devices, alerts, users, etc.
- API response types
- Validation result types

### Validation (`validation/schemas.ts`)
- Zod validation schemas for all data models
- Input validation helpers
- Error formatting utilities

### PostgreSQL (`prisma/`)
- Prisma schema for relational data
- Database migrations
- User, Farm, Zone, Schedule, Device, Alert models

### MongoDB (`mongodb/`)
- Mongoose schemas for time-series data
- Sensor readings, device logs, irrigation history
- Weather data, analytics
- Connection utilities with TTL indexes

### Redis (`redis/`)
- Redis client configuration
- Cache manager with strategies
- Real-time data manager
- Rate limiter
- Session manager
- Cache key builders

## Usage

### Import Types

```typescript
import { 
  SensorReading, 
  IrrigationZone, 
  User 
} from '@irrigation/shared';
```

### Validation

```typescript
import { 
  CreateUserSchema, 
  validateData 
} from '@irrigation/shared';

const result = validateData(CreateUserSchema, userData);
if (!result.success) {
  console.error(result.errors);
}
```

### PostgreSQL (Prisma)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = await prisma.user.findMany();
```

### MongoDB

```typescript
import { 
  connectMongoDB, 
  SensorReading 
} from '@irrigation/shared';

await connectMongoDB(process.env.MONGODB_URL);
const readings = await SensorReading.find({ sensorId: 'sensor-123' });
```

### Redis

```typescript
import { 
  connectRedis, 
  CacheManager, 
  getRedisClient 
} from '@irrigation/shared';

await connectRedis(process.env.REDIS_URL);
const cache = new CacheManager(getRedisClient());

// Cache data
await cache.set('key', { data: 'value' }, 300);

// Get cached data
const data = await cache.get('key');
```

## Database Setup

### PostgreSQL

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or apply SQL migration directly
psql -U user -d database -f prisma/migrations/001_initial_schema.sql
```

### MongoDB

MongoDB collections and indexes are created automatically on first connection.

### Redis

Redis requires no schema setup. Keys are created on-demand.

## Data Retention

### MongoDB TTL Indexes
- Sensor readings: 1 year
- Device logs: 90 days
- Irrigation history: 2 years
- Weather data: 30 days
- System events: 180 days

### Redis TTL
- Sessions: 24 hours
- Device status: 5 minutes
- Latest readings: 10 minutes
- Weather forecasts: varies by service
- Active schedules: 1 hour

## Development

```bash
# Build
npm run build

# Clean
npm run clean
```

## Environment Variables

Required environment variables:

```env
POSTGRES_URL=postgresql://user:pass@localhost:5432/irrigation_db
MONGODB_URL=mongodb://user:pass@localhost:27017/irrigation_db
REDIS_URL=redis://localhost:6379
```
