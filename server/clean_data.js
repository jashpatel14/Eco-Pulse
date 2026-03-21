const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database cleanup (preserving users)...');

  try {
    // 1. Delete dependent leaf nodes
    console.log('Cleaning AuditLogs, Notifications, DraftChanges...');
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.eCODraftChange.deleteMany({});
    await prisma.bOMOperation.deleteMany({});
    await prisma.bOMComponent.deleteMany({});
    await prisma.eCOApprovalRule.deleteMany({});

    // 2. Break circular dependencies if any (none required here due to optional relations)
    // Actually ECO -> BOM and BOM -> ECO are both optional ecoId/bomId
    
    // 3. Delete ECOs
    console.log('Cleaning ECOs...');
    await prisma.eCO.deleteMany({});

    // 4. Delete BOMs and ProductVersions
    console.log('Cleaning BOMs and ProductVersions...');
    await prisma.bOM.deleteMany({});
    await prisma.productVersion.deleteMany({});

    // 5. Delete Products and ECOStages
    console.log('Cleaning Products and ECOStages...');
    await prisma.product.deleteMany({});
    await prisma.eCOStage.deleteMany({});

    console.log('Database cleanup completed successfully.');
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
