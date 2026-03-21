const Redis = require("ioredis");
const logger = require("../utils/logger");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redisAvailable = false;

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 1) {
      if (redisAvailable) {
        logger.warn("Redis connection lost. Switching to fallback mode.");
      }
      redisAvailable = false;
      return null;
    }
    return 10;
  },
});

redisClient.on("connect", () => {
  redisAvailable = true;
  logger.info("Connected to Redis server successfully.");
});

redisClient.on("error", (err) => {
  redisAvailable = false;
  logger.debug(`Redis connection status: ${err.message}`);
});

const safeRedis = {
  isAvailable: () => redisAvailable,

  get: async (key) => {
    if (!redisAvailable) return null;
    try { return await redisClient.get(key); } catch { return null; }
  },

  set: async (key, value, mode, duration) => {
    if (!redisAvailable) return null;
    try {
      if (mode && duration) return await redisClient.set(key, value, mode, duration);
      return await redisClient.set(key, value);
    } catch { return null; }
  },

  del: async (key) => {
    if (!redisAvailable) return null;
    try { return await redisClient.del(key); } catch { return null; }
  },

  call: async (...args) => {
    if (!redisAvailable) return null;
    try { return await redisClient.call(...args); } catch { return null; }
  },

  disconnect: async () => {
    try { await redisClient.disconnect(); } catch { }
  }
};

module.exports = safeRedis;
