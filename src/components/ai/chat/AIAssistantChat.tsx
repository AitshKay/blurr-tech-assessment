import { useMemo, useEffect, useState } from 'react';
import { useAIChat } from '@/contexts/ai-chat-context';
import { ProviderSelector } from './components/ProviderSelector';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { ChatInterface } from './components/ChatInterface';
import { useAIAssistant } from './hooks/useAIAssistant';
import { PROVIDERS } from './utils/ai-provider-utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AIAssistantChatProps {
  className?: string;
  initialMessage?: string;
}

export function AIAssistantChat({ 
  className = '',
  initialMessage = 'Hello! How can I assist you today?'
}: AIAssistantChatProps = {}) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const {
    // State
    messages,
    isLoading,
    error,
    isInitialized,
    selectedProvider,
    showApiKeyDialog,
    apiKey,
    
    // Actions
    handleSendMessage,
    handleProviderChange,
    handleSaveApiKey,
    setShowApiKeyDialog,
    initializeProvider,
    createSession
  } = useAIAssistant(initialMessage);
  
  const availableProviders = useMemo(() => PROVIDERS, []);
  const isFreeProvider = selectedProvider?.models.some(model => model.isFree) || false;
  const shouldShowApiKeyButton = selectedProvider?.requiresKey && !apiKey && !isFreeProvider;

  // Handle initialization when component mounts or provider changes
  useEffect(() => {
    const initializeChat = async () => {
      if (!selectedProvider) return;
      
      // Skip initialization for free providers
      if (isFreeProvider) {
        try {
          await createSession();
        } catch (error) {
          console.error('Failed to initialize free provider:', error);
          setInitializationError('Failed to initialize chat. Please try again.');
        }
        return;
      }
      
      // For non-free providers, require API key
      if (!apiKey) return;
      
      try {
        setIsInitializing(true);
        setInitializationError(null);
        
        await initializeProvider({
          ...selectedProvider,
          apiKey,
          baseUrl: selectedProvider.baseUrl || ''
        });
        
        await createSession();
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setInitializationError('Failed to initialize chat. Please check your API key and try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [selectedProvider, apiKey, isFreeProvider, initializeProvider, createSession]);

  // Show error if initialization failed
  const errorToShow = initializationError || error;
  const showWelcomeScreen = !isInitialized || !selectedProvider;
  const isReady = isInitialized && selectedProvider && (!selectedProvider.requiresKey || apiKey || isFreeProvider);

  return (
    <div className={`flex flex-col h-screen bg-background ${className}`}>
      {/* Provider selector header */}
      <ProviderSelector
        providers={availableProviders}
        selectedProvider={selectedProvider || availableProviders[0]}
        onProviderChange={handleProviderChange}
        isLoading={isLoading || isInitializing}
        onApiKeyClick={() => setShowApiKeyDialog(true)}
        showApiKeyButton={!!shouldShowApiKeyButton}
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative">
        {errorToShow ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-md">
                {errorToShow}
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Try Again
              </Button>
            </div>
          </div>
        ) : showWelcomeScreen ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to AI Assistant</h2>
              <p className="text-muted-foreground mb-6">
                {selectedProvider
                  ? `Please set up ${selectedProvider.name} to get started.`
                  : 'Select a provider to begin chatting.'}
              </p>
              
              {shouldShowApiKeyButton && (
                <Button 
                  onClick={() => setShowApiKeyDialog(true)}
                  disabled={isLoading || isInitializing}
                  className="gap-2"
                >
                  {isInitializing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Set API Key for {selectedProvider?.name}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isInitializing}
            error={null}
          />
        )}
      </div>
      
      {/* API Key Dialog */}
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onClose={() => setShowApiKeyDialog(false)}
        onSave={handleSaveApiKey}
        isLoading={isLoading || isInitializing}
        providerName={selectedProvider?.name || 'AI Provider'}
      />
    </div>
  );
}