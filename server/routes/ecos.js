const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleGuard");
const { createNotification } = require("../services/notificationService");
const { applyECO } = require("../services/ecoApplyService");
const logger = require("../utils/logger");

const ECO_WRITE_ROLES = ["ENGINEERING_USER", "ADMIN"];
const crypto = require("crypto");

async function generateEcoReference() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const ECO_INCLUDE = {
  product: { select: { id: true, name: true, currentVersion: true } },
  bom: { select: { id: true, reference: true, versionNumber: true } },
  user: { select: { id: true, name: true, email: true } },
  stage: { include: { approval_rules: { include: { user: { select: { id: true, name: true } } } } } },
  draftChanges: true,
};

// GET /api/v1/ecos
router.get("/", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"), async (req, res) => {
  try {
    const { status, ecoType, riskLevel, changeReason, userId, search, take = 50, skip = 0 } = req.query;
    const isOpsUser = req.user.role === "OPERATIONS_USER";

    const where = {};
    if (isOpsUser) {
      where.status = { notIn: ["DRAFT", "ARCHIVED"] };
    } else if (status) {
      where.status = status;
    }
    if (ecoType) where.ecoType = ecoType;
    if (riskLevel) where.riskLevel = riskLevel;
    if (changeReason) where.changeReason = changeReason;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const ecos = await prisma.eCO.findMany({
      where,
      take: parseInt(take),
      skip: parseInt(skip),
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json(ecos);
  } catch (err) {
    logger.error("GET /ecos error:", err);
    res.status(500).json({ message: "Failed to fetch ECOs." });
  }
});

// POST /api/v1/ecos
router.post("/", authMiddleware, requireRole(...ECO_WRITE_ROLES), async (req, res) => {
  try {
    const { title, ecoType, productId, bomId, effectiveDate, changeReason, riskLevel, priority, versionUpdate = true, attachments = [] } = req.body;
    if (!title || !ecoType || !productId || !changeReason || !riskLevel) {
      return res.status(400).json({ message: "title, ecoType, productId, changeReason, and riskLevel are required." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status === "ARCHIVED") {
      return res.status(403).json({ message: "Cannot raise ECO for an archived product." });
    }

    const newStage = await prisma.eCOStage.findFirst({ orderBy: { orderIndex: "asc" } });
    if (!newStage) return res.status(500).json({ message: "No ECO stages configured." });

    const eco = await prisma.$transaction(async (tx) => {
      const ref = await generateEcoReference();
      const createdEco = await tx.eCO.create({
        data: {
          reference: ref,
          title,
          ecoType,
          productId,
          bomId: bomId || null,
          userId: req.user.id,
          effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
          versionUpdate,
          stageId: newStage.id,
          changeReason,
          riskLevel,
          priority: priority || "MEDIUM",
          attachments: attachments || [],
          status: "DRAFT",
        },
        include: ECO_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          action: "ECO_CREATED",
          recordType: "ECO",
          recordId: createdEco.id,
          newValue: JSON.stringify({ title, ecoType, productId }),
          userId: req.user.id,
        },
      });

      return createdEco;
    });

    res.status(201).json(eco);
  } catch (err) {
    logger.error("POST /ecos error:", err);
    res.status(500).json({ message: "Failed to create ECO." });
  }
});

// PATCH /api/v1/ecos/:id — Update main details (only in DRAFT)
router.patch("/:id", authMiddleware, requireRole(...ECO_WRITE_ROLES), async (req, res) => {
  try {
    const { title, effectiveDate, changeReason, riskLevel, priority, versionUpdate, attachments } = req.body;
    const eco = await prisma.eCO.findUnique({ where: { id: req.params.id } });

    if (!eco) return res.status(404).json({ message: "ECO not found." });
    if (eco.status !== "DRAFT") {
      return res.status(400).json({ message: "Cannot edit ECO details once it has started." });
    }
    if (eco.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only the creator or an admin can edit this ECO." });
    }

    const updated = await prisma.eCO.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        changeReason: changeReason || undefined,
        riskLevel: riskLevel || undefined,
        priority: priority || undefined,
        versionUpdate: versionUpdate !== undefined ? versionUpdate : undefined,
        attachments: attachments || undefined,
      },
      include: ECO_INCLUDE,
    });

    await prisma.auditLog.create({
      data: {
        action: "ECO_UPDATED",
        recordType: "ECO",
        recordId: eco.id,
        newValue: JSON.stringify(req.body),
        userId: req.user.id,
      },
    });

    res.json(updated);
  } catch (err) {
    logger.error("PATCH /ecos/:id error:", err);
    res.status(500).json({ message: "Failed to update ECO." });
  }
});

