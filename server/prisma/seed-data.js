const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock data for dashboard...");

  // 1. Create a dummy admin user if not exists
  let admin = await prisma.user.findFirst({ where: { email: "admin@company.com" } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    admin = await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@company.com",
        password: hashedPassword,
        role: "ADMIN",
        is_verified: true,
      },
    });
  }

  // 2. Create products
  const p1 = await prisma.product.upsert({
    where: { name: "Solar Circuit Board V1" },
    update: {},
    create: {
      name: "Solar Circuit Board V1",
      salePrice: 150.0,
      costPrice: 85.0,
      attachments: ["schematic.pdf"],
      status: "ACTIVE",
    },
  });

  const p2 = await prisma.product.upsert({
    where: { name: "Eco Battery Pack" },
    update: {},
    create: {
      name: "Eco Battery Pack",
      salePrice: 320.0,
      costPrice: 210.0,
      attachments: [],
      status: "ACTIVE",
    },
  });

  // 3. Create BOMs
  const bom1 = await prisma.bOM.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" }, // Using a fixed ID to avoid recreating
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      reference: "BOM-001",
      productId: p1.id,
      components: {
        create: [
          { componentName: "Resistor 10k", quantity: 50, makeOrBuy: "BUY", unitCost: 0.05 },
          { componentName: "Capacitor 100uF", quantity: 20, makeOrBuy: "BUY", unitCost: 0.15 },
        ],
      },
      operations: {
        create: [
          { operationName: "SMD Assembly", durationMins: 45, workCenter: "Assembly Line 1" },
        ],
      },
    },
  });

  // 4. Create an ECO
  const stageNew = await prisma.eCOStage.findFirst({ where: { name: "New" } });
  if (stageNew) {
    const eco1 = await prisma.eCO.findFirst({ where: { title: "Update Resistors for Solar Board" } });
    if (!eco1) {
      await prisma.eCO.create({
        data: {
          title: "Update Resistors for Solar Board",
          ecoType: "BOM",
          productId: p1.id,
          bomId: bom1.id,
          userId: admin.id,
          stageId: stageNew.id,
          changeReason: "COST_REDUCTION",
          riskLevel: "LOW",
          status: "DRAFT",
          draftChanges: {
            create: [
              {
                fieldName: "UPDATE",
                recordType: "BOM_COMPONENT",
                recordId: "Resistor 10k",
                oldValue: JSON.stringify({ quantity: 50 }),
                newValue: JSON.stringify({ quantity: 45 }),
              },
            ],
          },
        },
      });
    }
  }

  console.log("Mock data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
