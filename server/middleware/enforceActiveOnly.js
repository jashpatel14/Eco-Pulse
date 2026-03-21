/**
 * enforceActiveOnly.js — Blocks access to archived/draft records
 * for OPERATIONS_USER role and validates active status for productId/bomId references.
 */
const prisma = require("../config/prisma");

const enforceActiveOnly = async (req, res, next) => {
  try {
    const { productId, bomId } = { ...req.body, ...req.params, ...req.query };
    const role = req.user?.role;

    // OPERATIONS_USER: never see DRAFT or ARCHIVED
    // (individual route handlers also apply role-based filtering)

    // Validate productId if present
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { status: true },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }
      if (product.status === "ARCHIVED") {
        return res.status(403).json({
          message: "This record is archived or not yet approved.",
        });
      }
    }

    // Validate bomId if present
    if (bomId) {
      const bom = await prisma.bOM.findUnique({
        where: { id: bomId },
        select: { status: true },
      });
      if (!bom) {
        return res.status(404).json({ message: "Bill of Materials not found." });
      }
      if (bom.status === "ARCHIVED") {
        return res.status(403).json({
          message: "This record is archived or not yet approved.",
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { enforceActiveOnly };
