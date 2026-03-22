const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const product = await prisma.product.findFirst({
      where: { name: 'VX-500W-SMPS' },
      include: { boms: true }
    });
    
    if (!product) {
      console.log("PRODUCT_NOT_FOUND");
      return;
    }
    
    console.log("PRODUCT_ID:", product.id);
    console.log("BOM_COUNT:", product.boms.length);
    if (product.boms.length > 0) {
      product.boms.forEach(b => console.log(`BOM_ID: ${b.id}, STATUS: ${b.status}, VERSION: ${b.versionNumber}`));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
