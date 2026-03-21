const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

// GET /api/v1/reports/ecos
router.get("/ecos", authMiddleware, async (req, res) => {
  try {
    const ecos = await prisma.eCO.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
        stage: { select: { name: true } },
        draftChanges: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(ecos);
  } catch (err) {
    logger.error("GET /reports/ecos error:", err);
    res.status(500).json({ message: "Failed to fetch ECO report." });
  }
});

// GET /api/v1/reports/versions?productId=xxx
router.get("/versions", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;
    const where = productId ? { productId } : {};
    const versions = await prisma.productVersion.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { versionNumber: "desc" },
    });
    res.json(versions);
  } catch (err) {
    logger.error("GET /reports/versions error:", err);
    res.status(500).json({ message: "Failed to fetch version report." });
  }
});

// GET /api/v1/reports/bom-history?productId=xxx
router.get("/bom-history", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;
    const where = productId ? { productId } : {};
    const boms = await prisma.bOM.findMany({
      where,
      include: {
        product: { select: { name: true } },
        components: true,
        operations: true,
      },
      orderBy: { versionNumber: "desc" },
    });
    res.json(boms);
  } catch (err) {
    logger.error("GET /reports/bom-history error:", err);
    res.status(500).json({ message: "Failed to fetch BOM history report." });
  }
});

// GET /api/v1/reports/archived
router.get("/archived", authMiddleware, async (req, res) => {
  try {
    const archived = await prisma.productVersion.findMany({
      where: { status: "ARCHIVED" },
      include: { product: { select: { name: true } } },
      orderBy: { created_at: "desc" },
    });
    res.json(archived);
  } catch (err) {
    logger.error("GET /reports/archived error:", err);
    res.status(500).json({ message: "Failed to fetch archived products report." });
  }
});

// GET /api/v1/reports/matrix — Active Product-Version-BoM Matrix
router.get("/matrix", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        versions: { where: { status: "ACTIVE" }, orderBy: { versionNumber: "desc" }, take: 1 },
        boms: { where: { status: "ACTIVE" }, orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    const matrix = products
      .filter((p) => p.boms.length > 0)
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        activeVersion: p.versions[0]?.versionNumber ?? p.currentVersion,
        activeBomReference: p.boms[0]?.reference ?? null,
        activeBomVersion: p.boms[0]?.versionNumber ?? null,
        lastChanged: p.updated_at,
      }));

    res.json(matrix);
  } catch (err) {
    logger.error("GET /reports/matrix error:", err);
    res.status(500).json({ message: "Failed to fetch matrix report." });
  }
});

module.exports = router;
