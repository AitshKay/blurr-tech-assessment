import { AIMessage, AIProviderInterface, ToolCall } from '@/types/ai-provider';

export interface ToolResponse {
  content: string;
  tool_calls?: ToolCall[];
  metadata?: Record<string, unknown>;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
  };
}

export interface ToolExecutorDependencies {
  provider: AIProviderInterface;
  availableTools: Record<string, Function>;
}

export interface ProcessWithToolsOptions {
  messages: AIMessage[];
  provider: AIProviderInterface;
  availableTools?: Record<string, Function>;
}
