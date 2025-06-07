'use server';

import { prisma } from '@/lib/prisma';

export async function deleteEmployeeAction(id: string) {
  try {
    await prisma.employee.delete({
      where: { id },
    });
    return { success: true, message: 'Employee deleted successfully' };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete employee' 
    };
  }
}
