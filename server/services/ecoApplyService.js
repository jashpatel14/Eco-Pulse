/**
 * ecoApplyService.js
 * Atomically applies an ECO's draft changes to the master data.
 * Must be called inside a Prisma transaction.
 */
const prisma = require("../config/prisma");
const { createNotification } = require("./notificationService");
const logger = require("../utils/logger");

const applyECO = async (ecoId) => {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch the ECO with all draft changes
    const eco = await tx.eCO.findUnique({
      where: { id: ecoId },
      include: {
        draftChanges: true,
        product: { include: { versions: true } },
        bom: { include: { components: true, operations: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!eco) throw new Error("ECO not found");

    const now = new Date();

    // ─── BOM ECO ──────────────────────────────────────────────
    if (eco.ecoType === "BOM" && eco.bom) {
      const currentBom = eco.bom;
      const newVersionNumber = currentBom.versionNumber + 1;

      if (eco.versionUpdate) {
        // Create new BOM version
        const newBom = await tx.bOM.create({
          data: {
            reference: currentBom.reference,
            productId: currentBom.productId,
            versionNumber: newVersionNumber,
            status: "ACTIVE",
            ecoId: eco.id,
            createdById: eco.userId,
          },
        });

        // Copy existing components to new BOM
        if (currentBom.components.length > 0) {
          await tx.bOMComponent.createMany({
            data: currentBom.components.map(comp => ({
              bomId: newBom.id,
              componentName: comp.componentName,
              quantity: comp.quantity,
              makeOrBuy: comp.makeOrBuy,
              supplier: comp.supplier,
              unitCost: comp.unitCost,
            }))
          });
        }

        // Copy existing operations to new BOM
        if (currentBom.operations.length > 0) {
          await tx.bOMOperation.createMany({
            data: currentBom.operations.map(op => ({
              bomId: newBom.id,
              operationName: op.operationName,
              durationMins: op.durationMins,
              workCenter: op.workCenter,
            }))
          });
        }

        // Apply draft changes to new BOM
        await _applyBomDraftChanges(tx, newBom.id, eco.draftChanges);

        // Archive old BOM
        await tx.bOM.update({
          where: { id: currentBom.id },
          data: { status: "ARCHIVED" },
        });

        // Update product's currentVersion and create new Product Version History
        const currentProductVersion = eco.product.versions.find(
          (v) => v.status === "ACTIVE"
        );
        
        if (!currentProductVersion) {
            throw new Error("No ACTIVE product version found for this product.");
        }

        // New version row
            await tx.productVersion.create({
              data: {
                productId: eco.productId,
                versionNumber: newVersionNumber,
                salePrice: currentProductVersion.salePrice,
                costPrice: currentProductVersion.costPrice,
                attachments: [...currentProductVersion.attachments],
                status: "ACTIVE",
                ecoId: eco.id,
                createdById: eco.userId,
              },
            });
            await tx.productVersion.update({
              where: { id: currentProductVersion.id },
              data: { status: "ARCHIVED" },
            });

        await tx.product.update({
          where: { id: eco.productId },
          data: { currentVersion: newVersionNumber },
        });
      } else {
        // In-place update — apply changes to existing BOM
        await _applyBomDraftChanges(tx, currentBom.id, eco.draftChanges);
      }
    }

    // ─── Product ECO ───────────────────────────────────────────
    if (eco.ecoType === "PRODUCT") {
      const currentVersion = eco.product.versions.find(
        (v) => v.versionNumber === eco.product.currentVersion && v.status === "ACTIVE"
      );

      if (eco.versionUpdate && currentVersion) {
        const newVersionNumber = eco.product.currentVersion + 1;

        // Create new product version
        const newVersion = await tx.productVersion.create({
          data: {
            productId: eco.productId,
            versionNumber: newVersionNumber,
            salePrice: currentVersion.salePrice,
            costPrice: currentVersion.costPrice,
            attachments: [...currentVersion.attachments],
            status: "ACTIVE",
            ecoId: eco.id,
            createdById: eco.userId,
          },
        });

        // Apply draft changes to new version
        const updates = {};
        for (const change of eco.draftChanges) {
          if (change.fieldName === "salePrice") updates.salePrice = Math.max(0, parseFloat(change.newValue));
          if (change.fieldName === "costPrice") updates.costPrice = Math.max(0, parseFloat(change.newValue));
          if (change.fieldName === "attachments") updates.attachments = JSON.parse(change.newValue);
        }
        if (Object.keys(updates).length > 0) {
          await tx.productVersion.update({ where: { id: newVersion.id }, data: updates });
        }

        // Archive old version
        if (currentVersion) {
          await tx.productVersion.update({
            where: { id: currentVersion.id },
            data: { status: "ARCHIVED" },
          });
        }

        // Update product master record
        const productUpdates = { currentVersion: newVersionNumber };
        if (updates.salePrice !== undefined) productUpdates.salePrice = updates.salePrice;
        if (updates.costPrice !== undefined) productUpdates.costPrice = updates.costPrice;
        await tx.product.update({ where: { id: eco.productId }, data: productUpdates });
      } else {
        // In-place update on existing product and version
        const updates = {};
        for (const change of eco.draftChanges) {
          if (change.fieldName === "salePrice") updates.salePrice = Math.max(0, parseFloat(change.newValue));
          if (change.fieldName === "costPrice") updates.costPrice = Math.max(0, parseFloat(change.newValue));
          if (change.fieldName === "attachments") updates.attachments = JSON.parse(change.newValue);
        }
        if (Object.keys(updates).length > 0) {
          await tx.product.update({ where: { id: eco.productId }, data: updates });
          if (currentVersion) {
            await tx.productVersion.update({ where: { id: currentVersion.id }, data: updates });
          }
        }
      }
    }

    // ─── Mark ECO as APPLIED ───────────────────────────────────
    await tx.eCO.update({
      where: { id: ecoId },
      data: {
        status: "APPLIED",
        effectiveDate: eco.effectiveDate || now,
      },
    });

    // ─── Audit Log ─────────────────────────────────────────────
    await tx.auditLog.create({
      data: {
        action: "ECO_APPLIED",
        recordType: "ECO",
        recordId: ecoId,
        newValue: `ECO "${eco.title}" applied successfully`,
        userId: eco.userId,
      },
    });

    logger.info(`ECO ${ecoId} applied successfully`);
    return { success: true, userId: eco.userId, title: eco.title };
  });

  if (result.success) {
    await createNotification(
      result.userId,
      `Your ECO "${result.title}" has been applied successfully.`,
      `/ecos/${ecoId}`
    );
  }
  return { success: true };
};

// Helper: apply BOM draft changes to a specific BOM
async function _applyBomDraftChanges(tx, bomId, draftChanges) {
  const compRemoves = draftChanges.filter(c => c.recordType === "BOM_COMPONENT" && c.fieldName === "REMOVE").map(c => c.recordId);
  if (compRemoves.length > 0) {
    await tx.bOMComponent.deleteMany({ where: { bomId, componentName: { in: compRemoves } } });
  }

  const compAdds = draftChanges.filter(c => c.recordType === "BOM_COMPONENT" && c.fieldName === "ADD").map(c => {
    const raw = JSON.parse(c.newValue);
    return { bomId, componentName: raw.componentName, quantity: raw.quantity, makeOrBuy: raw.makeOrBuy, supplier: raw.supplier, unitCost: raw.unitCost };
  });
  if (compAdds.length > 0) {
    await tx.bOMComponent.createMany({ data: compAdds });
  }

  const compUpdates = draftChanges.filter(c => c.recordType === "BOM_COMPONENT" && c.fieldName === "UPDATE");
  await Promise.all(compUpdates.map(change => {
    const raw = JSON.parse(change.newValue);
    const data = { componentName: raw.componentName, quantity: raw.quantity, makeOrBuy: raw.makeOrBuy, supplier: raw.supplier, unitCost: raw.unitCost };
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    return tx.bOMComponent.updateMany({ where: { bomId, componentName: change.recordId }, data });
  }));

  const opRemoves = draftChanges.filter(c => c.recordType === "BOM_OPERATION" && c.fieldName === "REMOVE").map(c => c.recordId);
  if (opRemoves.length > 0) {
    await tx.bOMOperation.deleteMany({ where: { bomId, operationName: { in: opRemoves } } });
  }

  const opAdds = draftChanges.filter(c => c.recordType === "BOM_OPERATION" && c.fieldName === "ADD").map(c => {
    const raw = JSON.parse(c.newValue);
    return { bomId, operationName: raw.operationName, durationMins: raw.durationMins, workCenter: raw.workCenter };
  });
  if (opAdds.length > 0) {
    await tx.bOMOperation.createMany({ data: opAdds });
  }

  const opUpdates = draftChanges.filter(c => c.recordType === "BOM_OPERATION" && c.fieldName === "UPDATE");
  await Promise.all(opUpdates.map(change => {
    const raw = JSON.parse(change.newValue);
    const data = { operationName: raw.operationName, durationMins: raw.durationMins, workCenter: raw.workCenter };
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    return tx.bOMOperation.updateMany({ where: { bomId, operationName: change.recordId }, data });
  }));
}

module.exports = { applyECO };
