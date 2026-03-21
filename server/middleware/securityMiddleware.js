const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const redisClient = require("../config/redis");
const RedisStore = require("rate-limit-redis").default;

const createRateLimiter = (maxRequests, windowMs) =>
  rateLimit({
    windowMs,
    max: maxRequests,
    store:
      redisClient && redisClient.isAvailable()
        ? new RedisStore({ sendCommand: async (...args) => redisClient.call(...args) })
        : undefined,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    },
  });

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);
const registerLimiter = createRateLimiter(20, 60 * 60 * 1000);
const forgotPasswordLimiter = createRateLimiter(10, 15 * 60 * 1000);
const refreshLimiter = createRateLimiter(30, 15 * 60 * 1000);

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