// GET /api/v1/ecos/:id
router.get("/:id", authMiddleware, requireRole("ENGINEERING_USER", "APPROVER", "OPERATIONS_USER", "ADMIN"), async (req, res) => {
  try {
    const eco = await prisma.eCO.findUnique({
      where: { id: req.params.id },
      include: ECO_INCLUDE,
    });
    if (!eco) return res.status(404).json({ message: "ECO not found." });

    const isOpsUser = req.user.role === "OPERATIONS_USER";
    if (isOpsUser && eco.status === "DRAFT") {
      return res.status(403).json({ message: "This record is not yet approved." });
    }

    // Fetch audit logs for this ECO
    const auditLogs = await prisma.auditLog.findMany({
      where: { recordType: "ECO", recordId: eco.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { timestamp: "desc" },
    });

    res.json({ ...eco, auditLogs });
  } catch (err) {
    logger.error("GET /ecos/:id error:", err);
    res.status(500).json({ message: "Failed to fetch ECO." });
  }
});

// PATCH /api/v1/ecos/:id/start  — lock fields and move to IN_REVIEW
router.patch("/:id/start", authMiddleware, requireRole("ENGINEERING_USER", "ADMIN"), async (req, res) => {
  try {
    const eco = await prisma.eCO.findUnique({
      where: { id: req.params.id },
      include: { stage: true },
    });
    if (!eco) return res.status(404).json({ message: "ECO not found." });
    if (eco.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only the creator can start this ECO." });
    }
    if (eco.status !== "DRAFT") {
      return res.status(400).json({ message: "Only DRAFT ECOs can be started." });
    }

    // Get all stages in order
    const stages = await prisma.eCOStage.findMany({ orderBy: { orderIndex: "asc" } });
    const newStage = stages[0];
    const nextStage = stages.length > 1 ? stages[1] : stages[0];

    const updated = await prisma.$transaction(async (tx) => {
      const e = await tx.eCO.update({
        where: { id: req.params.id },
        data: { status: "IN_REVIEW", stageId: nextStage.id },
        include: ECO_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          action: "ECO_STARTED",
          recordType: "ECO",
          recordId: e.id,
          newValue: `ECO moved to stage: ${nextStage.name}`,
          userId: req.user.id,
        },
      });
      return e;
    });

    // Notify approvers if stage requires approval
    if (nextStage.approvalRequired) {
      const rules = await prisma.eCOApprovalRule.findMany({
        where: { stageId: nextStage.id },
        include: { user: { select: { id: true } } },
      });
      await Promise.all(rules.map(rule => 
        createNotification(
          rule.user.id,
          `ECO "${eco.title}" requires your approval in stage "${nextStage.name}".`,
          `/ecos/${eco.id}`
        )
      ));
    }

    res.json(updated);
  } catch (err) {
    logger.error("PATCH /ecos/:id/start error:", err);
    res.status(500).json({ message: "Failed to start ECO." });
  }
});

