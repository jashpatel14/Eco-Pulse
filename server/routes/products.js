const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const logger = require("../utils/logger");

const PRODUCT_ROLES = ["ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"];
const WRITE_ROLES = ["ADMIN"]; // Direct edit ONLY for Admin as per spec

// Auto-generate product reference like PROD-000001
async function generateProductReference() {
  const count = await prisma.product.count();
  return `PROD-${String(count + 1).padStart(6, "0")}`;
}

// GET /api/v1/products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const isOpsUser = req.user.role === "OPERATIONS_USER";
    const where = isOpsUser ? { status: "ACTIVE" } : {};
    const { search } = req.query;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updated_at: "desc" },
    });
    res.json(products);
  } catch (err) {
    logger.error("GET /products error:", err);
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

// POST /api/v1/products
router.post("/", authMiddleware, requireRole(...WRITE_ROLES), async (req, res) => {
  try {
    const { name, salePrice, costPrice, attachments = [] } = req.body;
    if (!name || !salePrice || !costPrice) {
      return res.status(400).json({ message: "Name, salePrice, and costPrice are required." });
    }

    const product = await prisma.product.create({
      data: {
        name,
        salePrice: parseFloat(salePrice),
        costPrice: parseFloat(costPrice),
        attachments,
        currentVersion: 1,
        status: "ACTIVE",
        versions: {
          create: {
            versionNumber: 1,
            salePrice: parseFloat(salePrice),
            costPrice: parseFloat(costPrice),
            attachments,
            status: "ACTIVE",
          },
        },
      },
      include: { versions: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_CREATED",
        recordType: "PRODUCT",
        recordId: product.id,
        newValue: JSON.stringify({ name, salePrice, costPrice }),
        userId: req.user.id,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "A product with this name already exists." });
    }
    logger.error("POST /products error:", err);
    res.status(500).json({ message: "Failed to create product." });
  }
});

// GET /api/v1/products/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { versionNumber: "desc" } } },
    });
    if (!product) return res.status(404).json({ message: "Product not found." });

    const isOpsUser = req.user.role === "OPERATIONS_USER";
    if (isOpsUser && product.status === "ARCHIVED") {
      return res.status(403).json({ message: "This record is archived or not yet approved." });
    }

    res.json(product);
  } catch (err) {
    logger.error("GET /products/:id error:", err);
    res.status(500).json({ message: "Failed to fetch product." });
  }
});

// PATCH /api/v1/products/:id/archive
router.patch("/:id/archive", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: "ARCHIVED" },
    });
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_ARCHIVED",
        recordType: "PRODUCT",
        recordId: product.id,
        userId: req.user.id,
      },
    });
    res.json(product);
  } catch (err) {
    logger.error("PATCH /products/:id/archive error:", err);
    res.status(500).json({ message: "Failed to archive product." });
  }
});

module.exports = router;
