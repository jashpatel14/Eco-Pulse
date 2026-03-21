const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash("Pass@123", salt);

  const testUsers = [
    { loginId: 'eng_user', email: 'engineering_user@test.com', name: 'Engineering User', role: 'ENGINEERING_USER' },
    { loginId: 'app_user', email: 'approver@test.com', name: 'Approver User', role: 'APPROVER' },
    { loginId: 'ops_user', email: 'ops@test.com', name: 'Operations User', role: 'OPERATIONS_USER' },
    { loginId: 'admin_user', email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' },
  ];

  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { loginId: u.loginId },
      update: { role: u.role, password },
      create: { ...u, password, is_verified: true }
    });
    console.log(`User ${u.loginId} synced.`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
