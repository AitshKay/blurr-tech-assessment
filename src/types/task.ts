import { Task as PrismaTask, TaskDependency as PrismaTaskDependency, Priority, Status } from "@prisma/client";

export type Task = PrismaTask & {
  assignedTo?: {
    id: string;
    name: string | null;
  } | null;
  dependencies: TaskDependency[];
  dependents: TaskDependency[];
};

export type TaskDependency = PrismaTaskDependency & {
  task: {
    id: string;
    title: string;
    status: Status;
  };
  dependent: {
    id: string;
    title: string;
    status: Status;
  };
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  projectId: string;
  assignedToId?: string;
  dueDate?: Date | null;
  reminderDate?: Date | null;
};

export type UpdateTaskInput = {
  id: string;
  title?: string;
  description?: string | null;
  priority?: Priority;
  status?: Status;
  assignedToId?: string | null;
  dueDate?: Date | null;
  reminderDate?: Date | null;
};

export type CreateTaskDependencyInput = {
  taskId: string;
  dependentId: string;
  type: 'BLOCKER' | 'PREDECESSOR';
};

export type TaskWithDependencies = Task & {
  blockingTasks: Task[];
  blockedByTasks: Task[];
};
