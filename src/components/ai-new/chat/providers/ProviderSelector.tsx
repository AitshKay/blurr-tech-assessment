import { memo, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Key, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChat';
import { ApiKeyDialog } from './ApiKeyDialog';

export interface Provider {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  models?: string[];
  defaultModel?: string;
  apiKey?: string;
}

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string | null;
  onSelectProvider: (providerId: string) => void;
  onApiKeySaved?: (providerId: string, apiKey: string) => void;
  variant?: 'default' | 'minimal';
  className?: string;
}

// Default providers if none are provided
const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'ChatGPT, GPT-4, and other models',
    models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4-turbo',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gemini and other Google AI models',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0'],
    defaultModel: 'gemini-1.5-flash',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    defaultModel: 'claude-3-sonnet',
  },
  {
    id: 'alibaba',
    name: 'Alibaba',
    description: 'Qwen models',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    defaultModel: 'qwen-max',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models with Ollama',
    models: ['llama3', 'mistral', 'gemma'],
    defaultModel: 'llama3',
  },
];

export const ProviderSelector = memo(({
  variant = 'default',
  providers: externalProviders = [],
  selectedProviderId = null,
  onSelectProvider = () => {},
  onApiKeySaved,
  className = '',
}: ProviderSelectorProps) => {
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [apiKey, setLocalApiKey] = useState<string>('');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const { setApiKey: saveApiKey } = useChat();
  
  // Initialize providers
  useEffect(() => {
    const providersList = externalProviders.length > 0 ? externalProviders : DEFAULT_PROVIDERS;
    setAvailableProviders(providersList);
    
    // Set initial selected provider
    if (selectedProviderId) {
      const provider = providersList.find((p) => p.id === selectedProviderId);
      if (provider) {
        setSelectedProvider(provider);
        setLocalApiKey(provider.apiKey || '');
      } else if (providersList.length > 0) {
        setSelectedProvider(providersList[0]);
      }
    } else if (providersList.length > 0) {
      setSelectedProvider(providersList[0]);
    }
  }, [externalProviders, selectedProviderId]);
  
  const handleSelectProvider = useCallback((providerId: string) => {
    const provider = availableProviders.find((p) => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setLocalApiKey(provider.apiKey || '');
      onSelectProvider(providerId);
    }
  }, [availableProviders, onSelectProvider]);
  
  const handleApiKeyChange = useCallback((newApiKey: string) => {
    setLocalApiKey(newApiKey);
    if (selectedProvider) {
      saveApiKey(selectedProvider.id, newApiKey);
    }
  }, [selectedProvider, saveApiKey]);
  
  const handleSaveApiKey = useCallback(async (providerId: string, key: string) => {
    if (!selectedProvider) return false;
    
    setIsValidating(true);
    try {
      // Save the API key using the chat context
      await saveApiKey(providerId, key);
      setLocalApiKey(key);
      
      // Update the provider with the new API key
      const updatedProviders = availableProviders.map((p) => 
        p.id === providerId ? { ...p, apiKey: key } : p
      );
      setAvailableProviders(updatedProviders);
      
      // Close the dialog and show success message
      setIsApiKeyDialogOpen(false);
      toast.success(`API key for ${selectedProvider.name} saved successfully`);
      
      // First try to use the onApiKeySaved callback if provided
      if (onApiKeySaved) {
        await onApiKeySaved(providerId, key);
      }
      
      // Then ensure the provider is selected
      if (onSelectProvider) {
        onSelectProvider(providerId);
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to save API key:', error);
      toast.error(`Failed to save API key: ${errorMessage}`);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [selectedProvider, availableProviders, saveApiKey]);
  
  const handleOpenApiKeyDialog = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsApiKeyDialogOpen(true);
  }, []);
  
  const handleApiKeyDialogOpenChange = useCallback((open: boolean) => {
    setIsApiKeyDialogOpen(open);
  }, []);

  const renderProviderList = useCallback(() => {
    return availableProviders.map((provider) => (
      <DropdownMenuItem
        key={provider.id}
        onSelect={() => handleSelectProvider(provider.id)}
        className="flex items-center justify-between py-2"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{provider.name}</span>
            {provider.id === selectedProvider?.id && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </div>
          {provider.description && (
            <span className="text-xs text-muted-foreground">
              {provider.description}
            </span>
          )}
        </div>
      </DropdownMenuItem>
    ));
  }, [availableProviders, handleSelectProvider, selectedProvider]);

  if (variant === 'minimal' && selectedProvider) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{selectedProvider.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleOpenApiKeyDialog}
        >
          <Key className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // Render the provider selection dropdown with API key management
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>{selectedProvider?.name || 'Select a provider'}</span>
                <Plus className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Select AI Provider</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {renderProviderList()}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedProvider && (
        <ApiKeyDialog
          open={isApiKeyDialogOpen}
          onOpenChange={handleApiKeyDialogOpenChange}
          provider={{
            id: selectedProvider.id,
            name: selectedProvider.name
          }}
          initialApiKey={apiKey}
          onApiKeySaved={handleSaveApiKey}
        />
      )}
    </div>
  );
});

ProviderSelector.displayName = 'ProviderSelector';