// POST /api/v1/ecos/:id/approve
router.post("/:id/approve", authMiddleware, requireRole("APPROVER", "ADMIN"), async (req, res) => {
  try {
    const eco = await prisma.eCO.findUnique({
      where: { id: req.params.id },
      include: { stage: { include: { approval_rules: true } }, user: { select: { id: true } } },
    });
    if (!eco) return res.status(404).json({ message: "ECO not found." });
    if (eco.status !== "IN_REVIEW") return res.status(400).json({ message: "ECO is not in review." });

    // Check if user is designated approver for this stage
    const isApprover = eco.stage.approval_rules.some((r) => r.userId === req.user.id);
    if (!isApprover && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "You are not the designated approver for this stage." });
    }

    const stages = await prisma.eCOStage.findMany({ orderBy: { orderIndex: "asc" } });
    const currentIdx = stages.findIndex((s) => s.id === eco.stageId);
    const nextStage = stages[currentIdx + 1];

    // Log the individual approval
    await prisma.auditLog.create({
      data: {
        action: "ECO_APPROVED_BY_USER",
        recordType: "ECO",
        recordId: eco.id,
        newValue: `Approved stage: ${eco.stage.name}`,
        userId: req.user.id,
      },
    });

    // Check consensus
    const requiredApprovers = eco.stage.approval_rules.length;
    const approvals = await prisma.auditLog.count({
      where: {
        recordType: "ECO",
        recordId: eco.id,
        action: "ECO_APPROVED_BY_USER",
        newValue: `Approved stage: ${eco.stage.name}`,
      },
    });

    if (approvals < requiredApprovers) {
      return res.json({ ...eco, status: "IN_REVIEW", message: `Approval recorded. Waiting for ${requiredApprovers - approvals} more approvers.` });
    }

    if (!nextStage || nextStage.name === "Done") {
      // Final stage — apply ECO
      await applyECO(eco.id);
      const applied = await prisma.eCO.findUnique({ where: { id: eco.id }, include: ECO_INCLUDE });
      return res.json(applied);
    }

    // Advance to next stage
    const updated = await prisma.eCO.update({
      where: { id: eco.id },
      data: {
        status: nextStage.name === "Done" ? "APPROVED" : "IN_REVIEW",
        stageId: nextStage.id,
      },
      include: ECO_INCLUDE,
    });

    await prisma.auditLog.create({
      data: {
        action: "ECO_STAGE_ADVANCED",
        recordType: "ECO",
        recordId: eco.id,
        oldValue: eco.stage.name,
        newValue: nextStage.name,
        userId: req.user.id,
      },
    });

    await createNotification(eco.userId, `Your ECO "${eco.title}" has been approved and moved to "${nextStage.name}".`, `/ecos/${eco.id}`);

    // Notify next stage approvers
    if (nextStage.approvalRequired) {
      const rules = await prisma.eCOApprovalRule.findMany({
        where: { stageId: nextStage.id },
      });
      await Promise.all(rules.map(rule => 
        createNotification(rule.userId, `ECO "${eco.title}" requires your approval in stage "${nextStage.name}".`, `/ecos/${eco.id}`)
      ));
    }


    res.json(updated);
  } catch (err) {
    logger.error("POST /ecos/:id/approve error:", err);
    res.status(500).json({ message: "Failed to approve ECO: " + err.message });
  }
});

// POST /api/v1/ecos/:id/reject
router.post("/:id/reject", authMiddleware, requireRole("APPROVER", "ADMIN"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 20) {
      return res.status(400).json({ message: "Rejection reason must be at least 20 characters." });
    }

    const eco = await prisma.eCO.findUnique({
      where: { id: req.params.id },
      include: { stage: { include: { approval_rules: true } }, user: { select: { id: true } } },
    });
    if (!eco) return res.status(404).json({ message: "ECO not found." });

    const isApprover = eco.stage.approval_rules.some((r) => r.userId === req.user.id);
    if (!isApprover && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "You are not the designated approver for this stage." });
    }

    const stages = await prisma.eCOStage.findMany({ orderBy: { orderIndex: "asc" } });
    const firstStage = stages[0];

    await prisma.$transaction(async (tx) => {
      await tx.eCO.update({
        where: { id: eco.id },
        data: { status: "DRAFT", stageId: firstStage.id },
      });

      await tx.auditLog.create({
        data: {
          action: "ECO_REJECTED",
          recordType: "ECO",
          recordId: eco.id,
          newValue: reason,
          userId: req.user.id,
        },
      });
    });

    await createNotification(
      eco.userId,
      `Your ECO "${eco.title}" was rejected. Reason: ${reason}`,
      `/ecos/${eco.id}`
    );

    const updated = await prisma.eCO.findUnique({ where: { id: eco.id }, include: ECO_INCLUDE });
    res.json(updated);
  } catch (err) {
    logger.error("POST /ecos/:id/reject error:", err);
    res.status(500).json({ message: "Failed to reject ECO." });
  }
});

