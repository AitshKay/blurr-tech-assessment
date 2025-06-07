import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAIChat } from "@/contexts/ai-chat-context";
import { ProviderConfig } from "@/types/ai-provider";

type ProviderType = 'google' | 'openai' | 'anthropic' | 'custom';

const PROVIDERS: { id: ProviderType; name: string; apiKeyName: string; baseUrl?: string }[] = [
  {
    id: 'google',
    name: 'Google AI',
    apiKeyName: 'GOOGLE_API_KEY',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiKeyName: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyName: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com',
  },
  {
    id: 'custom',
    name: 'Custom',
    apiKeyName: 'API_KEY',
  },
];

export const ProviderSettings: React.FC = () => {
  const { initializeProvider, isInitialized, isLoading, error, activeProvider } = useAIChat();
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('google');
  const [apiKey, setApiKey] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currentProvider = PROVIDERS.find(p => p.id === selectedProvider);
  const baseUrl = selectedProvider === 'custom' ? customBaseUrl : currentProvider?.baseUrl || '';

  // Load saved settings from localStorage and initialize provider
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = localStorage.getItem('aiProviderSettings');
      if (savedSettings) {
        try {
          const { provider, apiKey, baseUrl } = JSON.parse(savedSettings);
          setSelectedProvider(provider || 'google');
          setApiKey(apiKey || '');
          setCustomBaseUrl(baseUrl || '');
          
          // Initialize provider if we have an API key
          if (apiKey) {
            await initializeProvider({
              id: provider || 'google',
              name: PROVIDERS.find(p => p.id === (provider || 'google'))?.name || 'Google AI',
              apiKey,
              baseUrl: provider === 'custom' ? baseUrl : undefined
            });
          }
        } catch (e) {
          console.error('Failed to load AI provider settings', e);
        }
      }
    };
    
    loadSettings();
  }, [initializeProvider]);

  const handleSave = async () => {
    if (!currentProvider) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const config: ProviderConfig = {
        id: selectedProvider,
        name: currentProvider.name,
        apiKey,
      };

      if (baseUrl) {
        config.baseUrl = baseUrl;
      }

      // Save to localStorage
      localStorage.setItem('aiProviderSettings', JSON.stringify({
        provider: selectedProvider,
        apiKey,
        baseUrl,
      }));

      // Initialize the provider
      await initializeProvider(config);
      
      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully!',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
      
      // Clear the status after 3 seconds
      if (saveStatus) {
        setTimeout(() => {
          setSaveStatus(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">AI Provider Settings</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="provider">Provider</Label>
          <Select
            value={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value as ProviderType)}
            disabled={isLoading || isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="apiKey">
            {currentProvider?.name} API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder={`Enter your ${currentProvider?.name} API key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading || isSaving}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your API key is stored locally in your browser
          </p>
        </div>

        {selectedProvider === 'custom' && (
          <div>
            <Label htmlFor="baseUrl">API Base URL</Label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="https://api.example.com/v1"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              disabled={isLoading || isSaving}
            />
          </div>
        )}

        {saveStatus && (
          <div className={`p-2 rounded-md ${saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {saveStatus.message}
          </div>
        )}

        {error && (
          <div className="p-2 rounded-md bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!apiKey || isLoading || isSaving || (selectedProvider === 'custom' && !customBaseUrl)}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
