import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { NewTaskForm } from '@/components/tasks/new-task-form';

export default async function NewTaskPage() {
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

  if (!projects || !employees) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Task</h1>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <NewTaskForm projects={projects} employees={employees} />
      </div>
    </div>
  );
}
