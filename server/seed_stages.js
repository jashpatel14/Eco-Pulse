const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default ECO stages...');

  const stages = [
    { name: 'Draft', orderIndex: 1, approvalRequired: false },
    { name: 'Engineering Review', orderIndex: 2, approvalRequired: true },
    { name: 'Operations Review', orderIndex: 3, approvalRequired: true },
    { name: 'Final Approval', orderIndex: 4, approvalRequired: true },
    { name: 'Done', orderIndex: 5, approvalRequired: false },
  ];

  for (const stage of stages) {
    await prisma.eCOStage.upsert({
      where: { id: '00000000-0000-0000-0000-00000000000' + stage.orderIndex }, // Static IDs for consistency if needed, but uuid is fine
      create: stage,
      update: stage,
    });
    console.log(`Seeded stage: ${stage.name}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
