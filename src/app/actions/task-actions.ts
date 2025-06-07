'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { deleteTask } from './tasks';

export async function updateTaskStatus(taskId: string, status: Status) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    
    // Revalidate the task detail page
    revalidatePath(`/dashboard/tasks/${taskId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}

export async function handleDeleteTask(taskId: string) {
  try {
    const result = await deleteTask(taskId);
    if (result.success) {
      redirect('/dashboard/tasks');
    }
    return result;
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
