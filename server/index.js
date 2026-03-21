process.env.DEBUG = "";
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

const whitelist = process.env.CORS_WHITELIST
  ? process.env.CORS_WHITELIST.split(",")
  : [process.env.CLIENT_URL || "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        whitelist.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        callback(null, true);
      } else {
        logger.error(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(securityHeaders);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const versionControlRoutes = require("./routes/versionControl");
const bomVersionControlRoutes = require("./routes/bomVersionControl");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/boms", bomRoutes);
app.use("/api/v1/stages", stageRoutes);
app.use("/api/v1/approvals", approvalRoutes);
app.use("/api/v1/ecos", ecoRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/audit", auditRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/version-control", versionControlRoutes);
app.use("/api/v1/bom-vc", bomVersionControlRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API version: v1`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown sequence...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Could not close connections in time, forceful shutdown");
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info("HTTP server closed.");
    }
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
