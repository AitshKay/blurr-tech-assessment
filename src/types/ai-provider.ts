export type AIModel = {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  contextWindow: number;
  supportsFunctionCalling: boolean;
  supportsVision?: boolean;
  isFree?: boolean;
  description?: string;
  deprecated?: boolean;
};

export type AIProvider = {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  models: AIModel[];
  defaultModel: string;
};

export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  timestamp?: Date | string | number;
  metadata?: Record<string, any>;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIResponse {
  content: string;
  tool_calls?: ToolCall[];
  metadata?: Record<string, unknown>;
}

export interface AIProviderInterface {
  id: string;
  name: string;
  defaultModel?: string;
  
  initialize(config: any): Promise<void>;
  validateConfig(): Promise<boolean>;
  
  generateResponse(
    messages: AIMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      tools?: Array<{
        type: 'function';
        function: {
          name: string;
          description?: string;
          parameters: Record<string, any>;
        };
      }>;
      tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
      [key: string]: any;
    }
  ): Promise<AsyncIterable<any> | { content: string; tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }> }>;
  
  getModels(): Promise<AIModel[]>;
}

export type ProviderConfig = {
  id: string;
  name: string;
  apiKey: string;
  baseUrl: string;
  envKey?: string;
  requiresKey?: boolean;
  defaultModel?: string;
  models: AIModel[];
  [key: string]: any;
};

export type ChatSession = {
  id: string;
  providerId: string;
  model: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
};
