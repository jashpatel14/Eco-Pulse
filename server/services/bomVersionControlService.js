const prisma = require("../config/prisma");
const logger = require("../utils/logger");

/**
 * Fetch all BOM versions for the same product as the given BOM.
 */
const getBOMHistory = async (bomId, userRole) => {
  const bom = await prisma.bOM.findUnique({
    where: { id: bomId },
    select: { productId: true, reference: true }
  });
  if (!bom) throw new Error("BOM not found");

  const where = { productId: bom.productId };
  if (userRole === "OPERATIONS_USER") {
    where.status = "ACTIVE";
  }

  const history = await prisma.bOM.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      originEco: { select: { id: true, title: true, ecoType: true } }
    },
    orderBy: { versionNumber: "desc" }
  });

  return {
    bomId,
    productId: bom.productId,
    totalVersions: history.length,
    history: history.map(v => ({
      id: v.id,
      versionNumber: v.versionNumber,
      label: `v${v.versionNumber}`,
      reference: v.reference,
      ecoId: v.ecoId,
      ecoTitle: v.originEco?.title || "Initial Setup",
      ecoType: v.originEco?.ecoType || "BOM",
      createdBy: v.createdBy?.name || "System",
      createdAt: v.created_at,
      status: v.status,
      isCurrent: v.id === bomId
    }))
  };
};

/**
 * Side-by-side diff between two BOM versions (by versionNumber).
 */
const compareBOMVersions = async (bomId, fromVer, toVer, userRole) => {
  const bom = await prisma.bOM.findUnique({ where: { id: bomId }, select: { productId: true } });
  if (!bom) throw new Error("BOM not found");

  const [fromBom, toBom] = await Promise.all([
    prisma.bOM.findFirst({
      where: { productId: bom.productId, versionNumber: parseInt(fromVer) },
      include: { components: true, operations: true }
    }),
    prisma.bOM.findFirst({
      where: { productId: bom.productId, versionNumber: parseInt(toVer) },
      include: { components: true, operations: true }
    })
  ]);

  if (!fromBom || !toBom) throw new Error("Version not found");

  if (userRole === "OPERATIONS_USER") {
    if (fromBom.status !== "ACTIVE" || toBom.status !== "ACTIVE") {
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
      if (!f) return { name, status: "added", fromValue: "—", toValue: `${t.quantity} (${t.makeOrBuy})`, change: "new" };
      if (!t) return { name, status: "removed", fromValue: `${f.quantity} (${f.makeOrBuy})`, toValue: "—", change: "removed" };
      const qChanged = f.quantity.toString() !== t.quantity.toString();
      const mChanged = f.makeOrBuy !== t.makeOrBuy;
      if (qChanged || mChanged) return { name, status: "changed", fromValue: `${f.quantity} (${f.makeOrBuy})`, toValue: `${t.quantity} (${t.makeOrBuy})`, change: qChanged ? (t.quantity - f.quantity).toFixed(2) : "type changed" };
      return { name, status: "same", fromValue: `${f.quantity} (${f.makeOrBuy})`, toValue: `${t.quantity} (${t.makeOrBuy})`, change: "0" };
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

  const comps = diffComponents(fromBom.components, toBom.components);
  const ops = diffOperations(fromBom.operations, toBom.operations);

  return {
    from: { version: fromVer, label: `v${fromVer}`, date: fromBom.created_at, reference: fromBom.reference },
    to: { version: toVer, label: `v${toVer}`, date: toBom.created_at, reference: toBom.reference },
    summary: {
      added: [...comps, ...ops].filter(i => i.status === "added").length,
      removed: [...comps, ...ops].filter(i => i.status === "removed").length,
      changed: [...comps, ...ops].filter(i => i.status === "changed").length,
      same: [...comps, ...ops].filter(i => i.status === "same").length
    },
    components: comps,
    operations: ops
  };
};

/**
 * Git-blame style per-component attribution for a BOM.
 */
const getBOMBlame = async (bomId, userRole) => {
  if (userRole === "OPERATIONS_USER") {
    throw new Error("Access denied: Operations Users do not have access to BOM blame data.");
  }

  const bom = await prisma.bOM.findUnique({ where: { id: bomId }, select: { productId: true } });
  if (!bom) throw new Error("BOM not found");

  const allVersions = await prisma.bOM.findMany({
    where: { productId: bom.productId },
    include: {
      components: { orderBy: { componentName: "asc" } },
      operations: { orderBy: { operationName: "asc" } },
      createdBy: { select: { name: true } },
      originEco: { select: { title: true } }
    },
    orderBy: { versionNumber: "desc" }
  });

  if (allVersions.length === 0) return { components: [], operations: [] };
  const latest = allVersions[0];

  const componentsBlame = latest.components.map(comp => ({
    componentName: comp.componentName,
    currentValue: `${comp.quantity} (${comp.makeOrBuy})`,
    lastChangedVersion: `v${latest.versionNumber}`,
    lastChangedBy: latest.createdBy?.name || "System",
    lastChangedECO: latest.originEco?.title || "Initial",
    lastChangedAt: latest.created_at
  }));

  const operationsBlame = latest.operations.map(op => ({
    componentName: op.operationName,
    currentValue: `${op.durationMins} min @ ${op.workCenter}`,
    lastChangedVersion: `v${latest.versionNumber}`,
    lastChangedBy: latest.createdBy?.name || "System",
    lastChangedECO: latest.originEco?.title || "Initial",
    lastChangedAt: latest.created_at
  }));

  return { components: componentsBlame, operations: operationsBlame };
};

/**
 * Create a Rollback ECO for restoring a BOM to a previous version.
 */
const createBOMRollback = async (bomId, targetVersion, userId, reason) => {
  const bom = await prisma.bOM.findUnique({ where: { id: bomId }, select: { productId: true } });
  if (!bom) throw new Error("BOM not found");

  const [targetBom, firstStage] = await Promise.all([
    prisma.bOM.findFirst({
      where: { productId: bom.productId, versionNumber: parseInt(targetVersion) },
      include: { components: true, operations: true }
    }),
    prisma.eCOStage.findFirst({ orderBy: { orderIndex: "asc" } })
  ]);

  if (!targetBom) throw new Error("Target BOM version not found");

  return await prisma.$transaction(async (tx) => {
    const eco = await tx.eCO.create({
      data: {
        title: `BOM Rollback to v${targetVersion}: ${reason}`,
        ecoType: "BOM",
        productId: bom.productId,
        userId,
        stageId: firstStage.id,
        changeReason: "DESIGN_UPDATE",
        riskLevel: "MEDIUM",
        status: "DRAFT",
        versionUpdate: true
      }
    });

    const draftChanges = targetBom.components.map(comp => ({
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
    }));

    if (draftChanges.length > 0) {
      await tx.eCODraftChange.createMany({ data: draftChanges });
    }

    return eco;
  });
};

module.exports = {
  getBOMHistory,
  compareBOMVersions,
  getBOMBlame,
  createBOMRollback
};
