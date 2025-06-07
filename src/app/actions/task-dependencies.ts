'server';

import { prisma } from "@/lib/prisma";
import { CreateTaskDependencyInput } from "@/types/task";
import { revalidatePath } from 'next/cache';
import { Task, Status, Priority } from '@prisma/client';

// Type for task with minimal fields needed for dependency display
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

type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string | null } | null;
};

type TaskDependency = {
  id: string;
  taskId: string;
  dependentId: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

type TaskDependencyWithRelations = TaskDependency & {
  task: TaskWithRelations;
  dependent: TaskWithRelations;
};

export async function createTaskDependency(
  input: CreateTaskDependencyInput
): Promise<{ data: TaskDependencyWithRelations | null; error: string | null }> {
  try {
    if (input.taskId === input.dependentId) {
      return {
        data: null,
        error: 'A task cannot depend on itself',
      };
    }
    
    // Check if both tasks exist
    const [task, dependent] = await Promise.all([
      prisma.$queryRaw<TaskWithRelations[]>`
        SELECT t.*, 
               json_build_object('id', p.id, 'name', p.name) as project,
               CASE 
                 WHEN e.id IS NOT NULL THEN json_build_object('id', e.id, 'name', e.name)
                 ELSE NULL
               END as "assignedTo"
        FROM "Task" t
        JOIN "Project" p ON t.project_id = p.id
        LEFT JOIN "Employee" e ON t.assigned_to_id = e.id
        WHERE t.id = ${input.taskId}
      `,
      prisma.$queryRaw<TaskWithRelations[]>`
        SELECT t.*, 
               json_build_object('id', p.id, 'name', p.name) as project,
               CASE 
                 WHEN e.id IS NOT NULL THEN json_build_object('id', e.id, 'name', e.name)
                 ELSE NULL
               END as "assignedTo"
        FROM "Task" t
        JOIN "Project" p ON t.project_id = p.id
        LEFT JOIN "Employee" e ON t.assigned_to_id = e.id
        WHERE t.id = ${input.dependentId}
      `
    ]);
    
    if (!task?.[0] || !dependent?.[0]) {
      return {
        data: null,
        error: 'One or both tasks not found',
      };
    }

    // Check for circular dependencies
    const hasCycle = await checkForCircularDependency(input.taskId, input.dependentId);
    if (hasCycle) {
      throw new Error("Creating this dependency would create a circular dependency");
    }

    // Check if the dependency already exists
    const existingDependency = await prisma.$queryRaw<TaskDependency[]>`
      SELECT * FROM "TaskDependency"
      WHERE task_id = ${input.taskId} AND dependent_id = ${input.dependentId}
      LIMIT 1
    `;

    if (existingDependency && existingDependency.length > 0) {
      return {
        data: null,
        error: 'This dependency already exists',
      };
    }

    // Create the dependency in a transaction
    const newDependency = await prisma.$transaction(async (tx) => {
      // Create the dependency
      const [createdDependency] = await tx.$queryRaw<TaskDependency[]>`
        INSERT INTO "TaskDependency" (task_id, dependent_id, type, created_at, updated_at)
        VALUES (${input.taskId}, ${input.dependentId}, ${input.type}, NOW(), NOW())
        RETURNING *
      `;
      
      if (!createdDependency) {
        throw new Error('Failed to create task dependency');
      }
      
      // Update the task's updatedAt timestamp
      await tx.$executeRaw`
        UPDATE "Task"
        SET updated_at = NOW()
        WHERE id = ${input.taskId}
      `;
      
      return createdDependency;
    });
    
    // Get the full dependency with relations
    const [dependency] = await prisma.$queryRaw<TaskDependencyWithRelations[]>`
      SELECT 
        td.*,
        json_build_object(
          'id', t1.id,
          'title', t1.title,
          'description', t1.description,
          'status', t1.status,
          'priority', t1.priority,
          'project', json_build_object('id', p1.id, 'name', p1.name),
          'assignedTo', CASE 
            WHEN e1.id IS NOT NULL THEN json_build_object('id', e1.id, 'name', e1.name)
            ELSE NULL
          END
        ) as task,
        json_build_object(
          'id', t2.id,
          'title', t2.title,
          'description', t2.description,
          'status', t2.status,
          'priority', t2.priority,
          'project', json_build_object('id', p2.id, 'name', p2.name),
          'assignedTo', CASE 
            WHEN e2.id IS NOT NULL THEN json_build_object('id', e2.id, 'name', e2.name)
            ELSE NULL
          END
        ) as dependent
      FROM "TaskDependency" td
      JOIN "Task" t1 ON td.task_id = t1.id
      JOIN "Project" p1 ON t1.project_id = p1.id
      LEFT JOIN "Employee" e1 ON t1.assigned_to_id = e1.id
      JOIN "Task" t2 ON td.dependent_id = t2.id
      JOIN "Project" p2 ON t2.project_id = p2.id
      LEFT JOIN "Employee" e2 ON t2.assigned_to_id = e2.id
      WHERE td.id = ${newDependency.id}
    `;
    
    revalidatePath(`/dashboard/tasks/${input.taskId}`);
    revalidatePath(`/dashboard/tasks/${input.dependentId}`);
    
    // If this is a BLOCKER dependency, update the status of the dependent task if needed
    if (input.type === 'BLOCKER') {
      const dependentTask = await prisma.task.findUnique({
        where: { id: input.dependentId },
      });

      if (dependentTask?.status === 'TODO') {
        await prisma.task.update({
          where: { id: input.dependentId },
          data: { status: 'BLOCKED' },
        });
        revalidatePath(`/dashboard/tasks/${input.dependentId}`);
      }
    }

    return { data: dependency || null, error: null };
  } catch (error) {
    console.error('Error creating task dependency:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create task dependency' 
    };
  }
}

export async function deleteTaskDependency(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the dependency to revalidate paths later
    const [dependency] = await prisma.$queryRaw<TaskDependency[]>`
      SELECT * FROM "TaskDependency" WHERE id = ${id}
    `;
    
    if (!dependency) {
      return { success: false, error: 'Dependency not found' };
    }
    
    // Delete the dependency
    await prisma.$executeRaw`
      DELETE FROM "TaskDependency" WHERE id = ${id}
    `;
    
    // Update the task's updatedAt timestamp
    await prisma.$executeRaw`
      UPDATE "Task"
      SET updated_at = NOW()
      WHERE id = ${dependency.taskId}
    `;

    revalidatePath(`/dashboard/tasks/${dependency.taskId}`);
    revalidatePath(`/dashboard/tasks/${dependency.dependentId}`);

    // If this was a BLOCKER dependency, check if we need to update the task status
    if (dependency.type === 'BLOCKER') {
      const [blockingCount] = await prisma.$queryRaw<Array<{ count: string }>>`
        SELECT COUNT(*) as count FROM "TaskDependency"
        WHERE dependent_id = ${dependency.dependentId} AND type = 'BLOCKER'
      `;

      if (blockingCount && blockingCount.count === '0') {
        const task = await prisma.task.findUnique({
          where: { id: dependency.dependentId },
        });

        if (task?.status === 'BLOCKED') {
          await prisma.task.update({
            where: { id: dependency.dependentId },
            data: { status: 'TODO' },
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting task dependency:', error);
    return { success: false, error: 'Failed to delete task dependency' };
  }
}

export async function getTaskDependencies(
  taskId: string
): Promise<{
  data: {
    blockingTasks: TaskForDependency[];
    blockedByTasks: TaskForDependency[];
  } | null;
  error: string | null;
}> {
  try {
    // Get tasks that this task is blocking (this task is a blocker for them)
    const [blockingDeps, blockedByDeps] = await Promise.all([
      // Tasks that this task is blocking
      prisma.$queryRaw<Array<{
        id: string;
        task_id: string;
        dependent_id: string;
        type: string;
        dependent: TaskWithRelations;
      }>>`
        SELECT 
          td.*,
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'status', t.status,
            'priority', t.priority,
            'project', json_build_object('id', p.id, 'name', p.name),
            'assignedTo', CASE 
              WHEN e.id IS NOT NULL THEN json_build_object('id', e.id, 'name', e.name)
              ELSE NULL
            END
          ) as dependent
        FROM "TaskDependency" td
        JOIN "Task" t ON td.dependent_id = t.id
        JOIN "Project" p ON t.project_id = p.id
        LEFT JOIN "Employee" e ON t.assigned_to_id = e.id
        WHERE td.task_id = ${taskId}
      `,
      
      // Tasks that are blocking this task
      prisma.$queryRaw<Array<{
        id: string;
        task_id: string;
        dependent_id: string;
        type: string;
        task: TaskWithRelations;
      }>>`
        SELECT 
          td.*,
          json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'status', t.status,
            'priority', t.priority,
            'project', json_build_object('id', p.id, 'name', p.name),
            'assignedTo', CASE 
              WHEN e.id IS NOT NULL THEN json_build_object('id', e.id, 'name', e.name)
              ELSE NULL
            END
          ) as task
        FROM "TaskDependency" td
        JOIN "Task" t ON td.task_id = t.id
        JOIN "Project" p ON t.project_id = p.id
        LEFT JOIN "Employee" e ON t.assigned_to_id = e.id
        WHERE td.dependent_id = ${taskId}
      `
    ]);

    return {
      data: {
        blockingTasks: blockingDeps.map(dep => ({
          id: dep.dependent_id,
          title: dep.dependent.title,
          description: dep.dependent.description,
          status: dep.dependent.status,
          priority: dep.dependent.priority,
          project: dep.dependent.project,
          assignedTo: dep.dependent.assignedTo,
        })),
        blockedByTasks: blockedByDeps.map(dep => ({
          id: dep.task_id,
          title: dep.task.title,
          description: dep.task.description,
          status: dep.task.status,
          priority: dep.task.priority,
          project: dep.task.project,
          assignedTo: dep.task.assignedTo,
        })),
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting task dependencies:', error);
    return { data: null, error: 'Failed to get task dependencies' };
  }
}

async function checkForCircularDependency(
  taskId: string, 
  dependentId: string
): Promise<boolean> {
  // If the task is trying to depend on itself, it's a circular dependency
  if (taskId === dependentId) {
    return true;
  }

  // Get all tasks that the dependent task depends on
  const dependencies = await prisma.$queryRaw<Array<{ task_id: string }>>`
    SELECT task_id FROM "TaskDependency"
    WHERE dependent_id = ${dependentId}
  `;

  // Check if any of these dependencies point back to the original task
  for (const dep of dependencies) {
    if (dep.task_id === taskId) {
      return true; // Circular dependency found
    }
    // Recursively check for circular dependencies
    if (await checkForCircularDependency(taskId, dep.task_id)) {
      return true;
    }
  }

  return false;
}
