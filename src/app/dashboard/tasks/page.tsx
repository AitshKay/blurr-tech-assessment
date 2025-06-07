'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

import { ListPage } from '@/components/layout/list-page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

// Import the TaskRow type from columns
type TaskRow = import('./columns').TaskRow;

// Define the API response type
type ApiTask = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  project: {
    id: string;
    name: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

// Status and priority variant maps for badges
const statusVariantMap = {
  TODO: 'outline',
  IN_PROGRESS: 'default',
  REVIEW: 'secondary',
  DONE: 'success',
  BLOCKED: 'destructive',
} as const;

const priorityVariantMap = {
  LOW: 'outline',
  NORMAL: 'default',
  HIGH: 'destructive',
} as const;

export default function TasksPage() {
  const router = useRouter();
  
  // Fetch tasks using React Query
  const { 
    data: tasks = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useQuery<ApiTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle task click
  const handleRowClick = (task: TaskRow) => {
    router.push(`/dashboard/tasks/${task.id}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Custom empty state
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-medium">No tasks found</h3>
      <p className="mb-4 max-w-xs text-sm text-muted-foreground">
        Get started by creating a new task to organize your work
      </p>
      <Button size="sm" asChild>
        <Link href="/dashboard/tasks/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Link>
      </Button>
    </div>
  );

  // Format tasks for the table
  const formattedTasks = useMemo((): TaskRow[] => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      project: task.project?.name || 'No project',
      assignedTo: task.assignedTo?.name || 'Unassigned',
      dueDate: task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : 'No due date',
      createdAt: format(parseISO(task.createdAt), 'MMM d, yyyy'),
      updatedAt: format(parseISO(task.updatedAt), 'MMM d, yyyy'),
    }));
  }, [tasks]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error loading tasks</h2>
        <p className="mb-4 text-muted-foreground">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <ListPage
      title="Tasks"
      description="Manage your tasks and track their progress"
      createHref="/dashboard/tasks/new"
      createLabel="New Task"
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="mr-2"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={formattedTasks}
        loading={isLoading}
        error={error || undefined}
        onRowClick={handleRowClick}
        emptyState={emptyState}
        className=""
        rowClassName={(task) => {
          // Add strikethrough for completed tasks
          if (task.status === 'DONE') {
            return 'line-through text-muted-foreground';
          }
          return '';
        }}
      />
    </ListPage>
  );
}
