import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Priority, Status } from '@prisma/client';
import { EditTaskForm } from '@/components/tasks/edit-task-form';

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  
  // Fetch task with relations
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Fetch projects and employees in parallel
  const [projects, employees] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.employee.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  // Format dates for datetime-local inputs
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  // Extend the task type to include optional date fields
  type TaskWithDates = typeof task & {
    dueDate?: Date | null;
    reminderDate?: Date | null;
  };

  const taskWithDates = task as TaskWithDates;

  const initialData = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    status: task.status as Status,
    priority: task.priority as Priority,
    projectId: task.projectId,
    assignedToId: task.assignedToId || '',
    dueDate: taskWithDates.dueDate ? formatDateForInput(taskWithDates.dueDate) : '',
    reminderDate: taskWithDates.reminderDate ? formatDateForInput(taskWithDates.reminderDate) : '',
  };



  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Task</h1>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <EditTaskForm 
          taskId={task.id}
          projects={projects} 
          employees={employees} 
          initialData={initialData}
        />
      </div>
    </div>
  );
}
