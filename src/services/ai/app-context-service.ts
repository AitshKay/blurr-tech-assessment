import { EmployeeService } from './context/employee-service';
import { ProjectService } from './context/project-service';
import type { 
  EmployeeWithDepartment, 
  EmployeeWithTasks, 
  ProjectWithRelations 
} from './context/types';

/**
 * AppContextService provides a unified interface for accessing AI-related context data
 * by delegating to specialized service classes.
 */
export class AppContextService {
  /**
   * Get context for an employee including their department and tasks
   */
  static async getEmployeeContext(employeeId: string): Promise<EmployeeWithTasks | null> {
    try {
      return await EmployeeService.getEmployeeTasks(employeeId);
    } catch (error) {
      console.error('Error getting employee context:', error);
      return null;
    }
  }

  /**
   * Get project context including tasks and assigned employees
   */
  static async getProjectContext(projectId: string): Promise<ProjectWithRelations | null> {
    try {
      return await ProjectService.getProjectContext(projectId);
    } catch (error) {
      console.error('Error getting project context:', error);
      return null;
    }
  }

  /**
   * Search for employees matching the query
   */
  static async searchEmployees(query: string): Promise<EmployeeWithDepartment[]> {
    try {
      return await EmployeeService.searchEmployees(query);
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  }

  /**
   * Search for projects matching the query
   */
  static async searchProjects(query: string): Promise<ProjectWithRelations[]> {
    try {
      return await ProjectService.searchProjects(query);
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  /**
   * Get all employees in a department with their tasks
   */
  static async getDepartmentEmployees(departmentId: string): Promise<EmployeeWithTasks[]> {
    try {
      return await EmployeeService.getDepartmentEmployees(departmentId);
    } catch (error) {
      console.error('Error getting department employees:', error);
      return [];
    }
  }
}
