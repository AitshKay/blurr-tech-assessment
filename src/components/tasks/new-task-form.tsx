'use client';

import { ClientTaskForm } from './client-task-form';
import { CreateTaskInput } from '@/types/task';

interface NewTaskFormProps {
  projects: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; name: string }>;
}

export function NewTaskForm({ projects, employees }: NewTaskFormProps) {
  const handleSubmit = async (data: any) => {
    const taskData: CreateTaskInput = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
    };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to create task' };
    }

    return { success: true };
  };

  return (
    <ClientTaskForm 
      projects={projects} 
      employees={employees}
      onSubmit={handleSubmit}
    />
  );
}

export type { NewTaskFormProps };
