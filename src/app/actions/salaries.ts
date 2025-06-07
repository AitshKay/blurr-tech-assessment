"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const salarySchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  basicSalary: z.number().min(0, 'Basic salary must be a positive number'),
  bonus: z.number().min(0, 'Bonus must be a positive number').default(0),
  deductions: z.number().min(0, 'Deductions must be a positive number').default(0),
});

export async function createSalary(formData: FormData) {
  try {
    const rawData = {
      employeeId: formData.get('employeeId'),
      month: formData.get('month'),
      basicSalary: Number(formData.get('basicSalary')),
      bonus: Number(formData.get('bonus')) || 0,
      deductions: Number(formData.get('deductions')) || 0,
    };

    const validatedData = salarySchema.parse(rawData);
    
    const payableAmount = validatedData.basicSalary + validatedData.bonus - validatedData.deductions;

    const salary = await prisma.salary.create({
      data: {
        ...validatedData,
        month: new Date(validatedData.month),
        payableAmount,
      },
      include: {
        employee: true,
      },
    });

    return { success: true, data: salary };
  } catch (error) {
    console.error('Error creating salary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create salary' 
    };
  }
}

export async function updateSalary(id: string, formData: FormData) {
  try {
    const rawData = {
      employeeId: formData.get('employeeId'),
      month: formData.get('month'),
      basicSalary: Number(formData.get('basicSalary')),
      bonus: Number(formData.get('bonus')) || 0,
      deductions: Number(formData.get('deductions')) || 0,
    };

    const validatedData = salarySchema.parse(rawData);
    
    const payableAmount = validatedData.basicSalary + validatedData.bonus - validatedData.deductions;

    const salary = await prisma.salary.update({
      where: { id },
      data: {
        ...validatedData,
        month: new Date(validatedData.month),
        payableAmount,
      },
      include: {
        employee: true,
      },
    });

    return { success: true, data: salary };
  } catch (error) {
    console.error('Error updating salary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update salary' 
    };
  }
}

export async function deleteSalary(id: string) {
  try {
    await prisma.salary.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting salary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete salary' 
    };
  }
}

export async function getSalaryById(id: string) {
  try {
    const salary = await prisma.salary.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!salary) {
      return { success: false, error: 'Salary not found' };
    }

    return { success: true, data: salary };
  } catch (error) {
    console.error('Error fetching salary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch salary' 
    };
  }
}

export async function getSalariesByEmployee(employeeId: string) {
  try {
    const salaries = await prisma.salary.findMany({
      where: { employeeId },
      orderBy: { month: 'desc' },
      include: {
        employee: true,
      },
    });

    return { success: true, data: salaries };
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch salaries' 
    };
  }
}

export async function getAllSalaries() {
  try {
    const salaries = await prisma.salary.findMany({
      orderBy: { month: 'desc' },
      include: {
        employee: true,
      },
    });

    return { success: true, data: salaries };
  } catch (error) {
    console.error('Error fetching all salaries:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch salaries' 
    };
  }
}
