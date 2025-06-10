import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

// Types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  isDefault?: boolean;
  description?: string;
  capabilities?: string[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

interface ModelState {
  models: Record<string, AIModel[]>;
  defaultModels: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  setModels: (providerId: string, models: AIModel[]) => void;
  setDefaultModel: (providerId: string, modelId: string) => void;
  getProviderModels: (providerId: string) => AIModel[];
  getDefaultModel: (providerId: string) => AIModel | undefined;
  fetchModels: (providerId: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
}

// Default models for different providers
const DEFAULT_MODELS: Record<string, AIModel[]> = {
  google: [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      isDefault: true,
      description: 'Best model for general use cases',
    },
  ],
  openai: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      isDefault: true,
      description: 'Most capable model, optimized for complex tasks',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Balanced performance and speed',
    },
  ],
};

// Helper function to get default models and default model IDs
const getDefaultModels = () => {
  const models: Record<string, AIModel[]> = {};
  const defaultModels: Record<string, string> = {};

  Object.entries(DEFAULT_MODELS).forEach(([provider, providerModels]) => {
    models[provider] = [...providerModels];
    const defaultModel = providerModels.find((m) => m.isDefault) || providerModels[0];
    if (defaultModel) {
      defaultModels[provider] = defaultModel.id;
    }
  });

  return { models, defaultModels };
};

const STORAGE_KEY = 'ai-model-store';

// Safe storage wrapper for SSR
const createSafeStorage = (key: string): StateStorage => {
  const storage: StateStorage = {
    getItem: (name: string) => {
      if (typeof window === 'undefined') return null;
      try {
        const value = localStorage.getItem(name);
        return value;
      } catch (error) {
        console.warn(`Error reading from localStorage: ${error}`);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(name, value);
      } catch (error) {
        console.warn(`Error writing to localStorage: ${error}`);
      }
    },
    removeItem: (name: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn(`Error removing from localStorage: ${error}`);
      }
    },
  };
  return storage;
};

// Define store actions separately for better type safety
interface ModelActions {
  setModels: (providerId: string, newModels: AIModel[]) => void;
  setDefaultModel: (providerId: string, modelId: string) => void;
  getProviderModels: (providerId: string) => AIModel[];
  getDefaultModel: (providerId: string) => AIModel | undefined;
  fetchModels: (providerId: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
}

type Store = ModelState & ModelActions;

// Current store version for migration
const STORE_VERSION = 1;

// Create the store with simplified state management
export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => {
      const defaultState = getDefaultModels();

      return {
        ...defaultState,
        isLoading: false,
        error: null,

        // Actions
        setModels: (providerId, newModels) => {
          if (!newModels?.length) return;
          
          set((state) => {
            const currentDefault = state.defaultModels[providerId];
            const providerModels = newModels;
            let newDefaultModels = { ...state.defaultModels };

            // Only set default model if not already set
            if (!currentDefault && newModels.length > 0) {
              const defaultModel = newModels.find(m => m.isDefault) || newModels[0];
              if (defaultModel) {
                newDefaultModels[providerId] = defaultModel.id;
              }
            }


            return {
              models: {
                ...state.models,
                [providerId]: providerModels,
              },
              defaultModels: newDefaultModels
            };
          });
        },

        setDefaultModel: (providerId, modelId) => {
          set((state) => ({
            defaultModels: {
              ...state.defaultModels,
              [providerId]: modelId,
            },
          }));
        },

        getProviderModels: (providerId) => {
          return get().models[providerId] || [];
        },

        getDefaultModel: (providerId) => {
          const defaultModelId = get().defaultModels[providerId];
          if (!defaultModelId) return undefined;
          
          const providerModels = get().models[providerId] || [];
          return providerModels.find((m) => m.id === defaultModelId) || providerModels[0];
        },

        fetchModels: async (providerId) => {
          const { setLoading, setError, setModels } = get();
          
          try {
            setLoading(true);
            setError(null);
            
            // In a real app, this would be an API call
            // const response = await fetch(`/api/providers/${providerId}/models`);
            // const models = await response.json();
            
            // For now, use default models
            const models = DEFAULT_MODELS[providerId] || [];
            setModels(providerId, models);
          } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch models';
            setError(error);
          } finally {
            setLoading(false);
          }
        },

        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        initialize: () => {
          const { models } = getDefaultModels();
          set({ models });
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => createSafeStorage(STORAGE_KEY)),
      partialize: (state) => ({
        models: state.models,
        defaultModels: state.defaultModels,
      }),
      migrate: (persistedState: any) => {
        if (!persistedState) return null;
        return persistedState as ModelState;
      },
      onRehydrateStorage: () => (state) => {
        // Optional: Add any post-hydration logic here
      },
    }
  )
);

// Optimized hooks with stable references
import { useCallback } from 'react';

// Stable empty array reference to prevent re-renders
const EMPTY_MODELS: AIModel[] = [];

// Ensure stable reference for empty models array
export const useProviderModels = (providerId: string): AIModel[] => {
  return useModelStore(
    useCallback((state) => state.models[providerId] ?? EMPTY_MODELS, [providerId])
  );
};

// Ensure stable reference for empty models array
export const useDefaultModel = (providerId: string): AIModel | undefined => {
  return useModelStore(
    useCallback(
      (state) => {
        const defaultModelId = state.defaultModels[providerId];
        if (!defaultModelId) return undefined;

        const providerModels = state.models[providerId] ?? EMPTY_MODELS;
        return providerModels.find((m) => m.id === defaultModelId) || providerModels[0];
      },
      [providerId]
    )
  );
};

// SSR-compatible selector hook with stable reference
// SSR-compatible selector hook with stable reference and server snapshot logic
import { useStore } from '@/hooks/useStore';
const getServerSnapshot = () => useModelStore.getState();

export function useModelStoreSSR<T>(selector: (state: ModelState) => T): T {
  return useStore(useModelStore, selector, () => selector(getServerSnapshot()));
}

