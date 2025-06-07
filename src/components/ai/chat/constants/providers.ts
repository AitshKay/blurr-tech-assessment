import { AIModel } from "@/types/ai-provider";

export const PROVIDERS = [
  {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    envKey: 'NEXT_PUBLIC_GEMINI_API_KEY',
    requiresKey: true,
    models: [
      { 
        id: 'gemini-pro', 
        name: 'Gemini Pro', 
        provider: 'google',
        maxTokens: 8192,
        contextWindow: 8192,
        supportsFunctionCalling: true,
        isFree: true,
        description: 'Best for most tasks' 
      },
      { 
        id: 'gemini-1.5-pro', 
        name: 'Gemini 1.5 Pro', 
        provider: 'google',
        maxTokens: 8192,
        contextWindow: 8192,
        supportsFunctionCalling: true,
        isFree: false,
        description: 'More capable model' 
      },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    envKey: 'NEXT_PUBLIC_OPENAI_API_KEY',
    requiresKey: true,
    models: [
      { 
        id: 'gpt-3.5-turbo', 
        name: 'GPT-3.5 Turbo', 
        provider: 'openai',
        maxTokens: 4096,
        contextWindow: 4096,
        supportsFunctionCalling: true,
        isFree: false,
        description: 'Fast and capable' 
      },
      { 
        id: 'gpt-4', 
        name: 'GPT-4', 
        provider: 'openai',
        maxTokens: 8192,
        contextWindow: 8192,
        supportsFunctionCalling: true,
        isFree: false,
        description: 'Most capable model' 
      },
    ]
  },
  {
    id: 'local',
    name: 'Local Model',
    baseUrl: 'http://localhost:11434/api',
    requiresKey: false,
    models: [
      { 
        id: 'llama2', 
        name: 'Llama 2', 
        provider: 'local',
        maxTokens: 4096,
        contextWindow: 4096,
        supportsFunctionCalling: false,
        isFree: true,
        description: 'Local Llama 2 model' 
      },
      { 
        id: 'mistral', 
        name: 'Mistral', 
        provider: 'local',
        maxTokens: 4096,
        contextWindow: 4096,
        supportsFunctionCalling: false,
        isFree: true,
        description: 'Local Mistral model' 
      },
    ]
  }
] as const;
