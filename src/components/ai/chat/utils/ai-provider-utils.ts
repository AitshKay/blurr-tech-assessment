// src/components/ai/chat/utils/ai-provider-utils.ts
import { ProviderConfig } from '@/types/ai-provider';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Gemini (Free)',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresKey: true,
    envKey: 'NEXT_PUBLIC_GEMINI_API_KEY',
    defaultModel: 'gemini-pro',
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'gemini',
        maxTokens: 32768,
        contextWindow: 32768,
        supportsFunctionCalling: true,
        isFree: true
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    requiresKey: true,
    envKey: 'NEXT_PUBLIC_OPENAI_API_KEY',
    defaultModel: 'gpt-3.5-turbo',
    models: [
      { 
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        maxTokens: 16385,
        contextWindow: 16385,
        supportsFunctionCalling: true,
        isFree: false
      },
      { 
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        maxTokens: 128000,
        contextWindow: 128000,
        supportsFunctionCalling: true,
        isFree: false
      },
    ],
  },
  {
    id: 'google-ai',
    name: 'Google AI',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresKey: true,
    envKey: 'NEXT_PUBLIC_GOOGLE_AI_KEY',
    defaultModel: 'gemini-pro',
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google-ai',
        maxTokens: 32768,
        contextWindow: 32768,
        supportsFunctionCalling: true,
        isFree: false
      },
    ],
  },
];

export const getProviderById = (id: string): ProviderConfig | undefined => {
  return PROVIDERS.find(provider => provider.id === id);
};

export const getEnv = (key: string): string => {
  if (typeof window === 'undefined') return '';
  return process.env[key] || '';
};