import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// GET /api/employees - Get all employees for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Generate a unique employeeId if not provided
    const employeeData = {
      ...data,
      employeeId: data.employeeId || `EMP-${Date.now()}`,
      userId: session.user.id,
    };

    const employee = await prisma.employee.create({
      data: employeeData,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    
    // Verify the employee belongs to the current user
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingEmployee || existingEmployee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    
    const employee = await prisma.employee.update({
      where: { id },
      data,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}
