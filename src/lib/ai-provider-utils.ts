import { AIProviderConfig, AIRequest, AIResponse, AIErrorResponse } from '@/types/ai';

/**
 * Validates an API key for a given provider
 */
export function validateProviderAPIKey(providerId: string, apiKey: string): boolean {
  if (!apiKey) {
    return false;
  }

  // Provider-specific validation rules
  const validationRules: Record<string, (key: string) => boolean> = {
    openai: (key) => key.startsWith('sk-') && key.length > 30,
    google: (key) => key.startsWith('AI') && key.length > 20,
    anthropic: (key) => key.startsWith('sk-ant-') && key.length > 30,
  };

  const validator = validationRules[providerId];
  return validator ? validator(apiKey) : true; // Default to true if no specific validator
}

/**
 * Normalizes a request to the provider's expected format
 */
export function normalizeRequest(providerId: string, request: AIRequest): any {
  const baseRequest = {
    messages: request.messages,
    model: request.model,
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens,
    top_p: request.topP,
    frequency_penalty: request.frequencyPenalty,
    presence_penalty: request.presencePenalty,
    stop: request.stopSequences,
    stream: request.stream,
    n: request.n,
  };

  // Provider-specific request formatting
  switch (providerId) {
    case 'openai':
      return baseRequest;
      
    case 'google':
      return {
        ...baseRequest,
        prompt: {
          messages: request.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            content: msg.content,
          })),
        },
        temperature: baseRequest.temperature,
        candidateCount: baseRequest.n,
      };
      
    case 'anthropic':
      return {
        ...baseRequest,
        messages: request.messages,
        max_tokens_to_sample: baseRequest.max_tokens,
      };
      
    default:
      return baseRequest;
  }
}

/**
 * Normalizes a response from the provider to a standard format
 */
export function normalizeResponse(providerId: string, response: any): AIResponse | AIErrorResponse {
  // Handle error responses
  if ('error' in response) {
    return {
      error: {
        message: response.error.message || 'Unknown error',
        type: response.error.type || 'api_error',
        param: response.error.param || null,
        code: response.error.code || null,
      },
    } as AIErrorResponse;
  }

  // Provider-specific response normalization
  switch (providerId) {
    case 'openai':
      return response as AIResponse;
      
    case 'google': {
      const message = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        id: response.id || `gen-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.model || 'unknown',
        choices: [{
          message: {
            role: 'assistant',
            content: message,
          },
          index: 0,
          finish_reason: 'stop',
        }],
        usage: response.usage,
      } as AIResponse;
    }
      
    case 'anthropic':
      return {
        id: `cmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.model || 'claude',
        choices: [{
          message: {
            role: 'assistant',
            content: response.completion,
          },
          index: 0,
          finish_reason: response.stop_reason || 'stop',
        }],
      } as AIResponse;
      
    default:
      return response as AIResponse;
  }
}

/**
 * Creates headers for API requests to the provider
 */
export function createRequestHeaders(providerId: string, apiKey: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Provider-specific headers
  switch (providerId) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
      
    case 'google':
      headers['x-goog-api-key'] = apiKey;
      break;
      
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
  }

  return headers;
}
