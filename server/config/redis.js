const Redis = require("ioredis");
const logger = require("../utils/logger");

// ─── Configuration & Connection ──────────────────────────
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redisAvailable = false;

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false, // Prevents hanging if Redis is down
  retryStrategy(times) {
    if (times > 1) {
      if (redisAvailable) {
        logger.warn("Redis connection lost. Switching to fallback mode.");
      }
      redisAvailable = false;
      return null; // Stop retrying immediately in dev
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
  // Silent log only - no errors or warnings to console during connection failure
  logger.debug(`Redis connection status: ${err.message}`);
});

// ─── Safe Wrapper Methods ────────────────────────────────
const safeRedis = {
  isAvailable: () => redisAvailable,
  
  get: async (key) => {
    if (!redisAvailable) return null;
    try {
      return await redisClient.get(key);
    } catch (err) {
      return null;
    }
  },
  
  set: async (key, value, mode, duration) => {
    if (!redisAvailable) return null;
    try {
      if (mode && duration) {
        return await redisClient.set(key, value, mode, duration);
      }
      return await redisClient.set(key, value);
    } catch (err) {
      return null;
    }
  },

  del: async (key) => {
    if (!redisAvailable) return null;
    try {
      return await redisClient.del(key);
    } catch (err) {
      return null;
    }
  },

  call: async (...args) => {
    if (!redisAvailable) return null;
    try {
      return await redisClient.call(...args);
    } catch (err) {
      return null;
    }
  },

  disconnect: async () => {
    try {
      await redisClient.disconnect();
    } catch (err) {
      // Ignore
    }
  }
};

module.exports = safeRedis;
