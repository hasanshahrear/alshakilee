import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Employee Types
  const employeeTypes = await Promise.all([
    prisma.employeeType.upsert({
      where: { name: 'Designer' },
      update: {},
      create: { name: 'Designer' },
    }),
    prisma.employeeType.upsert({
      where: { name: 'Tailor' },
      update: {},
      create: { name: 'Tailor' },
    }),
    prisma.employeeType.upsert({
      where: { name: 'Quality Checker' },
      update: {},
      create: { name: 'Quality Checker' },
    }),
    prisma.employeeType.upsert({
      where: { name: 'Manager' },
      update: {},
      create: { name: 'Manager' },
    }),
    prisma.employeeType.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    }),
  ]);

  console.log('✅ Employee types created:', employeeTypes);

  // Create a sample employee in APPROVED status (for testing)
  const sampleEmployee = await prisma.employee.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      employeeTypeId: 5, // Admin type
      status: 'APPROVED',
      isActive: true,
      approvedBy: 'System',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Sample admin employee created:', sampleEmployee);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
