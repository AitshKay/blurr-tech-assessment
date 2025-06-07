import { ChatAIProvider } from '../types';
import { PROVIDERS } from '../constants/providers';

// Create a deep clone of the providers to make them mutable
export const createMutableProviders = (): ChatAIProvider[] => {
  return JSON.parse(JSON.stringify(PROVIDERS)) as ChatAIProvider[];
};

export const MUTABLE_PROVIDERS = createMutableProviders();
