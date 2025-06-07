'use server';

import { prisma } from '@/lib/prisma';
import { CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { revalidatePath } from 'next/cache';
import { Priority, Status } from '@prisma/client';

export async function createTask(data: CreateTaskInput) {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'NORMAL',
        status: data.status || 'TODO',
        projectId: data.projectId,
        assignedToId: data.assignedToId || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath('/dashboard/tasks');
    return { success: true, data: task };
  } catch (error) {
    console.error('Error creating task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task' 
    };
  }
}

export async function updateTask(data: UpdateTaskInput) {
  try {
    const updateData: any = {};
    
    // Only include fields that are provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    
    // Handle assignedToId specially - it can be null to unassign
    if ('assignedToId' in data) {
      updateData.assignedToId = data.assignedToId === '' ? null : data.assignedToId;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.reminderDate !== undefined) {
      updateData.reminderDate = data.reminderDate ? new Date(data.reminderDate) : null;
    }

    const task = await prisma.task.update({
      where: { id: data.id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath('/dashboard/tasks');
    revalidatePath(`/dashboard/tasks/${data.id}`);
    return { success: true, data: task };
  } catch (error) {
    console.error('Error updating task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task' 
    };
  }
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id },
    });

    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete task' 
    };
  }
}

export async function getTaskById(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    return { success: true, data: task };
  } catch (error) {
    console.error('Error fetching task:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch task' 
    };
  }
}

export async function getProjectTasks(projectId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch project tasks' 
    };
  }
}

export async function updateTaskStatus(taskId: string, status: Status) {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath('/dashboard/tasks');
    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, data: task };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task status' 
    };
  }
}
