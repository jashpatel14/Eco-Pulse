const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/audit  — Admin only
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { recordType, from, to } = req.query;
    const where = {};
    if (recordType) where.recordType = recordType;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: "desc" },
      take: 500,
    });
    res.json(logs);
  } catch (err) {
    logger.error("GET /audit error:", err);
    res.status(500).json({ message: "Failed to fetch audit logs." });
  }
});

module.exports = router;
