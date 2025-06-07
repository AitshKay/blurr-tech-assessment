'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteSalary } from './salaries';

export async function deleteSalaryAction(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  if (!id) {
    throw new Error('Salary ID is required');
  }
  
  const result = await deleteSalary(id);
  if (result.success) {
    revalidatePath('/dashboard/salaries');
    redirect('/dashboard/salaries');
    return;
  }
  
  throw new Error(result.error || 'Failed to delete salary');
}
