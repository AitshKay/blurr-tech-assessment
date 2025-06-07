import { AIMessage } from '@/types/ai-provider';
import { ToolResponse } from './types';
import { getToolDefinitions } from './tool-definitions';
import { executeToolCall } from './tool-executor';

export const handleStreamingResponse = async (
  stream: AsyncIterable<any>,
  messages: AIMessage[],
  provider: { generateResponse: (messages: AIMessage[], options: any) => Promise<any> },
  availableTools: Record<string, Function>
): Promise<ToolResponse> => {
  let accumulatedContent = '';
  let toolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = [];
  
  for await (const chunk of stream) {
    if (chunk.choices?.[0]?.delta?.content) {
      accumulatedContent += chunk.choices[0].delta.content;
    }
    
    // Handle tool calls in the stream
    if (chunk.choices?.[0]?.delta?.tool_calls) {
      for (const toolCall of chunk.choices[0].delta.tool_calls) {
        const index = toolCall.index || 0;
        if (!toolCalls[index]) {
          toolCalls[index] = { id: '', function: { name: '', arguments: '' } };
        }
        
        if (toolCall.id) {
          toolCalls[index].id = toolCall.id;
        }
        
        if (toolCall.function?.name) {
          toolCalls[index].function.name += toolCall.function.name;
        }
        
        if (toolCall.function?.arguments) {
          toolCalls[index].function.arguments += toolCall.function.arguments;
        }
      }
    }
  }

  // If we have tool calls, execute them
  if (toolCalls.length > 0) {
    return handleToolCalls(
      { content: accumulatedContent, tool_calls: toolCalls },
      messages,
      provider,
      availableTools
    );
  }

  return { content: accumulatedContent };
};

export const handleToolCalls = async (
  response: { content: string; tool_calls: Array<{ id: string; function: { name: string; arguments: string } }> },
  messages: AIMessage[],
  provider: { generateResponse: (messages: AIMessage[], options: any) => Promise<any> },
  availableTools: Record<string, Function>
): Promise<ToolResponse> => {
  const { content, tool_calls } = response;
  
  // Execute all tool calls in parallel
  const toolResponses = await Promise.all(
    tool_calls.map(toolCall => 
      executeToolCall(
        {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
          id: toolCall.id
        },
        availableTools
      )
    )
  );

  // Get final response with tool results
  const finalResponse = await provider.generateResponse(
    [
      ...messages,
      {
        role: 'assistant' as const,
        content: content || '',
        tool_calls: tool_calls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }))
      },
      ...toolResponses
    ],
    {
      tools: getToolDefinitions(availableTools),
      tool_choice: 'none'
    }
  );

  if (typeof finalResponse === 'string') {
    return { content: finalResponse };
  }

  // Handle streaming response if needed
  if (Symbol.asyncIterator in finalResponse) {
    let finalContent = '';
    for await (const chunk of finalResponse as AsyncIterable<any>) {
      if (chunk.choices?.[0]?.delta?.content) {
        finalContent += chunk.choices[0].delta.content;
      }
    }
    return { content: finalContent };
  }

  return { 
    content: finalResponse.content || 'No response generated' 
  };
};
