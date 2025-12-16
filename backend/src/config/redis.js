import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
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
