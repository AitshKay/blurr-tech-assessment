'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTaskDependency, deleteTaskDependency, getTaskDependencies } from '@/app/actions/task-dependencies';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { Task as PrismaTask, Status, Priority } from '@prisma/client';

type TaskForDependency = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  project: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
};

type TaskDependencyWithRelations = {
  id: string;
  taskId: string;
  dependentId: string;
  type: string;
  task: TaskForDependency;
  dependent: TaskForDependency;
  createdAt: Date;
  updatedAt: Date;
};

type TaskWithRelations = PrismaTask & {
  assignedTo?: { id: string; name: string | null } | null;
  project: { id: string; name: string };
};



const dependencyFormSchema = z.object({
  dependentTaskId: z.string().min(1, 'Task is required'),
  type: z.enum(['BLOCKER', 'PREDECESSOR'], {
    required_error: 'Dependency type is required',
  }),
});

type DependencyFormValues = z.infer<typeof dependencyFormSchema>;

interface TaskDependenciesProps {
  task: TaskWithRelations;
  projectTasks: Array<{ id: string; title: string }>;
  onDependencyChange?: () => void;
}

export function TaskDependencies({ task, projectTasks, onDependencyChange }: TaskDependenciesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [removingDependencyId, setRemovingDependencyId] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<TaskDependencyWithRelations[]>([]);

  const form = useForm<DependencyFormValues>({
    resolver: zodResolver(dependencyFormSchema),
    defaultValues: {
      dependentTaskId: '',
      type: 'BLOCKER',
    },
  });

  const loadDependencies = async () => {
    try {
      setIsLoading(true);
      const result = await getTaskDependencies(task.id);
      if (result.data) {
        // Map blocking tasks to dependencies
        const blockingDeps = result.data.blockingTasks.map((t: TaskForDependency) => ({
          id: `${task.id}-${t.id}`,
          taskId: task.id,
          dependentId: t.id,
          type: 'BLOCKER' as const,
          task: { 
            id: task.id, 
            title: task.title, 
            description: task.description,
            status: task.status,
            priority: task.priority ?? 'NORMAL',
            project: {
              id: task.project.id,
              name: task.project.name
            },
            assignedTo: task.assignedTo ? {
              id: task.assignedTo.id,
              name: task.assignedTo.name
            } : null
          },
          dependent: {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            project: {
              id: t.project.id,
              name: t.project.name
            },
            assignedTo: t.assignedTo ? {
              id: t.assignedTo.id,
              name: t.assignedTo.name
            } : null
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        // Map blocked by tasks to dependencies
        const blockedByDeps = result.data.blockedByTasks.map((t: TaskForDependency) => ({
          id: `${t.id}-${task.id}`,
          taskId: t.id,
          dependentId: task.id,
          type: 'BLOCKER' as const,
          task: {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            project: {
              id: t.project.id,
              name: t.project.name
            },
            assignedTo: t.assignedTo ? {
              id: t.assignedTo.id,
              name: t.assignedTo.name
            } : null
          },
          dependent: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority ?? 'NORMAL',
            project: {
              id: task.project.id,
              name: task.project.name
            },
            assignedTo: task.assignedTo ? {
              id: task.assignedTo.id,
              name: task.assignedTo.name
            } : null
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        setDependencies([...blockingDeps, ...blockedByDeps] as TaskDependencyWithRelations[]);
      }
    } catch (error) {
      console.error('Failed to load dependencies:', error);
      toast.error('Failed to load task dependencies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, [task.id]);

  const handleAddDependency = async (data: DependencyFormValues) => {
    try {
      setIsAddingDependency(true);
      const result = await createTaskDependency({
        taskId: task.id,
        dependentId: data.dependentTaskId,
        type: data.type,
      });

      if (result.data) {
        toast.success('Dependency added successfully');
        form.reset();
        await loadDependencies();
        onDependencyChange?.();
      } else {
        toast.error(result.error || 'Failed to add dependency');
      }
    } catch (error) {
      console.error('Error adding dependency:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add dependency';
      toast.error(errorMessage);
    } finally {
      setIsAddingDependency(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      setRemovingDependencyId(dependencyId);
      const result = await deleteTaskDependency(dependencyId);
      
      if (result.success) {
        toast.success('Dependency removed successfully');
        await loadDependencies();
        onDependencyChange?.();
      } else {
        toast.error(result.error || 'Failed to remove dependency');
      }
    } catch (error) {
      console.error('Error removing dependency:', error);
      toast.error('Failed to remove dependency');
    }
  };

  // Filter out tasks that are already dependencies and the current task
  const availableTasks = projectTasks.filter(
    (t) => 
      t.id !== task.id && 
      !dependencies.some(d => d.dependent.id === t.id || d.task.id === t.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Dependencies</CardTitle>
        <CardDescription>
          Manage tasks that this task depends on or blocks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dependencies.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Dependencies</h4>
              <div className="space-y-2">
                {dependencies.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {dep.type === 'BLOCKER' ? 'Blocks' : 'Depends on'}:{' '}
                        {dep.dependent.id === task.id ? dep.task.title : dep.dependent.title}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {dep.type === 'BLOCKER' 
                          ? 'This task blocks the other task from starting'
                          : 'This task must be completed before the other task can start'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveDependency(dep.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove dependency</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No dependencies have been added yet.
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddDependency)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="dependentTaskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={availableTasks.length === 0 || isAddingDependency}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependency Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isAddingDependency}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dependency type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BLOCKER">This task blocks the other task</SelectItem>
                        <SelectItem value="PREDECESSOR">This task depends on the other task</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={availableTasks.length === 0 || isAddingDependency}
                className="w-full"
              >
                {isAddingDependency ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Dependency'
                )}
              </Button>
              
              {availableTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No more tasks available to add as dependencies.
                </p>
              )}
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
