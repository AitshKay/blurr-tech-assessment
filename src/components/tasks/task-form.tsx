'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority, Status } from '@prisma/client';
import { Loader2 } from 'lucide-react';

// No need for a separate FormButton component

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(Status, {
    required_error: 'Status is required',
  }),
  priority: z.nativeEnum(Priority, {
    required_error: 'Priority is required',
  }),
  projectId: z.string().min(1, 'Project is required'),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  reminderDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  projects: Array<{ id: string; name: string }>;
  employees: Array<{ id: string; name: string }>;
  initialData?: TaskFormValues & { id?: string };
  onSubmit: (data: TaskFormValues) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ 
  projects, 
  employees, 
  initialData,
  onSubmit,
  onSuccess,
  onCancel 
}: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      status: Status.TODO,
      priority: Priority.NORMAL,
      projectId: '',
      assignedToId: '',
      dueDate: '',
      reminderDate: '',
    },
  });

  const handleFormSubmit = async (data: TaskFormValues) => {
    try {
      setIsLoading(true);
      const result = await onSubmit(data);
      
      if (result?.success) {
        if (onSuccess) {
          onSuccess();
        }
        if (!initialData?.id) {
          form.reset();
        }
      }
      return result;
    } catch (error) {
      console.error('Error saving task:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(handleFormSubmit)(e);
  };

  // Handle cancel button click
  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Priority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0) + priority.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === 'unassigned' ? null : value)} 
                  value={field.value || 'unassigned'}
                  disabled={employees.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Task description" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
