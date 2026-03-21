const prisma = require("../config/prisma");
const logger = require("../utils/logger");

/**
 * Fetch full version history for a product.
 */
const getProductHistory = async (productId, userRole) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, currentVersion: true }
  });

  if (!product) throw new Error("Product not found");

  const where = { productId };
  if (userRole === "OPERATIONS_USER") {
    where.status = "ACTIVE";
  }

  const history = await prisma.productVersion.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      eco: { select: { id: true, title: true, ecoType: true } }
    },
    orderBy: { versionNumber: "desc" }
  });

  return {
    productId,
    productName: product.name,
    totalVersions: history.length,
    currentVersion: `v${product.currentVersion}`,
    history: history.map(v => ({
      versionNumber: v.versionNumber,
      label: `v${v.versionNumber}`,
      ecoId: v.ecoId,
      ecoTitle: v.eco?.title || "Initial Setup",
      ecoType: v.eco?.ecoType || "PRODUCT",
      createdBy: v.createdBy?.name || "System",
      createdAt: v.created_at,
      status: v.status,
      // We could add change summaries here by looking at ECODraftChanges
    }))
  };
};

/**
 * Compare two versions of a product's BOM and metadata.
 */
const compareVersions = async (productId, fromVer, toVer, userRole) => {
  const [fromBom, toBom, fromProduct, toProduct] = await Promise.all([
    prisma.bOM.findFirst({ where: { productId, versionNumber: parseInt(fromVer) }, include: { components: true, operations: true } }),
    prisma.bOM.findFirst({ where: { productId, versionNumber: parseInt(toVer) }, include: { components: true, operations: true } }),
    prisma.productVersion.findFirst({ where: { productId, versionNumber: parseInt(fromVer) } }),
    prisma.productVersion.findFirst({ where: { productId, versionNumber: parseInt(toVer) } })
  ]);

  if (!fromProduct || !toProduct) throw new Error("Version not found");

  if (userRole === "OPERATIONS_USER") {
    if (fromProduct.status !== "ACTIVE" || toProduct.status !== "ACTIVE") {
      throw new Error("Access denied: Operations Users can only compare ACTIVE versions.");
    }
  }

  const diffComponents = (from, to) => {
    const fromMap = new Map(from.map(c => [c.componentName, c]));
    const toMap = new Map(to.map(c => [c.componentName, c]));
    const allNames = new Set([...fromMap.keys(), ...toMap.keys()]);
    
    return Array.from(allNames).map(name => {
      const f = fromMap.get(name);
      const t = toMap.get(name);
      if (!f) return { name, status: "added", fromValue: "—", toValue: t.quantity, change: "new" };
      if (!t) return { name, status: "removed", fromValue: f.quantity, toValue: "—", change: "removed" };
      if (f.quantity.toString() !== t.quantity.toString()) return { name, status: "changed", fromValue: f.quantity, toValue: t.quantity, change: (t.quantity - f.quantity).toFixed(2) };
      return { name, status: "same", fromValue: f.quantity, toValue: t.quantity, change: "0" };
    });
  };

  const diffOperations = (from, to) => {
    const fromMap = new Map(from.map(o => [o.operationName, o]));
    const toMap = new Map(to.map(o => [o.operationName, o]));
    const allNames = new Set([...fromMap.keys(), ...toMap.keys()]);

    return Array.from(allNames).map(name => {
      const f = fromMap.get(name);
      const t = toMap.get(name);
      if (!f) return { name, status: "added", fromValue: "—", toValue: `${t.durationMins} min`, change: "new" };
      if (!t) return { name, status: "removed", fromValue: `${f.durationMins} min`, toValue: "—", change: "removed" };
      if (f.durationMins !== t.durationMins) return { name, status: "changed", fromValue: `${f.durationMins} min`, toValue: `${t.durationMins} min`, change: `${t.durationMins - f.durationMins} min` };
      return { name, status: "same", fromValue: `${f.durationMins} min`, toValue: `${t.durationMins} min`, change: "0" };
    });
  };

  const comps = diffComponents(fromBom?.components || [], toBom?.components || []);
  const ops = diffOperations(fromBom?.operations || [], toBom?.operations || []);

  const productFields = [
    { field: "Sale Price", status: fromProduct.salePrice.toString() === toProduct.salePrice.toString() ? "same" : "changed", fromValue: `₹${fromProduct.salePrice}`, toValue: `₹${toProduct.salePrice}` },
    { field: "Cost Price", status: fromProduct.costPrice.toString() === toProduct.costPrice.toString() ? "same" : "changed", fromValue: `₹${fromProduct.costPrice}`, toValue: `₹${toProduct.costPrice}` }
  ];

  return {
    from: { version: fromVer, label: `v${fromVer}`, date: fromProduct.created_at },
    to: { version: toVer, label: `v${toVer}`, date: toProduct.created_at },
    summary: {
      added: [...comps, ...ops].filter(i => i.status === "added").length,
      removed: [...comps, ...ops].filter(i => i.status === "removed").length,
      changed: [...comps, ...ops, ...productFields].filter(i => i.status === "changed").length,
      same: [...comps, ...ops, ...productFields].filter(i => i.status === "same").length
    },
    components: comps,
    operations: ops,
    productFields
  };
};

