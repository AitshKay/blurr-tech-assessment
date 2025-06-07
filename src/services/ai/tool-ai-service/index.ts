import { AIProviderInterface } from '@/types/ai-provider';
import { aiTools } from '../ai-tools';
import { ProcessWithToolsOptions, ToolResponse } from './types';
import { getToolDefinitions } from './tool-definitions';
import { handleStreamingResponse, handleToolCalls } from './stream-handler';

export class ToolAIService {
  static async processWithTools({
    messages,
    provider,
    availableTools = aiTools
  }: ProcessWithToolsOptions): Promise<ToolResponse> {
    try {
      const toolDefinitions = getToolDefinitions(availableTools);
      const response = await provider.generateResponse(
        messages,
        {
          tools: toolDefinitions,
          tool_choice: 'auto',
        }
      );

      // If the response is a string, return it directly
      if (typeof response === 'string') {
        return { content: response };
      }

      // Handle streaming response
      if (Symbol.asyncIterator in response) {
        return handleStreamingResponse(
          response as AsyncIterable<any>,
          messages,
          provider,
          availableTools
        );
      }

      // Handle tool calls in the response
      if (response.tool_calls?.length) {
        return handleToolCalls(
          {
            content: response.content || '',
            tool_calls: response.tool_calls
          },
          messages,
          provider,
          availableTools
        );
      }

      // If no tool calls, return the content
      const metadata = response && typeof response === 'object' && 'metadata' in response 
        ? response.metadata as Record<string, unknown> 
        : undefined;
        
      return { 
        content: response.content || 'No response generated',
        metadata
      };
    } catch (error) {
      console.error('Error in processWithTools:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.` 
      };
    }
  }

  // Re-export types and other utilities
  static getToolDefinitions = getToolDefinitions;
}

// Default export for backward compatibility
export default ToolAIService;
