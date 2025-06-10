// AI Provider Configuration
export interface AIProviderConfig {
  // Core identification
  id?: string;
  providerId: string;
  providerName?: string;
  displayName?: string;
  
  // API configuration
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  defaultModel?: string;
  
  // Settings
  enabled?: boolean;
  isDefault?: boolean;
  lastUsedAt?: Date | string | null;
  
  // Request customization
  customHeaders?: Record<string, string>;
  timeout?: number;
  maxRetries?: number;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Request type for updating provider config
export interface AIProviderConfigRequest {
  providerId: string;
  apiKey?: string;
  modelName?: string;
  isDefault?: boolean;
  config?: Partial<Omit<AIProviderConfig, 'providerId' | 'apiKey' | 'modelName' | 'isDefault'>>;
}

// Standardized AI message format
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
  timestamp?: number;
}

// Standardized AI request format
export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
  n?: number;
  logitBias?: Record<string, number>;
  user?: string;
}

// Standardized AI response format
export interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: AIMessage;
    index: number;
    finish_reason: string; // Match API response format
    finishReason?: string; // Compatible with our internal format
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    promptTokens?: number; // For backward compatibility
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Error response format
export interface AIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string | null;
  } & {
    // Add validation result type
    isValid?: boolean;
  };
}

// Provider capabilities
export interface AIProviderCapabilities {
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsImageInput: boolean;
  supportsAudioInput: boolean;
  supportsVideoInput: boolean;
  supportsJSONMode: boolean;
  maxContextLength: number;
}

// Provider metadata
export interface AIProviderMetadata {
  name: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  documentationUrl?: string;
  pricingUrl?: string;
  statusUrl?: string;
  contactEmail?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}
