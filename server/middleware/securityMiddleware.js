const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const redisClient = require("../config/redis");
const RedisStore = require("rate-limit-redis").default;

// Rate Limiters using Redis Store locally (Fallback to Memory if disconnected)
const createRateLimiter = (maxRequests, windowMs) =>
  rateLimit({
    windowMs,
    max: maxRequests,
    // Safely utilize redis if configured AND connected for consistent rate limiting across clusters
    store:
      redisClient && redisClient.isAvailable()
        ? new RedisStore({
            sendCommand: async (...args) => redisClient.call(...args),
          })
        : undefined,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    },
  });

// Specific Limiters
const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts / 15 mins
const registerLimiter = createRateLimiter(20, 60 * 60 * 1000); // 20 attempts / hr
const forgotPasswordLimiter = createRateLimiter(10, 15 * 60 * 1000); // 10 attempts / 15 mins
const refreshLimiter = createRateLimiter(30, 15 * 60 * 1000); // 30 attempts / 15 mins

// Helmet Configuration (Strict API Headers)
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
  securityHeaders,
};
