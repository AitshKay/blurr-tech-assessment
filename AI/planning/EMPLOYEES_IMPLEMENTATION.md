# Employees Implementation

## Overview
This document outlines the implementation of the Employees section, including employee management and salary calculation features.

## Technical Decisions

### 1. Database Schema (Prisma)
```prisma
model Employee {
  id           String     @id @default(cuid())
  employeeId   String     @unique @map("employee_id")
  name         String
  joiningDate  DateTime   @map("joining_date")
  basicSalary  Decimal    @map("basic_salary")
  userId      String     @unique
  user        User       @relation(fields: [userId], references: [id])
  salaryRecords SalaryRecord[]
  tasks        Task[]
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  @@map("employees")
}

model SalaryRecord {
  id          String   @id @default(cuid())
  employeeId  String   @map("employee_id")
  employee    Employee @relation(fields: [employeeId], references: [id])
  month       Int
  year        Int
  basicSalary Decimal  @map("basic_salary")
  bonuses     Decimal  @default(0)
  deductions Decimal  @default(0)
  netSalary  Decimal  @map("net_salary")
  status     String   @default('pending') // pending, paid
  bonusDeductions BonusDeduction[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")


  @@unique([employeeId, month, year])
  @@map("salary_records")
}

model BonusDeduction {
  id             String       @id @default(cuid())
  salaryRecordId String      @map("salary_record_id")
  salaryRecord   SalaryRecord @relation(fields: [salaryRecordId], references: [id])
  type           String      // 'bonus' or 'deduction'
  amount        Decimal
  description   String
  date          DateTime    @default(now())
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")


  @@map("bonus_deductions")
}
```

### 2. Key Features

#### 2.1 Employee Management
- List all employees with pagination
- Add new employee with validation
- Edit employee details
- View employee details and history

#### 2.2 Salary Management
- Monthly salary calculation
- Add bonuses/deductions
- Generate salary slips
- Salary history and reports

### 3. Implementation Details

#### 3.1 API Endpoints
```typescript
// Employee endpoints
GET    /api/employees          // List employees
POST   /api/employees          // Create employee
GET    /api/employees/:id      // Get employee details
PUT    /api/employees/:id      // Update employee
DELETE /api/employees/:id      // Delete employee

// Salary endpoints
GET    /api/salaries          // List salary records
POST   /api/salaries/generate // Generate salary for month
GET    /api/salaries/:id      // Get salary details
PUT    /api/salaries/:id      // Update salary record
POST   /api/salaries/:id/bonus-deduction // Add bonus/deduction
```

#### 3.2 Salary Calculation Logic
```typescript
async function calculateSalary(employeeId: string, month: number, year: number) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      salaryRecords: {
        where: { month, year },
        include: { bonusDeductions: true }
      }
    }
  });

  if (!employee) throw new Error('Employee not found');

  let salaryRecord = employee.salaryRecords[0];
  
  if (!salaryRecord) {
    salaryRecord = await prisma.salaryRecord.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary: employee.basicSalary,
        bonuses: 0,
        deductions: 0,
        netSalary: employee.basicSalary,
        status: 'pending'
      }
    });
  }

  // Calculate total bonuses and deductions
  const bonusDeductions = await prisma.bonusDeduction.findMany({
    where: { salaryRecordId: salaryRecord.id }
  });

  const totalBonus = bonusDeductions
    .filter(bd => bd.type === 'bonus')
    .reduce((sum, bd) => sum.plus(bd.amount), new Decimal(0));

  const totalDeduction = bonusDeductions
    .filter(bd => bd.type === 'deduction')
    .reduce((sum, bd) => sum.plus(bd.amount), new Decimal(0));

  const netSalary = new Decimal(employee.basicSalary)
    .plus(totalBonus)
    .minus(totalDeduction);

  // Update salary record
  return prisma.salaryRecord.update({
    where: { id: salaryRecord.id },
    data: {
      bonuses: totalBonus,
      deductions: totalDeduction,
      netSalary
    },
    include: { bonusDeductions: true }
  });
}
```

### 4. UI Components

#### 4.1 Employee List
- Data table with sorting and filtering
- Search functionality
- Pagination
- Action buttons (View, Edit, Delete)

#### 4.2 Employee Form
- Form with validation
- Input fields for all employee details
- Error handling

#### 4.3 Salary Calculator
- Month/Year picker
- Salary breakdown
- Add bonus/deduction form
- Print/export options

### 5. Testing Strategy
- Unit tests for salary calculation
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test edge cases (negative salaries, large bonuses, etc.)

### 6. Security Considerations
- Role-based access control
- Input validation
- Audit logging for sensitive operations
- Data validation at all layers

## Next Steps
1. Implement employee CRUD operations
2. Build salary calculation service
3. Create UI components
4. Add error handling and loading states
5. Write tests

---
*This document will be updated as we implement the Employees section.*
