'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createProject, updateProject } from '@/app/actions/projects';
import { Status } from '@prisma/client';

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(Status),
});

// Type for the form values
type ProjectFormValues = z.infer<typeof formSchema>;

// Status options for the select dropdown
const statusOptions = [
  { value: Status.TODO, label: 'To Do' },
  { value: Status.IN_PROGRESS, label: 'In Progress' },
  { value: Status.REVIEW, label: 'Review' },
  { value: Status.DONE, label: 'Done' },
  { value: Status.BLOCKED, label: 'Blocked' },
] as const;

interface ProjectFormProps {
  initialData?: ProjectFormValues & { id?: string };
  onSuccess?: () => void;
  onSubmit?: (data: ProjectFormValues) => Promise<void>;
}

export function ProjectForm({ initialData, onSuccess, onSubmit }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || Status.TODO,
    },
  });

  // Handle form submission
  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsLoading(true);
      if (onSubmit) {
        await onSubmit(data);
      } else {
        if (initialData?.id) {
          await updateProject(initialData.id, data);
          toast.success('Project updated successfully');
        } else {
          await createProject(data);
          toast.success('Project created successfully');
        }
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      throw error; // Re-throw to allow the form to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter project description"
                    disabled={isLoading}
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : initialData?.id ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
