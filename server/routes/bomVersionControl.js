const express = require("express");
const router = express.Router();
const bomVC = require("../services/bomVersionControlService");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

/**
 * GET /api/bom-vc/history/:bomId
 * Returns version history for the product that owns this BOM.
 */
router.get("/history/:bomId", authMiddleware, async (req, res) => {
  try {
    const history = await bomVC.getBOMHistory(req.params.bomId, req.user.role);
    res.json(history);
  } catch (err) {
    logger.error(`BOM History error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * GET /api/bom-vc/compare/:bomId?from=N&to=M
 */
router.get("/compare/:bomId", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: "Missing from/to query params" });
    const diff = await bomVC.compareBOMVersions(req.params.bomId, from, to, req.user.role);
    res.json(diff);
  } catch (err) {
    logger.error(`BOM Compare error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * GET /api/bom-vc/blame/:bomId
 */
router.get("/blame/:bomId", authMiddleware, async (req, res) => {
  try {
    const blame = await bomVC.getBOMBlame(req.params.bomId, req.user.role);
    res.json(blame);
  } catch (err) {
    logger.error(`BOM Blame error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * POST /api/bom-vc/rollback/:bomId
 * Engineering and Admin only.
 */
router.post(
  "/rollback/:bomId",
  authMiddleware,
  requireRole(["ADMIN", "ENGINEERING_USER"]),
  async (req, res) => {
    try {
      const { targetVersion, reason } = req.body;
      if (!targetVersion || !reason) return res.status(400).json({ error: "targetVersion and reason required" });
      const eco = await bomVC.createBOMRollback(req.params.bomId, targetVersion, req.user.id, reason);
      res.json({ message: `Rollback ECO created: ${eco.title}`, ecoId: eco.id });
    } catch (err) {
      logger.error(`BOM Rollback error: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
