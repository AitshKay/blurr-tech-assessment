import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encryptData, decryptData } from '@/lib/crypto';
import { createSafeStorage } from '@/lib/storage';
import { useStore } from '@/hooks/useStore';

export type AIProvider = {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  requiresKey: boolean;
  models: string[];
  defaultModel: string;
  envKey?: string;
  icon?: string;
  description?: string;
};

type ProviderState = {
  // Available AI providers
  providers: AIProvider[];
  
  // API keys (encrypted)
  apiKeys: Record<string, string>;
  
  // Selected provider ID
  selectedProviderId: string | null;
  
  // Current provider (derived state)
  provider: AIProvider | null;
  
  // Current API key (decrypted)
  apiKey: string | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedProvider: (providerId: string) => void;
  setApiKey: (providerId: string, apiKey: string) => void;
  removeApiKey: (providerId: string) => void;
  addProvider: (provider: AIProvider) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

const STORAGE_KEY = 'ai-provider-store';
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'dev-key';

// Default providers configuration
const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'google',
    name: 'Google',
    displayName: 'Google AI',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresKey: true,
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-1.5-flash',
    envKey: 'GOOGLE_API_KEY',
    icon: 'G',
    description: 'Google\'s latest AI models'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    requiresKey: true,
    models: ['gpt-4o', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    envKey: 'OPENAI_API_KEY',
    icon: 'O',
    description: 'OpenAI\'s powerful language models'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresKey: true,
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    defaultModel: 'claude-3-sonnet-20240229',
    envKey: 'ANTHROPIC_API_KEY',
    icon: 'A',
    description: 'Claude models by Anthropic'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    displayName: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    requiresKey: false,
    models: ['llama3', 'mistral', 'codellama'],
    defaultModel: 'llama3',
    icon: 'O',
    description: 'Run models locally with Ollama'
  }
];

// Create the store with proper typing
const store = create<ProviderState>()(
  persist(
    (set, get) => ({
      providers: DEFAULT_PROVIDERS,
      apiKeys: {},
      selectedProviderId: null,
      provider: null,
      apiKey: null,
      isLoading: false,
      error: null,

      setSelectedProvider: (providerId) => {
        const provider = get().providers.find(p => p.id === providerId) || null;
        const apiKey = provider?.id ? get().apiKeys[provider.id] || null : null;
        
        set({
          selectedProviderId: providerId,
          provider,
          apiKey: apiKey ? decryptData(apiKey, ENCRYPTION_KEY) : null
        });
      },

      setApiKey: (providerId, apiKey) => {
        const encryptedKey = encryptData(apiKey, ENCRYPTION_KEY);
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [providerId]: encryptedKey,
          },
          apiKey: apiKey,
        }));
      },

      removeApiKey: (providerId) => {
        const { [providerId]: _, ...remainingKeys } = get().apiKeys;
        set({
          apiKeys: remainingKeys,
          apiKey: null,
        });
      },

      addProvider: (provider) => {
        set((state) => ({
          providers: [...state.providers, provider],
        }));
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        selectedProviderId: state.selectedProviderId,
      }),
    }
  )
);

// Create a stable reference for the server snapshot
// Stable getServerSnapshot for SSR (returns same reference unless state changes)
const getServerSnapshot = () => store.getState();

// Hook to use the store with proper server-side rendering
export function useProviderStore<T>(selector: (state: ProviderState) => T): T {
  return useStore(store, selector, () => selector(getServerSnapshot()));
}

export const useProviderStoreSSR = useProviderStore;

// Helper hooks
export function useSelectedProvider() {
  return useProviderStore((state) => ({
    provider: state.provider,
    apiKey: state.apiKey,
    setSelectedProvider: state.setSelectedProvider,
    setApiKey: state.setApiKey,
    removeApiKey: state.removeApiKey,
  }));
}

export function useProviderActions() {
  return useProviderStore((state) => ({
    setLoading: state.setLoading,
    setError: state.setError,
    addProvider: state.addProvider,
  }));
}
