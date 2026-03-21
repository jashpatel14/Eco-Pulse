const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const logger = require("../utils/logger");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Check Redis blocklist (if Redis is available)
    const isBlocklisted = await redisClient.get(`blocklist:${token}`);
    if (isBlocklisted) {
      logger.warn(`Attempt to use blocklisted token`);
      return res.status(401).json({ message: "Token has been revoked." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX 6: Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    logger.error("Auth middleware error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authentication" });
  }
};

module.exports = { authMiddleware };