// POST /api/v1/ecos/:id/validate (no-approval-required stages)
router.post("/:id/validate", authMiddleware, requireRole("ENGINEERING_USER", "ADMIN"), async (req, res) => {
  try {
    const eco = await prisma.eCO.findUnique({
      where: { id: req.params.id },
      include: { stage: true, user: { select: { id: true } } },
    });
    if (!eco) return res.status(404).json({ message: "ECO not found." });
    if (eco.stage.approvalRequired) {
      return res.status(403).json({ message: "This stage requires designated approver approval." });
    }

    const stages = await prisma.eCOStage.findMany({ orderBy: { orderIndex: "asc" } });
    const currentIdx = stages.findIndex((s) => s.id === eco.stageId);
    const nextStage = stages[currentIdx + 1];

    if (!nextStage || nextStage.name === "Done") {
      await applyECO(eco.id);
      const applied = await prisma.eCO.findUnique({ where: { id: eco.id }, include: ECO_INCLUDE });
      return res.json(applied);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const e = await tx.eCO.update({
        where: { id: eco.id },
        data: { stageId: nextStage.id },
        include: ECO_INCLUDE,
      });

      await tx.auditLog.create({
        data: {
          action: "ECO_VALIDATED",
          recordType: "ECO",
          recordId: e.id,
          oldValue: eco.stage.name,
          newValue: nextStage.name,
          userId: req.user.id,
        },
      });
      
      return e;
    });

    await createNotification(eco.userId, `Your ECO "${eco.title}" has been validated and moved to "${nextStage.name}".`, `/ecos/${eco.id}`);
    res.json(updated);
  } catch (err) {
    logger.error("POST /ecos/:id/validate error:", err);
    res.status(500).json({ message: "Failed to validate ECO." });
  }
});

// PATCH /api/v1/ecos/:id/changes — save draft changes
router.patch("/:id/changes", authMiddleware, requireRole("ENGINEERING_USER", "ADMIN"), async (req, res) => {
  try {
    const { changes } = req.body; // Array of { fieldName, recordType, recordId, oldValue, newValue }
    const eco = await prisma.eCO.findUnique({ where: { id: req.params.id } });
    if (!eco) return res.status(404).json({ message: "ECO not found." });
    if (eco.status !== "DRAFT") return res.status(400).json({ message: "Cannot modify a non-DRAFT ECO." });
    if (eco.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only the creator or an admin can edit this ECO's drafts." });
    }

    // Delete old draft changes and replace
    await prisma.$transaction([
      prisma.eCODraftChange.deleteMany({ where: { ecoId: eco.id } }),
      ...(changes && changes.length > 0 ? [
        prisma.eCODraftChange.createMany({
          data: changes.map((c) => ({ ...c, ecoId: eco.id })),
        })
      ] : [])
    ]);
    const updatedChanges = await prisma.eCODraftChange.findMany({ where: { ecoId: eco.id } });
    res.json(updatedChanges);
  } catch (err) {
    logger.error("PATCH /ecos/:id/changes error:", err);
    res.status(500).json({ message: "Failed to save draft changes." });
  }
});

module.exports = router;
