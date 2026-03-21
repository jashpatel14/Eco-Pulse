const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/reports/eco-summary
router.get("/eco-summary", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "ADMIN"), async (req, res) => {
  try {
    const ecos = await prisma.eCO.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
        stage: { select: { name: true } },
        _count: { select: { draftChanges: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const stats = {
      total: ecos.length,
      draft: ecos.filter(e => e.status === 'DRAFT').length,
      inReview: ecos.filter(e => e.status === 'IN_REVIEW').length,
      applied: ecos.filter(e => e.status === 'APPLIED').length,
      rejected: ecos.filter(e => e.status === 'REJECTED').length,
    };

    res.json({ stats, ecos });
  } catch (err) {
    logger.error("GET /reports/eco-summary error:", err);
    res.status(500).json({ message: "Failed to fetch ECO summary." });
  }
});

// GET /api/v1/reports/product-history/:productId
router.get("/product-history/:productId", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "ADMIN"), async (req, res) => {
  try {
    const versions = await prisma.productVersion.findMany({
      where: { productId: req.params.productId },
      include: {
        product: { select: { name: true } }
      },
      orderBy: { versionNumber: 'desc' }
    });

    // Also get ECOs that affected this product and were APPLIED
    const ecos = await prisma.eCO.findMany({
      where: { productId: req.params.productId, status: 'APPLIED' },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { updated_at: 'desc' }
    });

    res.json({ versions, ecos });
  } catch (err) {
    logger.error("GET /reports/product-history error:", err);
    res.status(500).json({ message: "Failed to fetch product history." });
  }
});

// GET /api/v1/reports/bom-history/:bomId
router.get("/bom-history/:bomId", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "ADMIN"), async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { 
        OR: [
          { recordType: 'BOM', recordId: req.params.bomId },
          { recordType: 'BOM_COMPONENT', recordId: { contains: req.params.bomId } } // Approximation
        ]
      },
      include: { user: { select: { name: true } } },
      orderBy: { timestamp: 'desc' }
    });

    res.json(auditLogs);
  } catch (err) {
    logger.error("GET /reports/bom-history error:", err);
    res.status(500).json({ message: "Failed to fetch BOM history." });
  }
});

// GET /api/v1/reports/matrix
router.get("/matrix", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "ADMIN", "OPERATIONS_USER"), async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        boms: {
          where: { status: 'ACTIVE' },
          include: {
            components: true
          }
        }
      }
    });

    const matrix = products.map(p => ({
      productId: p.id,
      productName: p.name,
      currentVersion: p.currentVersion,
      activeBOM: p.boms[0] || null
    }));

    res.json(matrix);
  } catch (err) {
    logger.error("GET /reports/matrix error:", err);
    res.status(500).json({ message: "Failed to fetch product matrix." });
  }
});

module.exports = router;
