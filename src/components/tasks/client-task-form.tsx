'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from './task-form';
import { toast } from 'sonner';

export function ClientTaskForm({ 
  projects, 
  employees, 
  initialData,
  onSubmit,
  onSuccess,
  onCancel
}: { 
  projects: Array<{ id: string; name: string }>; 
  employees: Array<{ id: string; name: string }>; 
  initialData?: any;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const result = await onSubmit(data);
      
      if (result?.success) {
        // Show success toast
        toast.success(initialData?.id ? 'Task updated successfully' : 'Task created successfully');
        
        // If this is a new task, navigate to tasks list
        if (!initialData?.id) {
          router.push('/dashboard/tasks');
        } else {
          // For updates, navigate to the task detail page
          router.push(`/dashboard/tasks/${initialData.id}`);
        }
        router.refresh();
        
        return result;
      } else {
        toast.error(result?.error || 'An error occurred');
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const handleSuccess = () => {
    // This will be called after form.reset() if it's a new task
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
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
