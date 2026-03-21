const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/users — for Approvals settings dropdowns
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    res.json(users);
  } catch (err) {
    logger.error("GET /users error:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

module.exports = router;
