const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

const BOM_ROLES = ["ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"];
const WRITE_ROLES = ["ADMIN", "ENGINEERING_USER"]; // Direct edit for Admin and Engineering

async function generateBomReference() {
  return `BOM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// GET /api/v1/boms
router.get("/", authMiddleware, requireRole(...BOM_ROLES), async (req, res) => {
  try {
    const isOpsUser = req.user.role === "OPERATIONS_USER";
    const where = isOpsUser ? { status: "ACTIVE" } : {};
    const { search, productId, take = 50, skip = 0 } = req.query;
    if (productId) where.productId = productId;
    if (search) {
      where.product = { name: { contains: search, mode: "insensitive" } };
    }

    const boms = await prisma.bOM.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { created_at: "desc" },
      take: parseInt(take),
      skip: parseInt(skip),
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
    const { productId, components = [], operations = [], reference, attachments = [] } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required." });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status === "ARCHIVED") {
      return res.status(403).json({ message: "Cannot create BOM for an archived product." });
    }

    const ref = reference || await generateBomReference();

    const bom = await prisma.$transaction(async (tx) => {
      const createdBom = await tx.bOM.create({
        data: {
          reference: ref,
          productId,
          versionNumber: 1,
          status: "ACTIVE",
          attachments: attachments || [],
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

      await tx.auditLog.create({
        data: {
          action: "BOM_CREATED",
          recordType: "BOM",
          recordId: createdBom.id,
          newValue: JSON.stringify({ reference: ref, productId }),
          userId: req.user.id,
        },
      });

      return createdBom;
    });

    res.status(201).json(bom);
  } catch (err) {
    logger.error("POST /boms error:", err);
    res.status(500).json({ message: "Failed to create BOM." });
  }
});

// GET /api/v1/boms/:id
router.get("/:id", authMiddleware, requireRole(...BOM_ROLES), async (req, res) => {
  const { id } = req.params;
  
  // Validate UUID format to prevent Prisma crash
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ message: "Invalid BOM ID format." });
  }

  try {
    const bom = await prisma.bOM.findUnique({
      where: { id },
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

// PUT /api/v1/boms/:id
router.put("/:id", authMiddleware, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const { components = [], operations = [], attachments = [] } = req.body;
    const bomId = req.params.id;

    const updatedBom = await prisma.$transaction(async (tx) => {
      // 1. Update BOM metadata
      const bom = await tx.bOM.update({
        where: { id: bomId },
        data: { attachments: attachments || [] },
      });

      // 2. Clear and recreate components
      await tx.bOMComponent.deleteMany({ where: { bomId } });
      if (components.length > 0) {
        await tx.bOMComponent.createMany({
          data: components.map((c) => ({
            bomId,
            componentName: c.componentName,
            quantity: parseFloat(c.quantity),
            makeOrBuy: c.makeOrBuy || "BUY",
            supplier: c.supplier || null,
            unitCost: c.unitCost ? parseFloat(c.unitCost) : null,
          })),
        });
      }

      // 3. Clear and recreate operations
      await tx.bOMOperation.deleteMany({ where: { bomId } });
      if (operations.length > 0) {
        await tx.bOMOperation.createMany({
          data: operations.map((o) => ({
            bomId,
            operationName: o.operationName,
            durationMins: parseInt(o.durationMins),
            workCenter: o.workCenter,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          action: "BOM_UPDATED",
          recordType: "BOM",
          recordId: bomId,
          newValue: JSON.stringify({ componentCount: components.length, operationCount: operations.length }),
          userId: req.user.id,
        },
      });

      return bom;
    });

    res.json(updatedBom);
  } catch (err) {
    logger.error("PUT /boms/:id error:", err);
    res.status(500).json({ message: "Failed to update BOM." });
  }
});

module.exports = router;
