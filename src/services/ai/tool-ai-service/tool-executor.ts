import { AIMessage } from '@/types/ai-provider';
import { ToolDefinition, ToolResponse } from './types';

export const executeToolCall = async (
  toolCall: { name: string; arguments: string; id: string },
  availableTools: Record<string, Function>
): Promise<AIMessage> => {
  const { name, arguments: args, id } = toolCall;
  const tool = availableTools[name];
  
  if (!tool) {
    throw new Error(`Tool ${name} not found`);
  }

  try {
    const parsedArgs = JSON.parse(args);
    const result = await tool(parsedArgs);
    
    return {
      role: 'tool' as const,
      content: JSON.stringify(result),
      name,
      tool_call_id: id
    };
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      role: 'tool' as const,
      content: JSON.stringify({ error: `Error executing ${name}: ${errorMessage}` }),
      name,
      tool_call_id: id
    };
  }
};

export const executeToolCalls = async (
  toolCalls: Array<{ name: string; arguments: string; id: string }>,
  availableTools: Record<string, Function>
): Promise<AIMessage[]> => {
  return Promise.all(
    toolCalls.map(toolCall => 
      executeToolCall(toolCall, availableTools)
    )
  );
};
