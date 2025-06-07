import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Define the user type
type User = {
  id: string;
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Session = {
  user?: User | null;
};

export async function GET(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    if (!monthParam) {
      return NextResponse.json(
        { success: false, error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const month = new Date(monthParam);
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get all employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        employeeId: true,
        basicSalary: true,
      },
    });

    // Get existing salaries for the month
    const existingSalaries = await prisma.salary.findMany({
      where: {
        month: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    // Create a map of employeeId to existing salary
    const salaryMap = new Map(
      existingSalaries.map(salary => [salary.employeeId, salary])
    );

    // Create or update salary records for all employees
    const results = await Promise.all(
      employees.map(async (employee) => {
        const existingSalary = salaryMap.get(employee.id);
        
        if (existingSalary) {
          return {
            ...existingSalary,
            employee: {
              id: employee.id,
              name: employee.name,
              employeeId: employee.employeeId,
            },
          };
        }

        // Create a new salary record with default values
        const newSalary = await prisma.salary.create({
          data: {
            employeeId: employee.id,
            month: startOfMonth,
            basicSalary: employee.basicSalary,
            bonus: 0,
            deductions: 0,
            payableAmount: employee.basicSalary,
          },
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                employeeId: true,
              },
            },
          },
        });
        
        return newSalary;
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch salaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = session?.user;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { employeeId, month, bonus, deductions } = body;

    if (!employeeId || !month) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and month are required' },
        { status: 400 }
      );
    }

    // Get the employee's basic salary
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { basicSalary: true },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const monthDate = new Date(month);
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    // Find existing salary record or create a new one
    let salary = await prisma.salary.findFirst({
      where: {
        employeeId,
        month: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const basicSalary = salary?.basicSalary || employee.basicSalary;
    const newBonus = typeof bonus === 'number' ? bonus : (salary?.bonus || 0);
    const newDeductions = typeof deductions === 'number' ? deductions : (salary?.deductions || 0);
    const payableAmount = basicSalary + newBonus - newDeductions;

    const salaryData = {
      employeeId,
      month: startOfMonth,
      basicSalary,
      bonus: newBonus,
      deductions: newDeductions,
      payableAmount,
    };

    if (salary) {
      // Update existing salary
      salary = await prisma.salary.update({
        where: { id: salary.id },
        data: salaryData,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      });
    } else {
      // Create new salary
      salary = await prisma.salary.create({
        data: salaryData,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update salary' },
      { status: 500 }
    );
  }
}