/**
 * Git-blame style data for individual fields/items.
 */
const getBlameData = async (productId, userRole) => {
  if (userRole === "OPERATIONS_USER") {
    throw new Error("Access denied: Operations Users do not have access to blame data.");
  }
  const currentBoms = await prisma.bOM.findMany({
    where: { productId },
    include: { 
      components: { orderBy: { componentName: "asc" } },
      operations: { orderBy: { operationName: "asc" } },
      createdBy: { select: { name: true } },
      originEco: { select: { title: true } }
    },
    orderBy: { versionNumber: "desc" }
  });

  const productVersions = await prisma.productVersion.findMany({
    where: { productId },
    include: { 
      createdBy: { select: { name: true } },
      eco: { select: { title: true } }
    },
    orderBy: { versionNumber: "desc" }
  });

  if (currentBoms.length === 0) return { components: [], productFields: [] };

  const latestBom = currentBoms[0];
  const latestProd = productVersions[0];

  const componentsBlame = latestBom.components.map(comp => {
    // Basic blame: who created the BOM version that currently has this component?
    // In a truly deep blame, we'd search back until the value changed.
    return {
      componentName: comp.componentName,
      currentValue: comp.quantity,
      lastChangedVersion: `v${latestBom.versionNumber}`,
      lastChangedBy: latestBom.createdBy?.name || "System",
      lastChangedECO: latestBom.originEco?.title || "Initial",
      lastChangedAt: latestBom.created_at
    };
  });

  const productFields = [
    {
      field: "Sale Price",
      currentValue: `₹${latestProd.salePrice}`,
      lastChangedVersion: `v${latestProd.versionNumber}`,
      lastChangedBy: latestProd.createdBy?.name || "System",
      lastChangedECO: latestProd.eco?.title || "Initial",
      lastChangedAt: latestProd.created_at
    },
    {
      field: "Cost Price",
      currentValue: `₹${latestProd.costPrice}`,
      lastChangedVersion: `v${latestProd.versionNumber}`,
      lastChangedBy: latestProd.createdBy?.name || "System",
      lastChangedECO: latestProd.eco?.title || "Initial",
      lastChangedAt: latestProd.created_at
    }
  ];

  return { components: componentsBlame, productFields };
};

/**
 * Revert to a previous state by creating a new Draft ECO.
 */
const createRollbackECO = async (productId, targetVersion, userId, reason) => {
  const [targetBom, targetProd, firstStage] = await Promise.all([
    prisma.bOM.findFirst({ where: { productId, versionNumber: parseInt(targetVersion) }, include: { components: true, operations: true } }),
    prisma.productVersion.findFirst({ where: { productId, versionNumber: parseInt(targetVersion) } }),
    prisma.eCOStage.findFirst({ orderBy: { orderIndex: "asc" } })
  ]);

  if (!targetProd) throw new Error("Target version not found");

  return await prisma.$transaction(async (tx) => {
    const eco = await tx.eCO.create({
      data: {
        title: `Rollback to v${targetVersion}: ${reason}`,
        ecoType: "BOM",
        productId,
        userId,
        stageId: firstStage.id,
        changeReason: "DESIGN_UPDATE",
        riskLevel: "MEDIUM",
        status: "DRAFT",
        versionUpdate: true
      }
    });

    // Recreate BOM Components
    for (const comp of (targetBom?.components || [])) {
      await tx.eCODraftChange.create({
        data: {
          ecoId: eco.id,
          fieldName: "ADD",
          recordType: "BOM_COMPONENT",
          recordId: comp.componentName,
          newValue: JSON.stringify({
            componentName: comp.componentName,
            quantity: comp.quantity,
            makeOrBuy: comp.makeOrBuy,
            supplier: comp.supplier,
            unitCost: comp.unitCost
          })
        }
      });
    }

    // Metadata changes
    await tx.eCODraftChange.create({
      data: { ecoId: eco.id, fieldName: "salePrice", recordType: "PRODUCT", recordId: productId, newValue: targetProd.salePrice.toString() }
    });
    await tx.eCODraftChange.create({
      data: { ecoId: eco.id, fieldName: "costPrice", recordType: "PRODUCT", recordId: productId, newValue: targetProd.costPrice.toString() }
    });

    return eco;
  });
};

module.exports = {
  getProductHistory,
  compareVersions,
  getBlameData,
  createRollbackECO
};
