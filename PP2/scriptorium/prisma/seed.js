// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // Create the admin user
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


  // Create synthetic users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        avatar: faker.image.avatar(),
        phone: faker.phone.number(),
        role: "USER", // First user is admin
      },
    });
    users.push(user);
  }
  console.log("Users created.");

  // Create synthetic code templates
  const templates = [];
  for (let i = 0; i < 20; i++) {
    const template = await prisma.codeTemplate.create({
      data: {
        title: faker.lorem.sentence(),
        explanation: faker.lorem.paragraph(),
        tags: faker.lorem.words(3),
        code: `// Example code: ${faker.hacker.phrase()}`,
        language: faker.helpers.arrayElement([
          "Python",
          "JavaScript",
          "Java",
          "C++",
          "C",
        ]),
        userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
      },
    });
    templates.push(template);
  }
  console.log("Code templates created.");

  // Create synthetic blog posts
  const blogs = [];
  for (let i = 0; i < 15; i++) {
    const blog = await prisma.blogPost.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        tag: faker.lorem.word(),
        content: faker.lorem.paragraphs(3),
        userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
        templates: {
          connect: [
            {
              id: templates[
                faker.number.int({ min: 0, max: templates.length - 1 })
              ].id,
            },
          ],
        },
      },
    });
    blogs.push(blog);
  }
  console.log("Blog posts created.");

  // Create synthetic comments
  for (let i = 0; i < 50; i++) {
    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        userId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
        blogPostId: blogs[faker.number.int({ min: 0, max: blogs.length - 1 })].id,
      },
    });
  }
  console.log("Comments created.");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
