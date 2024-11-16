// Importing necessary modules using ES6 syntax
import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail: string | undefined = process.env.ADMIN_EMAIL;
  const adminPassword: string | undefined = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("Admin credentials not set in environment variables.");
    process.exit(1);
  }

  // Ensure BCRYPT_SALT_ROUNDS is defined and convert it safely to a number
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword, // Hashed password used
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