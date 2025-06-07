'use client';

import { useRouter } from 'next/navigation';
import { ClientTaskForm } from './client-task-form';
import { updateTask } from '@/app/actions/tasks';

export function EditTaskForm({ 
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
  const handleSubmit = async (data: any) => {
    const result = await updateTask({
      ...data,
      id: taskId,
    });
    return result;
  };

  const handleSuccess = () => {
    // Navigation is handled by ClientTaskForm after successful update
  };
  
  const router = useRouter();

  const handleCancel = () => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  return (
    <ClientTaskForm 
      projects={projects} 
      employees={employees} 
      initialData={initialData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
