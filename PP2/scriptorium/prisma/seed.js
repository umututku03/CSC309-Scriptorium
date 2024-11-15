// prisma/seed.js
const bcrypt = require("bcrypt");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("Admin credentials not set in environment variables.");
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(adminPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword, // Hash this in production
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created with email: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
