import { AppContextService } from './app-context-service';

export const aiTools = {
  async getEmployeeInfo(employeeId: string) {
    try {
      return await AppContextService.getEmployeeContext(employeeId);
    } catch (error) {
      console.error('Error getting employee info:', error);
      return { error: 'Failed to retrieve employee information' };
    }
  },
  
  async searchEmployees(query: string) {
    try {
      return await AppContextService.searchEmployees(query);
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  },
  
  async getProjectDetails(projectId: string) {
    try {
      return await AppContextService.getProjectContext(projectId);
    } catch (error) {
      console.error('Error getting project details:', error);
      return { error: 'Failed to retrieve project details' };
    }
  },
  
  async searchProjects(query: string) {
    try {
      return await AppContextService.searchProjects(query);
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  },
  
  async getEmployeeTasks(employeeId: string) {
    try {
      const employee = await AppContextService.getEmployeeContext(employeeId);
      return employee?.tasks || [];
    } catch (error) {
      console.error('Error getting employee tasks:', error);
      return [];
    }
  }
};

export type AITool = keyof typeof aiTools;
