const express = require("express");
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const isOpsUser = req.user.role === "OPERATIONS_USER";
    const statusFilter = isOpsUser ? { status: "ACTIVE" } : {};
    
    const productsCount = await prisma.product.count({ where: statusFilter });
    const bomsCount = await prisma.bOM.count({ where: statusFilter });
    
    // Group ECO counts by status
    const ecoStatusCounts = await prisma.eCO.groupBy({
      by: ['status'],
      where: isOpsUser ? { status: { notIn: ["DRAFT", "ARCHIVED"] } } : {},
      _count: {
        status: true,
      },
    });

    // Format eco counts
    const ecos = {
      total: 0,
      DRAFT: 0,
      IN_REVIEW: 0,
      APPLIED: 0,
      REJECTED: 0,
    };

    ecoStatusCounts.forEach(item => {
      ecos[item.status] = item._count.status;
      ecos.total += item._count.status;
    });

    res.json({
      products: productsCount,
      boms: bomsCount,
      ecos
    });
  } catch (err) {
    logger.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

module.exports = router;
