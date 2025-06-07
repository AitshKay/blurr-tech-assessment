'use server';

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  try {
    const [employeeCount, projectCount, taskCount, recentEmployees, recentProjects] = await Promise.all([
      prisma.employee.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.employee.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          },
          tasks: {
            take: 1,
            orderBy: { dueDate: 'asc' },
            where: { status: 'IN_PROGRESS' }
          }
        }
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        include: {
          tasks: {
            take: 1,
            orderBy: { dueDate: 'asc' },
            where: { status: 'IN_PROGRESS' }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);


    return {
      employeeCount,
      projectCount,
      taskCount,
      recentEmployees: recentEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        employeeId: emp.employeeId,
        joiningDate: emp.joiningDate,
        tasks: emp.tasks,
        user: emp.user
      })),
      recentProjects: recentProjects.map(proj => ({
        id: proj.id,
        name: proj.name,
        status: proj.status,
        tasks: proj.tasks,
        user: proj.user
      }))
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
