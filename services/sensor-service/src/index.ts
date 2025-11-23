// Sensor Service - Main Entry Point
import express from 'express';
import { connectMongoDB, connectRedis, SensorReading } from '@irrigation/shared';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health checks
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// Sensor data ingestion
app.post('/readings', async (req, res) => {
  try {
    const readings = Array.isArray(req.body) ? req.body : [req.body];
    const saved = await SensorReading.insertMany(readings);
    res.json({ success: true, data: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sensor readings
app.get('/readings/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { start, end, limit = 100 } = req.query;
    
    const query: any = { sensorId };
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start as string);
      if (end) query.timestamp.$lte = new Date(end as string);
    }
    
    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    res.json({ success: true, data: readings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function start() {
  await connectMongoDB(process.env.MONGODB_URL!);
  await connectRedis(process.env.REDIS_URL!);
  app.listen(PORT, () => console.log(`Sensor Service on port ${PORT}`));
}

start();
