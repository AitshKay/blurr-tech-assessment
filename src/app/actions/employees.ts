"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  joiningDate: z.date({
    required_error: 'Joining date is required',
  }),
  basicSalary: z.number().min(0, 'Basic salary must be a positive number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

export async function createEmployee(data: EmployeeInput) {
  try {
    // Validate input
    const validatedData = employeeSchema.parse(data);
    
    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: validatedData.employeeId },
    });
    
    if (existingEmployee) {
      return { success: false, error: 'Employee with this ID already exists' };
    }

    // Get the first user from the database to associate with the employee
    // In a real app, you'd get this from the session
    const user = await prisma.user.findFirst();
    
    if (!user) {
      throw new Error('No users found in the database. Please create a user first.');
    }
    
    const userId = user.id;

    // Create the employee with only the fields defined in the schema
    const employee = await prisma.employee.create({
      data: {
        employeeId: validatedData.employeeId,
        name: validatedData.name,
        joiningDate: validatedData.joiningDate,
        basicSalary: validatedData.basicSalary,
        userId,
      },
    });

    revalidatePath('/dashboard/employees');
    return { success: true, data: employee };
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') 
      };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create employee' 
    };
  }
}

export async function updateEmployee(id: string, data: Partial<EmployeeInput>) {
  try {
    // Validate input
    const validatedData = employeeSchema.partial().parse(data);
    
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });
    
    if (!existingEmployee) {
      return { success: false, error: 'Employee not found' };
    }

    // Update the employee
    const employee = await prisma.employee.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${id}`);
    return { success: true, data: employee };
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') 
      };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update employee' 
    };
  }
}

export async function deleteEmployee(id: string) {
  try {
    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });
    
    if (!existingEmployee) {
      return { success: false, error: 'Employee not found' };
    }

    // Delete the employee
    await prisma.employee.delete({
      where: { id },
    });

    revalidatePath('/dashboard/employees');
    return { success: true };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete employee' 
    };
  }
}

export async function getEmployeeById(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }

    return { success: true, data: employee };
  } catch (error) {
    console.error('Error fetching employee:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch employee' 
    };
  }
}

export async function getAllEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: employees };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch employees' 
    };
  }
}
