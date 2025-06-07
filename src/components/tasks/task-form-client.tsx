'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from './task-form';
import { NewTaskFormProps } from './new-task-form';

export function TaskFormClient({ 
  taskId, 
  projects, 
  employees, 
  initialData 
}: { 
  taskId: string; 
  projects: Array<{ id: string; name: string }>; 
  employees: Array<{ id: string; name: string }>; 
  initialData: any;
}) {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      // Convert date strings to Date objects before submitting
      const taskData = {
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

      // Check if the response has content before trying to parse JSON
      const responseText = await response.text();
      let errorData;
      
      if (responseText) {
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
      }

      if (!response.ok) {
        return { 
          success: false, 
          error: errorData?.message || 'Failed to create task',
          status: response.status
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting form:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const handleSuccess = () => {
    router.push('/dashboard/tasks');
    router.refresh();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TaskForm 
      projects={projects} 
      employees={employees} 
      initialData={initialData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
