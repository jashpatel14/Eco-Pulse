const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/approvals
router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const rules = await prisma.eCOApprovalRule.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        stage: { select: { id: true, name: true } },
      },
    });
    res.json(rules);
  } catch (err) {
    logger.error("GET /approvals error:", err);
    res.status(500).json({ message: "Failed to fetch approval rules." });
  }
});

// POST /api/v1/approvals
router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { stageId, userId, approvalCategory = "REQUIRED" } = req.body;
    if (!stageId || !userId) {
      return res.status(400).json({ message: "stageId and userId are required." });
    }
    const rule = await prisma.eCOApprovalRule.create({
      data: { stageId, userId, approvalCategory },
      include: {
        user: { select: { id: true, name: true, email: true } },
        stage: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(rule);
  } catch (err) {
    logger.error("POST /approvals error:", err);
    res.status(500).json({ message: "Failed to create approval rule." });
  }
});

// DELETE /api/v1/approvals/:id
router.delete("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.eCOApprovalRule.delete({ where: { id: req.params.id } });
    res.json({ message: "Approval rule deleted." });
  } catch (err) {
    logger.error("DELETE /approvals/:id error:", err);
    res.status(500).json({ message: "Failed to delete approval rule." });
  }
});

module.exports = router;
