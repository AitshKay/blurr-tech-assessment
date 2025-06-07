import { ToolDefinition } from './types';

export const getToolDefinitions = (availableTools: Record<string, any> = {}): ToolDefinition[] => {
  if (!availableTools) return [];
  
  return [
    {
      type: 'function',
      function: {
        name: 'getEmployeeInfo',
        description: 'Get detailed information about an employee',
        parameters: {
          type: 'object',
          properties: {
            employeeId: { 
              type: 'string',
              description: 'The ID of the employee' 
            }
          },
          required: ['employeeId']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'listEmployees',
        description: 'List all employees with optional filtering',
        parameters: {
          type: 'object',
          properties: {
            departmentId: { 
              type: 'string',
              description: 'Filter employees by department ID' 
            },
            role: { 
              type: 'string',
              description: 'Filter employees by role' 
            },
            status: { 
              type: 'string',
              enum: ['active', 'on_leave', 'terminated'],
              description: 'Filter employees by employment status' 
            }
          }
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'getDepartmentInfo',
        description: 'Get information about a department',
        parameters: {
          type: 'object',
          properties: {
            departmentId: { 
              type: 'string',
              description: 'The ID of the department' 
            }
          },
          required: ['departmentId']
        }
      }
    }
  ];
};
