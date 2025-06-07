import { prisma } from '@/lib/prisma';
import { Status } from '@prisma/client';
import { ProjectWithRelations } from './types';

export class ProjectService {
  static async searchProjects(query: string): Promise<ProjectWithRelations[]> {
    try {
      const projects = await prisma.$queryRaw<ProjectWithRelations[]>/* sql */`
        SELECT 
          p.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          ) as user,
          json_build_object(
            'id', c.id,
            'name', c.name
          ) as client,
          (
            SELECT COALESCE(array_to_json(array_agg(
              json_build_object(
                'id', t.id,
                'name', t.name,
                'description', t.description,
                'status', t.status,
                'dueDate', t."dueDate",
                'projectId', t."projectId",
                'assignedTo', (
                  SELECT COALESCE(array_agg(
                    json_build_object(
                      'id', e.id,
                      'name', e.name,
                      'email', e.email,
                      'employeeId', e."employeeId",
                      'department', (
                        SELECT json_build_object('id', d.id, 'name', d.name)
                        FROM "Department" d 
                        WHERE d.id = e."departmentId"
                      ),
                      'tasks', '[]'::json
                    )
                  ), '[]')
                  FROM "Employee" e
                  WHERE e.id = t."assignedToId"
                )
              )
            )), '[]'::json)
            FROM "Task" t
            WHERE t."projectId" = p.id
            AND t.status != 'CANCELLED'::"Status"
          ) as tasks,
          (
            SELECT COALESCE(array_agg(
              json_build_object(
                'employee', json_build_object(
                  'id', e.id,
                  'name', e.name,
                  'email', e.email,
                  'employeeId', e."employeeId",
                  'joiningDate', e."joiningDate",
                  'basicSalary', e."basicSalary",
                  'userId', e."userId",
                  'createdAt', e."createdAt",
                  'updatedAt', e."updatedAt",
                  'department', (
                    SELECT json_build_object('id', d.id, 'name', d.name)
                    FROM "Department" d 
                    WHERE d.id = e."departmentId"
                  ),
                  'tasks', '[]'::json,
                  'user', json_build_object(
                    'id', u2.id,
                    'name', u2.name,
                    'email', u2.email
                  )
                )
              )
            ), '[]'::json)
            FROM "_EmployeeToProject" ep
            JOIN "Employee" e ON e.id = ep."A"
            JOIN "User" u2 ON e."userId" = u2.id
            WHERE ep."B" = p.id
          ) as employees
        FROM "Project" p
        LEFT JOIN "User" u ON p."userId" = u.id
        LEFT JOIN "Client" c ON p."clientId" = c.id
        WHERE p.name ILIKE ${`%${query}%`} 
           OR p.description ILIKE ${`%${query}%`}
      `;

      return projects.map(project => ({
        ...project,
        tasks: project.tasks || [],
        employees: project.employees || []
      }));
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  static async getProjectContext(projectId: string): Promise<ProjectWithRelations | null> {
    try {
      const [project] = await prisma.$queryRaw<ProjectWithRelations[]>/* sql */`
        SELECT 
          p.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          ) as user,
          json_build_object(
            'id', c.id,
            'name', c.name
          ) as client,
          (
            SELECT COALESCE(array_to_json(array_agg(
              json_build_object(
                'id', t.id,
                'name', t.name,
                'description', t.description,
                'status', t.status,
                'dueDate', t."dueDate",
                'projectId', t."projectId",
                'assignedTo', (
                  SELECT COALESCE(array_agg(
                    json_build_object(
                      'id', e.id,
                      'name', e.name,
                      'email', e.email,
                      'employeeId', e."employeeId",
                      'department', (
                        SELECT json_build_object('id', d.id, 'name', d.name)
                        FROM "Department" d 
                        WHERE d.id = e."departmentId"
                      ),
                      'tasks', '[]'::json
                    )
                  ), '[]')
                  FROM "Employee" e
                  WHERE e.id = t."assignedToId"
                )
              )
            )), '[]'::json)
            FROM "Task" t
            WHERE t."projectId" = p.id
            AND t.status != 'CANCELLED'::"Status"
          ) as tasks,
          (
            SELECT COALESCE(array_agg(
              json_build_object(
                'employee', json_build_object(
                  'id', e.id,
                  'name', e.name,
                  'email', e.email,
                  'employeeId', e."employeeId",
                  'joiningDate', e."joiningDate",
                  'basicSalary', e."basicSalary",
                  'userId', e."userId",
                  'createdAt', e."createdAt",
                  'updatedAt', e."updatedAt",
                  'department', (
                    SELECT json_build_object('id', d.id, 'name', d.name)
                    FROM "Department" d 
                    WHERE d.id = e."departmentId"
                  ),
                  'tasks', '[]'::json,
                  'user', json_build_object(
                    'id', u2.id,
                    'name', u2.name,
                    'email', u2.email
                  )
                )
              )
            ), '[]'::json)
            FROM "_EmployeeToProject" ep
            JOIN "Employee" e ON e.id = ep."A"
            JOIN "User" u2 ON e."userId" = u2.id
            WHERE ep."B" = p.id
          ) as employees
        FROM "Project" p
        LEFT JOIN "User" u ON p."userId" = u.id
        LEFT JOIN "Client" c ON p."clientId" = c.id
        WHERE p.id = ${projectId}
      `;

      if (!project) return null;

      return {
        ...project,
        tasks: project.tasks || [],
        employees: project.employees || []
      };
    } catch (error) {
      console.error('Error getting project context:', error);
      return null;
    }
  }
}
