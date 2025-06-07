import { aiTools, type AITool } from './ai-tools';
import type { AIMessage, AIProviderInterface } from '@/types/ai-provider';

export interface ToolAIServiceType {
  getEmployeeInfo: (employeeId: string) => Promise<any>;
  searchEmployees: (query: string) => Promise<any>;
  getProjectDetails: (projectId: string) => Promise<any>;
  searchProjects: (query: string) => Promise<any>;
  getEmployeeTasks: (employeeId: string) => Promise<any>;
  processWithTools: (messages: AIMessage[], provider: AIProviderInterface) => Promise<{ content: string }>;
}

const processWithTools = async (messages: AIMessage[], provider: AIProviderInterface): Promise<{ content: string }> => {
  try {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    // Here you would implement the actual tool calling logic
    // For now, we'll just return a simple response
    return {
      content: "I've processed your request with the available tools."
    };
  } catch (error) {
    console.error('Error processing with tools:', error);
    return {
      content: 'Sorry, I encountered an error while processing your request.'
    };
  }
};

export const ToolAIService: ToolAIServiceType = {
  ...aiTools,
  processWithTools
};

export default ToolAIService;
