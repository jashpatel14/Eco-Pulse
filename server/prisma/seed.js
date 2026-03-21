/**
 * Comprehensive Seed script — inserts Users, Stages, Products, BOMs, and ECOs.
 * Run inside server folder: node prisma/seed.js
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // 1. CLEAR EXISTING DATA (Optional but recommended for a clean demo)
  // Order matters due to FK constraints
  await prisma.eCOApprovalRule.deleteMany();
  await prisma.eCODraftChange.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eCO.deleteMany();
  await prisma.eCOStage.deleteMany();
  await prisma.bOMOperation.deleteMany();
  await prisma.bOMComponent.deleteMany();
  await prisma.bOM.deleteMany();
  await prisma.productVersion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE USERS
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("Pass@123", salt);

  const adminUser = await prisma.user.create({
    data: {
      loginId: 'Admin1',
      name: 'System Admin',
      email: 'admin@ecopulse.com',
      password: hashedPassword,
      role: 'ADMIN',
      is_verified: true
    }
  });

  const engineerUser = await prisma.user.create({
    data: {
      loginId: 'Engineer1',
      name: 'Lead Engineer',
      email: 'engineer@ecopulse.com',
      password: hashedPassword,
      role: 'ENGINEERING_USER',
      is_verified: true
    }
  });

  const approverUser = await prisma.user.create({
    data: {
      loginId: 'Approver1',
      name: 'Quality Approver',
      email: 'approver@ecopulse.com',
      password: hashedPassword,
      role: 'APPROVER',
      is_verified: true
    }
  });

  const opsUser = await prisma.user.create({
    data: {
      loginId: 'Ops1',
      name: 'Operations Staff',
      email: 'ops@ecopulse.com',
      password: hashedPassword,
      role: 'OPERATIONS_USER',
      is_verified: true
    }
  });

  console.log("✅ Users created: Admin1, Engineer1, Approver1, Ops1");

  // 3. CREATE STAGES
  const stageNew = await prisma.eCOStage.create({
    data: { name: "New", orderIndex: 0, approvalRequired: false }
  });

  const stageReview = await prisma.eCOStage.create({
    data: { name: "Review", orderIndex: 1, approvalRequired: true }
  });

  const stageValidate = await prisma.eCOStage.create({
    data: { name: "Validation", orderIndex: 2, approvalRequired: false }
  });

  const stageDone = await prisma.eCOStage.create({
    data: { name: "Done", orderIndex: 999, approvalRequired: false }
  });

  console.log("✅ Stages created: New, Review, Validation, Done");

  // 4. CREATE APPROVAL RULES
  // Assign Approver1 to the Review stage
  await prisma.eCOApprovalRule.create({
    data: {
      stageId: stageReview.id,
      userId: approverUser.id,
      approvalCategory: 'REQUIRED'
    }
  });
  console.log("✅ Approval Rule: Approver1 assigned to 'Review' stage");

  // 5. CREATE PRODUCTS & BOMS
  // Product 1: Industrial Pump X1
  const pump = await prisma.product.create({
    data: {
      name: "Industrial Pump X1",
      salePrice: 15000.00,
      costPrice: 8500.00,
      currentVersion: 1,
      status: 'ACTIVE',
      versions: {
        create: {
          versionNumber: 1,
          salePrice: 15000.00,
          costPrice: 8500.00,
          status: 'ACTIVE'
        }
      }
    }
  });

  const pumpBom = await prisma.bOM.create({
    data: {
      reference: "BOM-001",
      productId: pump.id,
      versionNumber: 1,
      status: 'ACTIVE',
      components: {
        create: [
          { componentName: "AC Motor 5HP", quantity: 1, makeOrBuy: 'BUY', supplier: "Global Motors", unitCost: 4200.00 },
          { componentName: "Stainless Impeller", quantity: 1, makeOrBuy: 'MAKE', unitCost: 1500.00 },
          { componentName: "Cast Iron Housing", quantity: 1, makeOrBuy: 'BUY', supplier: "MetalCast Inc", unitCost: 2800.00 }
        ]
      },
      operations: {
        create: [
          { operationName: "Motor Mounting", durationMins: 45, workCenter: "Assembly Line A" },
          { operationName: "Hydraulic Testing", durationMins: 30, workCenter: "QC Lab" }
        ]
      }
    }
  });

  // Product 2: High-Torque Valve
  const valve = await prisma.product.create({
    data: {
      name: "High-Torque Valve SE",
      salePrice: 4500.00,
      costPrice: 1200.00,
      currentVersion: 2,
      status: 'ACTIVE',
      versions: {
        create: [
          { versionNumber: 1, salePrice: 4000.00, costPrice: 1000.00, status: 'ARCHIVED' },
          { versionNumber: 2, salePrice: 4500.00, costPrice: 1200.00, status: 'ACTIVE' }
        ]
      }
    }
  });

  console.log("✅ Products & BOMs created: Industrial Pump X1, High-Torque Valve SE");

  // 6. CREATE ECOS
  // ECO 1: In Review (Engineer1 created it, Approver1 needs to review)
  await prisma.eCO.create({
    data: {
      title: "Impeller Material Change - Grade 316",
      ecoType: 'BOM',
      productId: pump.id,
      bomId: pumpBom.id,
      userId: engineerUser.id,
      changeReason: 'QUALITY_ISSUE',
      riskLevel: 'MEDIUM',
      status: 'IN_REVIEW',
      stageId: stageReview.id,
      draftChanges: {
        create: [
          { fieldName: 'componentName', recordType: 'BOM_COMPONENT', recordId: 'N/A', oldValue: 'Stainless Impeller', newValue: 'Impeller Grade 316' },
          { fieldName: 'unitCost', recordType: 'BOM_COMPONENT', recordId: 'N/A', oldValue: '1500.00', newValue: '1850.00' }
        ]
      }
    }
  });

  // ECO 2: Draft (Admin created it)
  await prisma.eCO.create({
    data: {
      title: "Annual Price Adjustment 2024",
      ecoType: 'PRODUCT',
      productId: valve.id,
      userId: adminUser.id,
      changeReason: 'DESIGN_UPDATE',
      riskLevel: 'LOW',
      status: 'DRAFT',
      stageId: stageNew.id,
      draftChanges: {
        create: [
          { fieldName: 'salePrice', recordType: 'PRODUCT', recordId: valve.id, oldValue: '4500.00', newValue: '4800.00' }
        ]
      }
    }
  });

  // ECO 3: Applied (History)
  await prisma.eCO.create({
    data: {
      title: "Initial Release - Valve SE",
      ecoType: 'PRODUCT',
      productId: valve.id,
      userId: adminUser.id,
      changeReason: 'DESIGN_UPDATE',
      riskLevel: 'LOW',
      status: 'APPLIED',
      stageId: stageDone.id
    }
  });

  console.log("✅ ECOs created: 1 In-Review, 1 Draft, 1 Applied");
  console.log("🚀 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
