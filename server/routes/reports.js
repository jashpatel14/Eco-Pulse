const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

// GET /api/v1/reports/eco-summary
router.get("/eco-summary", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "ADMIN"), async (req, res) => {
  try {
    // fetch all ecos with their main links
    const ecos = await prisma.eCO.findMany({
      // include related objects for full context
      include: {
        // need name for display on board
        product: { select: { name: true } },
        // identify who is responsible for the eco
        user: { select: { name: true } },
        // track where it sits in the workflow
        stage: { select: { name: true } },
        // count modifications for complexity insight
        _count: { select: { draftChanges: true } }
      },
      // show newest first by default
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
    // get every release record for this product
    const versions = await prisma.productVersion.findMany({
      // filter only for the requested item
      where: { productId: req.params.productId },
      // include product name for header context
      include: {
        product: { select: { name: true } }
      },
      // show most recent versions at the top
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
    // find all actions related to this bill
    const auditLogs = await prisma.auditLog.findMany({
      // check both the bill and its parts
      where: { 
        OR: [
          // direct hit on the bill id
          { recordType: 'BOM', recordId: req.params.bomId },
          // search logs for related component edits
          { recordType: 'BOM_COMPONENT', recordId: { contains: req.params.bomId } } // Approximation
        ]
      },
      // attach user name to each action log
      include: { user: { select: { name: true } } },
      // standard chronological history order
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
    // list all currently manufactured items
    const products = await prisma.product.findMany({
      // ignore archived or retired items
      where: { status: 'ACTIVE' },
      // nest the primary bill for each item
      include: {
        // only grab the currently active manufacturing bill
        boms: {
          // ensure the bill is actually in use
          where: { status: 'ACTIVE' },
          // include all parts list for the total count
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

/*
FILE SUMMARY
------------
What this file does: Defines API endpoints for system-wide reports.
Why it exists: Separates reporting logic from core business transactions.
Main functions: router.get(/eco-summary), router.get(/product-history), router.get(/bom-history), router.get(/matrix)
Connects to: server/index.js for routing, prisma client for data.
Danger zones: Filtering by 'contains' on BOM components is approximate.
*/

