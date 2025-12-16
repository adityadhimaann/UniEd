import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
  // Skip Redis if REDIS_URL is not set or points to localhost in production
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl || redisUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Redis not configured - skipping Redis connection');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: false, // Disable reconnection attempts
      },
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Client Ready');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.warn('⚠️  Continuing without Redis cache');
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
};

export { connectRedis, getRedisClient, disconnectRedis };
