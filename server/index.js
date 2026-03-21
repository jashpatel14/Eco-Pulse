process.env.DEBUG = ""; // Suppress Prisma debug noise
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { securityHeaders } = require("./middleware/securityMiddleware");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/products");
const bomRoutes = require("./routes/boms");
const stageRoutes = require("./routes/stages");
const approvalRoutes = require("./routes/approvals");
const ecoRoutes = require("./routes/ecos");
const reportRoutes = require("./routes/reports");
const auditRoutes = require("./routes/audit");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const logger = require("./utils/logger");
const prisma = require("./config/prisma");
const redisClient = require("./config/redis");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────
// Dynamic CORS (Whitelist from Env)
const whitelist = process.env.CORS_WHITELIST 
  ? process.env.CORS_WHITELIST.split(",") 
  : [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Apply Helmet Security Headers
app.use(securityHeaders);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ─────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);

// ─── PLM Routes ──────────────────────────────────────────
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/boms", bomRoutes);
app.use("/api/v1/stages", stageRoutes);
app.use("/api/v1/approvals", approvalRoutes);
app.use("/api/v1/ecos", ecoRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/users", userRoutes);


// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start Server ────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API version: v1`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// ─── Graceful Shutdown ────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown sequence...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Could not close connections in time, forceful shutdown");
    process.exit(1);
  }, 10000);

  try {
    // 1. Stop accepting new requests
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info("HTTP server closed.");
    }

    // 2. Close dependencies safely
    if (redisClient && typeof redisClient.disconnect === "function") {
      await redisClient.disconnect();
      logger.info("Redis connection terminated.");
    }

    if (prisma && typeof prisma.$disconnect === "function") {
      await prisma.$disconnect();
      logger.info("Database connection closed.");
    }
    
    clearTimeout(shutdownTimeout);
    logger.info("Graceful shutdown completed successfully.");
    process.exit(0);
  } catch (err) {
    logger.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});
