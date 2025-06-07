'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

// Define the type for the row data
export type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  project: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

type CellProps = {
  row: {
    original: TaskRow;
  };
};

// Only use valid Badge variants
const statusVariantMap = {
  TODO: 'outline',
  IN_PROGRESS: 'default',
  REVIEW: 'secondary',
  DONE: 'default',
  BLOCKED: 'destructive',
} as const;

const priorityVariantMap = {
  LOW: 'outline',
  NORMAL: 'default',
  HIGH: 'destructive',
} as const;

// Define column types
type ColumnDef<T> = {
  accessorKey?: keyof T | string;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  id?: string;
};

export const columns: ColumnDef<TaskRow>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <Link 
        href={`/dashboard/tasks/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge 
        variant={statusVariantMap[row.original.status as keyof typeof statusVariantMap]}
        className="capitalize"
      >
        {String(row.original.status).toLowerCase().replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => (
      <Badge 
        variant={priorityVariantMap[row.original.priority as keyof typeof priorityVariantMap]}
        className="capitalize"
      >
        {row.original.priority.toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: 'project',
    header: 'Project',
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/tasks/${row.original.id}`}>
            View
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/tasks/${row.original.id}/edit`}>
            Edit
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
              try {
                const response = await fetch(`/api/tasks/${row.original.id}`, {
                  method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete task');
                window.location.reload();
              } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
              }
            }
          }}
        >
          Delete
        </Button>
      </div>
    ),
  },
];
