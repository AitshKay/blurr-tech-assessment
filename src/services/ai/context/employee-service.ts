import { prisma } from '@/lib/prisma';
import { EmployeeWithDepartment, EmployeeWithTasks } from './types';

export class EmployeeService {
  static async searchEmployees(query: string): Promise<EmployeeWithDepartment[]> {
    try {
      const employees = await prisma.$queryRaw<EmployeeWithDepartment[]>/* sql */`
        SELECT 
          e.*,
          json_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'createdAt', d."createdAt",
            'updatedAt', d."updatedAt"
          ) as department,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          ) as user,
          (SELECT COALESCE(array_to_json(array_agg(t.*)), '[]'::json) 
           FROM "Task" t 
           WHERE t."assignedToId" = e.id) as tasks
        FROM "Employee" e
        LEFT JOIN "Department" d ON e."departmentId" = d.id
        LEFT JOIN "User" u ON e."userId" = u.id
        WHERE e.name ILIKE ${`%${query}%`} 
           OR e.email ILIKE ${`%${query}%`}
           OR e."employeeId"::text ILIKE ${`%${query}%`}
      `;

      return employees.map(emp => ({
        ...emp,
        department: emp.department || null,
        tasks: emp.tasks || []
      }));
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  }

  static async getEmployeeTasks(employeeId: string): Promise<EmployeeWithTasks> {
    try {
      const [employee] = await prisma.$queryRaw<EmployeeWithTasks[]>/* sql */`
        SELECT 
          e.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          ) as user,
          (SELECT COALESCE(array_to_json(array_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'description', t.description,
              'status', t.status,
              'dueDate', t."dueDate",
              'projectId', t."projectId",
              'assignedTo', (SELECT COALESCE(array_to_json(array_agg(
                json_build_object(
                  'id', e2.id,
                  'name', e2.name,
                  'email', e2.email,
                  'employeeId', e2."employeeId",
                  'department', (SELECT json_build_object('id', d.id, 'name', d.name)
                                FROM "Department" d WHERE d.id = e2."departmentId"),
                  'tasks', '[]'::json
                )
              )), '[]'::json)
              FROM "Employee" e2
              WHERE e2.id = t."assignedToId")
            )
          )), '[]'::json)
          FROM "Task" t
          WHERE t."assignedToId" = e.id
          ) as tasks
        FROM "Employee" e
        LEFT JOIN "User" u ON e."userId" = u.id
        WHERE e.id = ${employeeId}
      `;

      return {
        ...employee,
        tasks: employee.tasks || []
      };
    } catch (error) {
      console.error('Error getting employee tasks:', error);
      throw error;
    }
  }

  static async getDepartmentEmployees(departmentId: string): Promise<EmployeeWithTasks[]> {
    try {
      const employees = await prisma.employee.findMany({
        where: { departmentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tasks: {
            include: {
              project: true,
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employeeId: true,
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return employees as unknown as EmployeeWithTasks[];
    } catch (error) {
      console.error('Error getting department employees:', error);
      return [];
    }
  }
}
