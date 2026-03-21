const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/stages
router.get("/", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"), async (req, res) => {
  try {
    const stages = await prisma.eCOStage.findMany({
      orderBy: { orderIndex: "asc" },
      include: { approval_rules: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    res.json(stages);
  } catch (err) {
    logger.error("GET /stages error:", err);
    res.status(500).json({ message: "Failed to fetch stages." });
  }
});

// POST /api/v1/stages
router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, approvalRequired = false } = req.body;
    if (!name) return res.status(400).json({ message: "Stage name is required." });

    // Insert before "Done" (highest orderIndex)
    const doneStage = await prisma.eCOStage.findFirst({ orderBy: { orderIndex: "desc" } });
    const newIndex = doneStage ? doneStage.orderIndex - 1 : 1;

    const stage = await prisma.eCOStage.create({
      data: { name, orderIndex: newIndex, approvalRequired },
    });
    res.status(201).json(stage);
  } catch (err) {
    logger.error("POST /stages error:", err);
    res.status(500).json({ message: "Failed to create stage." });
  }
});

// PATCH /api/v1/stages/:id
router.patch("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, approvalRequired } = req.body;
    const stage = await prisma.eCOStage.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(approvalRequired !== undefined && { approvalRequired }),
      },
    });
    res.json(stage);
  } catch (err) {
    logger.error("PATCH /stages/:id error:", err);
    res.status(500).json({ message: "Failed to update stage." });
  }
});

// DELETE /api/v1/stages/:id
router.delete("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const stage = await prisma.eCOStage.findUnique({ where: { id: req.params.id } });
    if (!stage) return res.status(404).json({ message: "Stage not found." });
    if (stage.name === "New" || stage.name === "Done") {
      return res.status(403).json({ message: "Cannot delete the New or Done stages." });
    }
    await prisma.eCOStage.delete({ where: { id: req.params.id } });
    res.json({ message: "Stage deleted." });
  } catch (err) {
    logger.error("DELETE /stages/:id error:", err);
    res.status(500).json({ message: "Failed to delete stage." });
  }
});

// PATCH /api/v1/stages/reorder
router.patch("/reorder", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const { order } = req.body; // Array of { id, orderIndex }
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: "order must be an array." });
    }
    const updates = order.map(({ id, orderIndex }) =>
      prisma.eCOStage.update({ where: { id }, data: { orderIndex } })
    );
    await prisma.$transaction(updates);
    res.json({ message: "Stages reordered." });
  } catch (err) {
    logger.error("PATCH /stages/reorder error:", err);
    res.status(500).json({ message: "Failed to reorder stages." });
  }
});

module.exports = router;
