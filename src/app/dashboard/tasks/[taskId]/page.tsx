'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Status, Priority } from '@prisma/client';

// Define the API response type for the task
type TaskResponse = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  projectId: string;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string | null } | null;
  dueDate?: string | null;
  reminderDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Simple badge components to replace the missing ones
const StatusBadge = ({ status }: { status: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    {status.replace(/_/g, ' ')}
  </span>
);

const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
    priority === 'NORMAL' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }`}>
    {priority}
  </span>
);

// Define the task with relations type based on Prisma schema
type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  projectId: string;
  project: { id: string; name: string };
  assignedToId: string | null;
  assignedTo: { id: string; name: string | null } | null;
  // Task dependencies
  blockingTasks?: Array<{ id: string; title: string; status: Status }>;
  blockedByTasks?: Array<{ id: string; title: string; status: Status }>;
  // Optional date fields
  dueDate?: Date | null;
  reminderDate?: Date | null;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
};

export default function TaskDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ taskId: string }>;
}) {
  // Unwrap the params promise
  const params = React.use(paramsPromise);
  
  // All state declarations at the top
  const [task, setTask] = React.useState<TaskWithRelations | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [projectTasks, setProjectTasks] = React.useState<Array<{ id: string; title: string; status: Status }>>([]);
  const [dependencies, setDependencies] = React.useState<Array<{ id: string; title: string; status: Status }>>([]);
  const [dependents, setDependents] = React.useState<Array<{ id: string; title: string; status: Status }>>([]);

  // Format dates for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Fetch main task data
  React.useEffect(() => {
    const fetchTask = async () => {
      if (!params?.taskId) return;
      
      try {
        const response = await fetch(`/api/tasks/${params.taskId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        const data = await response.json();
        
        // Parse date strings into Date objects
        const taskWithDates = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          reminderDate: data.reminderDate ? new Date(data.reminderDate) : null,
        };
        
        setTask(taskWithDates as TaskWithRelations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching task:', err);
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [params.taskId]);

  // Load additional task data when task is available
  React.useEffect(() => {
    if (!task) return;
    
    const fetchProjectTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?projectId=${task.projectId}&exclude=${task.id}`);
        if (response.ok) {
          const data = await response.json();
          setProjectTasks(data);
        }
      } catch (err) {
        console.error('Error fetching project tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDependencies = async () => {
      try {
        // Replace with your actual API endpoint for dependencies
        const response = await fetch(`/api/tasks/${task.id}/dependencies`);
        if (response.ok) {
          const data = await response.json();
          setDependencies(data);
        }
      } catch (err) {
        console.error('Error fetching dependencies:', err);
      }
    };

    fetchProjectTasks();
    fetchDependencies();
  }, [task]);
  
  // Loading and error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !task) {
    return <div>Error: {error || 'Task not found'}</div>;
  }
  
  // Handle status update
  const handleStatusUpdate = async (newStatus: Status) => {
    try {
      const response = await fetch(`/api/tasks/${params.taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state with the new status
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${params.taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Redirect to tasks list after successful deletion
      window.location.href = '/dashboard/tasks';
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    }
  };



  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/tasks">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to tasks</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button asChild size="sm">
          <Link href={`/dashboard/tasks/${task.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Created on {format(task.createdAt, 'MMM d, yyyy')}
                {task.updatedAt.getTime() !== task.createdAt.getTime() && 
                  ` • Updated ${format(task.updatedAt, 'MMM d, yyyy')}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {task.description ? (
                    <p className="whitespace-pre-line">{task.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided.</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                  <p>
                    <Link 
                      href={`/dashboard/projects/${task.project.id}`} 
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {task.project.name}
                    </Link>
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  {task.status && <StatusBadge status={task.status} />}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  {task.priority && <PriorityBadge priority={task.priority} />}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                  <p>
                    {task.assignedTo ? (
                      <Link 
                        href={`/dashboard/team/${task.assignedTo.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {task.assignedTo.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(task.createdAt)}
                    {' '}
                    ({task.createdAt.toLocaleDateString()})
                  </p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(task.updatedAt)}
                    {' '}
                    ({task.updatedAt.toLocaleString()})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Task Comments Section - To be implemented */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Task comments and discussion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Comments will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Task Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <h4 className="text-sm font-medium">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Status).map((status) => (
                    <Button
                      key={status}
                      variant={task.status === status ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                      onClick={() => handleStatusUpdate(status as Status)}
                    >
                      {status.toLowerCase().replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  asChild
                >
                  <Link href={`/dashboard/tasks/${task.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Task Dependencies - Placeholder for future implementation */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Task Dependencies</h2>
            <p className="text-sm text-muted-foreground">
              Task dependencies feature coming soon.
            </p>
          </div>
          
          {/* Task Activity - To be implemented */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent changes to this task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Activity log will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
