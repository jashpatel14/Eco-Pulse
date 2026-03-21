/**
 * Seed script — inserts default ECO stages (New + Done).
 * Run: node prisma/seed.js
 */
const prisma = require("../config/prisma");

async function main() {
  const existing = await prisma.eCOStage.findMany();
  if (existing.length > 0) {
    console.log("Stages already seeded — skipping.");
    return;
  }

  await prisma.eCOStage.createMany({
    data: [
      { name: "New",  orderIndex: 0, approvalRequired: false },
      { name: "Done", orderIndex: 999, approvalRequired: false },
    ],
  });
  console.log("✅ Default ECO stages seeded: New, Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
