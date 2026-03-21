const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

const WRITE_ROLES = ["ENGINEERING_USER", "ADMIN"];

async function generateBomReference() {
  const count = await prisma.bOM.count();
  return `BOM-${String(count + 1).padStart(4, "0")}`;
}

// GET /api/v1/boms
router.get("/", authMiddleware, async (req, res) => {
  try {
    const isOpsUser = req.user.role === "OPERATIONS_USER";
    const where = isOpsUser ? { status: "ACTIVE" } : {};
    const { search, productId } = req.query;
    if (productId) where.productId = productId;
    if (search) {
      where.product = { name: { contains: search, mode: "insensitive" } };
    }

    const boms = await prisma.bOM.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { created_at: "desc" },
    });
    res.json(boms);
  } catch (err) {
    logger.error("GET /boms error:", err);
    res.status(500).json({ message: "Failed to fetch BOMs." });
  }
});

// POST /api/v1/boms
router.post("/", authMiddleware, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const { productId, components = [], operations = [], reference } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required." });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status === "ARCHIVED") {
      return res.status(403).json({ message: "Cannot create BOM for an archived product." });
    }

    const ref = reference || await generateBomReference();

    const bom = await prisma.bOM.create({
      data: {
        reference: ref,
        productId,
        versionNumber: 1,
        status: "ACTIVE",
        components: {
          create: components.map((c) => ({
            componentName: c.componentName,
            quantity: parseFloat(c.quantity),
            makeOrBuy: c.makeOrBuy || "BUY",
            supplier: c.supplier || null,
            unitCost: c.unitCost ? parseFloat(c.unitCost) : null,
          })),
        },
        operations: {
          create: operations.map((o) => ({
            operationName: o.operationName,
            durationMins: parseInt(o.durationMins),
            workCenter: o.workCenter,
          })),
        },
      },
      include: { components: true, operations: true, product: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "BOM_CREATED",
        recordType: "BOM",
        recordId: bom.id,
        newValue: JSON.stringify({ reference: ref, productId }),
        userId: req.user.id,
      },
    });

    res.status(201).json(bom);
  } catch (err) {
    logger.error("POST /boms error:", err);
    res.status(500).json({ message: "Failed to create BOM." });
  }
});

// GET /api/v1/boms/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const bom = await prisma.bOM.findUnique({
      where: { id: req.params.id },
      include: {
        components: true,
        operations: true,
        product: {
          include: {
            boms: { orderBy: { versionNumber: "asc" } },
          },
        },
      },
    });
    if (!bom) return res.status(404).json({ message: "BOM not found." });

    const isOpsUser = req.user.role === "OPERATIONS_USER";
    if (isOpsUser && bom.status === "ARCHIVED") {
      return res.status(403).json({ message: "This record is archived or not yet approved." });
    }
    res.json(bom);
  } catch (err) {
    logger.error("GET /boms/:id error:", err);
    res.status(500).json({ message: "Failed to fetch BOM." });
  }
});

module.exports = router;
