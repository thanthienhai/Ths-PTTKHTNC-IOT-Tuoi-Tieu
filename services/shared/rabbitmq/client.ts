// RabbitMQ client and utilities
import amqp, { Connection, Channel } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

// Queue and Exchange names
export const QUEUES = {
  SENSOR_DATA: 'sensor_data',
  COMMANDS: 'commands',
  ALERTS: 'alerts',
  EVENTS: 'events',
};

export const EXCHANGES = {
  SENSOR: 'sensor_exchange',
  IRRIGATION: 'irrigation_exchange',
  ALERTS: 'alerts_exchange',
};

export async function connectRabbitMQ(url: string): Promise<void> {
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    // Setup exchanges
    await channel.assertExchange(EXCHANGES.SENSOR, 'topic', { durable: true });
    await channel.assertExchange(EXCHANGES.IRRIGATION, 'topic', { durable: true });
    await channel.assertExchange(EXCHANGES.ALERTS, 'fanout', { durable: true });

    // Setup queues
    await channel.assertQueue(QUEUES.SENSOR_DATA, { durable: true });
    await channel.assertQueue(QUEUES.COMMANDS, { durable: true });
    await channel.assertQueue(QUEUES.ALERTS, { durable: true });
    await channel.assertQueue(QUEUES.EVENTS, { durable: true });

    // Bind queues to exchanges
    await channel.bindQueue(QUEUES.SENSOR_DATA, EXCHANGES.SENSOR, 'sensor.#');
    await channel.bindQueue(QUEUES.COMMANDS, EXCHANGES.IRRIGATION, 'command.#');
    await channel.bindQueue(QUEUES.ALERTS, EXCHANGES.ALERTS, '');

    console.log('✅ RabbitMQ connected and configured');

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}

export async function disconnectRabbitMQ(): Promise<void> {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  console.log('RabbitMQ disconnected');
}

// Publisher
export async function publish(exchange: string, routingKey: string, message: any): Promise<void> {
  const ch = getChannel();
  const content = Buffer.from(JSON.stringify(message));
  ch.publish(exchange, routingKey, content, { persistent: true });
}

// Consumer
export async function consume(
  queue: string,
  handler: (message: any) => Promise<void>
): Promise<void> {
  const ch = getChannel();
  
  await ch.consume(queue, async (msg) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);
        ch.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        ch.nack(msg, false, false); // Don't requeue
      }
    }
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRabbitMQ();
  process.exit(0);
});
