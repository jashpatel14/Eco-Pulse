const express = require("express");
const router = express.Router();
const versionControlService = require("../services/versionControlService");
const authMiddleware = require("../middleware/authMiddleware").authMiddleware;
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

const PRODUCT_ROLES = ["ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"];

/**
 * GET /api/v1/version-control/history/:id
 * Fetch version history for a product.
 */
router.get("/history/:id", authMiddleware, requireRole(...PRODUCT_ROLES), async (req, res) => {
  try {
    const history = await versionControlService.getProductHistory(req.params.id, req.user.role);
    res.json(history);
  } catch (err) {
    logger.error(`History error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/version-control/compare/:id?from=1&to=2
 * Compare two versions of a product.
 */
router.get("/compare/:id", authMiddleware, requireRole(...PRODUCT_ROLES), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: "Missing from/to versions" });
    
    const diff = await versionControlService.compareVersions(req.params.id, from, to, req.user.role);
    res.json(diff);
  } catch (err) {
    logger.error(`Compare error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/version-control/blame/:id
 * Blame data for current product state.
 */
router.get("/blame/:id", authMiddleware, requireRole(...PRODUCT_ROLES), async (req, res) => {
  try {
    const blame = await versionControlService.getBlameData(req.params.id, req.user.role);
    res.json(blame);
  } catch (err) {
    logger.error(`Blame error: ${err.message}`);
    res.status(err.message.includes("Access denied") ? 403 : 500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/version-control/rollback/:id
 * Revert to a previous version by creating a new Draft ECO.
 */
router.post("/rollback/:id", authMiddleware, requireRole("ENGINEERING_USER", "ADMIN"), async (req, res) => {
  try {
    const { targetVersion, reason, autoApply = true } = req.body;
    if (!targetVersion || !reason) return res.status(400).json({ error: "Target version and reason required" });

    const eco = await versionControlService.createRollbackECO(req.params.id, targetVersion, req.user.id, reason, autoApply);
    
    res.json({
      message: autoApply ? "Product restored successfully to previous version" : "Rollback ECO created successfully",
      ecoId: eco.id,
      ecoTitle: eco.title,
      nextStep: autoApply ? "Changes are now live" : "ECO requires approval before being applied"
    });
  } catch (err) {
    logger.error(`Rollback error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
