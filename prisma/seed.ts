import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create departments
  const hrDept = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Handles all HR related activities'
    },
  });

  const itDept = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: {
      name: 'Information Technology',
      description: 'Manages all IT infrastructure and development'
    },
  });

  const financeDept = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: {
      name: 'Finance',
      description: 'Manages company finances and accounting'
    },
  });

  // Create a test user
  const hashedPassword = await hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create sample employees
  const employees = [
    {
      employeeId: 'EMP001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      position: 'HR Manager',
      joiningDate: new Date('2022-01-15'),
      basicSalary: 75000,
      departmentId: hrDept.id,
      userId: user.id,
    },
    {
      employeeId: 'EMP002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      position: 'Senior Developer',
      joiningDate: new Date('2021-11-10'),
      basicSalary: 95000,
      departmentId: itDept.id,
      userId: user.id,
    },
    {
      employeeId: 'EMP003',
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      position: 'Financial Analyst',
      joiningDate: new Date('2023-03-22'),
      basicSalary: 82000,
      departmentId: financeDept.id,
      userId: user.id,
    },
    {
      employeeId: 'EMP004',
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      position: 'UI/UX Designer',
      joiningDate: new Date('2022-09-05'),
      basicSalary: 78000,
      departmentId: itDept.id,
      userId: user.id,
    },
    {
      employeeId: 'EMP005',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      position: 'Recruiter',
      joiningDate: new Date('2023-01-30'),
      basicSalary: 68000,
      departmentId: hrDept.id,
      userId: user.id,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { employeeId: employee.employeeId },
      update: {},
      create: employee,
    });
  }

  console.log('Database has been seeded with sample data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
