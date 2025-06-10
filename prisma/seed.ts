import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current file's directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Create default AI providers
  const defaultProviders = [
    {
      name: 'openai',
      displayName: 'OpenAI',
      apiKeyName: 'OPENAI_API_KEY',
      baseUrl: 'https://api.openai.com/v1',
      isDefault: true,
    },
    {
      name: 'google',
      displayName: 'Google Gemini',
      apiKeyName: 'GOOGLE_API_KEY',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },
    {
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      apiKeyName: 'ANTHROPIC_API_KEY',
      baseUrl: 'https://api.anthropic.com/v1',
    },
    {
      name: 'alibaba',
      displayName: 'Alibaba Qwen',
      apiKeyName: 'ALIBABA_API_KEY',
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    },
    {
      name: 'deepseek',
      displayName: 'Deepseek',
      apiKeyName: 'DEEPSEEK_API_KEY',
      baseUrl: 'https://api.deepseek.com/v1',
    },
  ];

  for (const provider of defaultProviders) {
    await prisma.aIProvider.upsert({
      where: { name: provider.name },
      update: {},
      create: {
        name: provider.name,
        displayName: provider.displayName,
        apiKeyName: provider.apiKeyName,
        baseUrl: provider.baseUrl,
        isDefault: provider.isDefault || false,
      },
    });
  }

  // Create default config for admin user with OpenAI
  const openaiProvider = await prisma.aIProvider.findUnique({
    where: { name: 'openai' },
  });

  if (openaiProvider) {
    await prisma.aIProviderConfig.upsert({
      where: {
        providerId_userId_modelName: {
          providerId: openaiProvider.id,
          userId: user.id,
          modelName: 'gpt-4o',
        },
      },
      update: {},
      create: {
        providerId: openaiProvider.id,
        userId: user.id,
        apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
        modelName: 'gpt-4o',
        isDefault: true,
      },
    });
  }

  console.log('Database has been seeded with sample data and AI providers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
