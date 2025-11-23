// MongoDB initialization and connection
import mongoose from 'mongoose';

export async function connectMongoDB(url: string): Promise<void> {
  try {
    await mongoose.connect(url, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Setup indexes
    await setupIndexes();
    
    // Setup TTL indexes for data retention
    await setupTTLIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function setupIndexes(): Promise<void> {
  console.log('Setting up MongoDB indexes...');
  
  // Indexes are defined in schemas, but we can ensure they're created
  const collections = mongoose.connection.collections;
  
  for (const collectionName in collections) {
    const collection = collections[collectionName];
    await collection.createIndexes();
  }
  
  console.log('✅ MongoDB indexes created');
}

async function setupTTLIndexes(): Promise<void> {
  console.log('Setting up TTL indexes for data retention...');
  
  const db = mongoose.connection.db;
  
  // Sensor readings: Keep for 1 year
  await db.collection('sensor_readings').createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 365 * 24 * 60 * 60 }
  );
  
  // Device logs: Keep for 90 days
  await db.collection('device_logs').createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 }
  );
  
  // Irrigation history: Keep for 2 years
  await db.collection('irrigation_history').createIndex(
    { startTime: 1 },
    { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 }
  );
  
  // Weather data: Keep for 30 days
  await db.collection('weather_data').createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 }
  );
  
  // System events: Keep for 180 days
  await db.collection('system_events').createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 180 * 24 * 60 * 60 }
  );
  
  console.log('✅ TTL indexes created');
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});
