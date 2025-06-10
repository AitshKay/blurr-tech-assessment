import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, MessageSquare } from 'lucide-react';
import { useChat, useSelectedProvider } from '@/hooks/useChat';
import { ProviderSelector } from './providers/ProviderSelector';
import { MessageList } from './messages/MessageList';
import { MessageInput } from './messages/MessageInput';
import { ModelSelector } from './sidebar/ModelSelector';
import { ConversationList } from './sidebar/ConversationList';
import type { Message, Provider } from '@/contexts/ChatContext/types';

interface AIChatProps {
  className?: string;
}

// Import ConversationItem type from ConversationList
import type { ConversationItem } from './sidebar/ConversationList';

export function AIChat({ className = '' }: AIChatProps) {
  const initialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get chat state and actions
  const {
    currentConversation,
    currentProvider: provider,
    providers,
    isSending,
    messages = [],
    createConversation,
    sendMessage,
    setProvider,
    setApiKey,
  } = useChat();
  
  const {
    setSelectedProvider,
    setApiKey: setProviderApiKey,
    removeApiKey,
  } = useSelectedProvider();

  // Initialize a new conversation when provider changes
  useEffect(() => {
    if (provider && !currentConversation) {
      const defaultModel = provider.defaultModel || provider.models?.[0];
      if (defaultModel) {
        createConversation(provider.id, defaultModel);
      }
    }
  }, [provider, currentConversation, createConversation]);
  
  // Set initial showSettings state based on provider and API key
  useEffect(() => {
    if (provider) {
      setShowSettings(!provider.apiKey);
    }
  }, [provider]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentConversation?.id) return;
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentConversation, sendMessage]);
  
  const handleSetApiKey = useCallback(async (apiKey: string) => {
    if (!provider?.id) return false;
    try {
      await setProviderApiKey(provider.id, apiKey);
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  }, [provider, setProviderApiKey]);
  
  const handleRemoveApiKey = useCallback(() => {
    if (!provider?.id) return;
    removeApiKey(provider.id);
  }, [provider, removeApiKey]);
  
  const handleSelectProvider = useCallback(async (providerId: string) => {
    try {
      await setSelectedProvider(providerId);
      
      // Check if the selected provider has an API key
      const selectedProvider = providers.find(p => p.id === providerId);
      if (!selectedProvider) return;
      
      // If the provider doesn't have an API key, open the API key dialog
      if (!selectedProvider.apiKey) {
        // The ProviderSelector will handle opening the dialog
        return;
      }
      
      // If we have a valid provider with an API key, ensure we have a conversation
      if (!currentConversation) {
        const defaultModel = selectedProvider.defaultModel || selectedProvider.models?.[0];
        if (defaultModel) {
          createConversation(providerId, defaultModel);
        }
      }
    } catch (error) {
      console.error('Failed to select provider:', error);
    }
  }, [setSelectedProvider, providers, currentConversation, createConversation]);
  
  // Format conversations for the ConversationList component
  const conversations: ConversationItem[] = []; // TODO: Populate from your chat context
  
  // Get the current model from the conversation or provider
  const currentModel = useMemo(() => {
    return currentConversation?.model || 
           (provider?.models && provider.models[0]) || 
           '';
  }, [currentConversation?.model, provider?.models]);
  
  // Handle model selection
  const handleModelSelect = useCallback((modelId: string) => {
    if (!currentConversation?.id || !provider?.id) return;
    // TODO: Implement model update logic
    console.log(`Switching to model ${modelId} for conversation ${currentConversation.id}`);
  }, [currentConversation, provider]);
  
  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    // TODO: Implement conversation switching
    console.log(`Switching to conversation ${conversationId}`);
  }, []);
  
  // Handle conversation deletion
  const handleDeleteConversation = useCallback((conversationId: string) => {
    // TODO: Implement conversation deletion
    console.log(`Deleting conversation ${conversationId}`);
  }, []);

  // State for toggling between chat and settings
  const [showSettings, setShowSettings] = useState(false);
  
  // Toggle between chat and settings
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);
  
  // Show settings if no provider is selected or if settings are toggled
  if (!provider || showSettings) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>AI Provider Settings</CardTitle>
          {provider && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSettings}
              title="Back to chat"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ProviderSelector 
            providers={providers}
            selectedProviderId={provider?.id || null}
            onSelectProvider={handleSelectProvider}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with settings toggle */}
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-semibold">AI Chat</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSettings}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Providers</h3>
          <ProviderSelector
            providers={providers}
            selectedProviderId={provider.id}
            onSelectProvider={handleSelectProvider}
            onApiKeySaved={async (providerId, apiKey) => {
              await setProviderApiKey(providerId, apiKey);
              // Ensure the provider is selected after saving the API key
              handleSelectProvider(providerId);
            }}
          />
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Models</h3>
          <ModelSelector
            providerId={provider?.id || ''}
            selectedModelId={currentModel}
            onSelectModel={handleModelSelect}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Conversations</h3>
          <ConversationList 
            conversations={conversations}
            currentConversationId={currentConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{currentConversation?.title || 'New Chat'}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {provider.name} • {currentModel}
            </div>
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            isSending={isSending}
          />
        </div>
        
        <div className="p-4 border-t">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isSending={isSending}
            apiKey={provider?.apiKey}
            onApiKeyChange={handleSetApiKey}
            onRemoveApiKey={handleRemoveApiKey}
            className="mt-4"
          />
        </div>
        </div>
      </div>
    </div>
  );
}
