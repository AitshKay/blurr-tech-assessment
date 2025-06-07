// src/components/ai/chat/hooks/useAIAssistant.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAIChat } from '@/contexts/ai-chat-context';
import { aiTools } from '@/services/ai/ai-tools';
import { AIMessage } from '@/types/ai-provider';
import { PROVIDERS, getEnv, getProviderById } from '../utils/ai-provider-utils';

export function useAIAssistant(initialMessage?: string) {
  const { 
    messages, 
    sendMessage: originalSendMessage, 
    isLoading: isLoadingContext, 
    error: chatError, 
    isInitialized,
    initializeProvider,
    createSession,
  } = useAIChat();
  
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [localWelcomeMessage, setLocalWelcomeMessage] = useState<AIMessage | null>(null);

  const isLoading = isLoadingContext || isInitializing || isProcessingTool;
  const error = localError || chatError;

  // Load saved API key from localStorage and initialize provider if possible
  useEffect(() => {
    const initProvider = async () => {
      if (isInitialized || !selectedProvider) return;
      
      try {
        setIsInitializing(true);
        const envKey = selectedProvider.envKey || '';
        const savedKey = typeof window !== 'undefined' ? localStorage.getItem(envKey) || '' : '';
        
        setApiKey(savedKey);
        
        // Only try to initialize if we have a key
        if (savedKey) {
          await initializeProvider({
            ...selectedProvider,
            apiKey: savedKey,
            baseUrl: selectedProvider.baseUrl || ''
          });
          await createSession();
        }
      } catch (error) {
        console.error('Error initializing provider:', error);
        setLocalError('Failed to initialize AI provider. Please check your API key and try again.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    initProvider();
  }, [selectedProvider, isInitialized, initializeProvider, createSession]);

  // Handle provider change
  const handleProviderChange = useCallback((providerId: string) => {
    const provider = getProviderById(providerId) || PROVIDERS[0];
    setSelectedProvider(provider);
  }, []);

  // Process tool commands
  const processToolCommand = useCallback(async (content: string): Promise<AIMessage | null> => {
    if (!content.startsWith('/')) return null;
    
    const [command, ...args] = content.slice(1).split(' ');
    
    // Handle help command
    if (command === 'help' || command === '?') {
      const availableTools = Object.entries(aiTools)
        .map(([name]) => `• /${name}`)
        .join('\n');
      
      return {
        role: 'assistant',
        content: `## Available Commands\n\n${availableTools}\n\nType /command followed by any arguments to execute a command.`,
        metadata: {
          toolCommand: 'help',
          isSystem: true,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    const tool = aiTools[command as keyof typeof aiTools];
    if (!tool) {
      throw new Error(`Unknown tool: ${command}. Type /help to see available commands.`);
    }
    
    try {
      setIsProcessingTool(true);
      const input = args.join(' ').trim();
      const parsedInput = input.startsWith('{') && input.endsWith('}') 
        ? JSON.parse(input)
        : input;
      
      const result = await tool(parsedInput);
      
      return {
        role: 'assistant',
        content: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        metadata: {
          toolCommand: command,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`Error executing tool ${command}:`, error);
      throw new Error(`Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingTool(false);
    }
  }, []);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    try {
      // Check if it's a tool command
      const toolResponse = await processToolCommand(content);
      if (toolResponse) {
        await originalSendMessage(toolResponse);
        return;
      }
      
      // Otherwise, send as regular message
      await originalSendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to send message');
    }
  }, [isLoading, originalSendMessage, processToolCommand]);

  // Handle saving API key
  const handleSaveApiKey = useCallback(async (key: string) => {
    if (!key.trim()) return;
    
    try {
      setIsInitializing(true);
      setLocalError(null);
      
      // Save the key to local storage if provider has an envKey
      if (selectedProvider.envKey) {
        localStorage.setItem(selectedProvider.envKey, key);
      }
      
      // Update the provider with the new key and initialize
      const updatedProvider = {
        ...selectedProvider,
        apiKey: key,
        baseUrl: selectedProvider.baseUrl || ''
      };
      
      await initializeProvider(updatedProvider);
      await createSession();
      
      // Update the selected provider in state
      setSelectedProvider(updatedProvider);
      setShowApiKeyDialog(false);
    } catch (error) {
      console.error('Error initializing provider:', error);
      setLocalError('Failed to initialize AI provider. Please check your API key and try again.');
      // Don't re-throw, we're handling the error state with localError
    } finally {
      setIsInitializing(false);
    }
  }, [selectedProvider, initializeProvider, createSession]);

  // Add initial welcome message
  useEffect(() => {
    if (isInitialized && messages.length === 0 && initialMessage && !localWelcomeMessage) {
      const welcomeMessage: AIMessage = {
        role: 'assistant',
        content: initialMessage,
        metadata: {
          isSystem: true,
          timestamp: new Date().toISOString()
        }
      };
      setLocalWelcomeMessage(welcomeMessage);
    }
  }, [isInitialized, messages.length, initialMessage, localWelcomeMessage]);

  // Combine messages with local welcome message
  const combinedMessages = useMemo(() => {
    const allMessages = [...messages];
    if (localWelcomeMessage) {
      allMessages.unshift(localWelcomeMessage);
    }
    return allMessages;
  }, [messages, localWelcomeMessage]);

  return {
    // State
    messages: localWelcomeMessage ? [localWelcomeMessage, ...messages] : messages,
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
    setApiKey,
    setShowApiKeyDialog,
    
    // Provider and session management
    initializeProvider: async (config: any) => {
      try {
        setIsInitializing(true);
        await initializeProvider({
          ...selectedProvider,
          ...config,
          baseUrl: selectedProvider.baseUrl || ''
        });
      } finally {
        setIsInitializing(false);
      }
    },
    createSession: async (modelId?: string) => {
      try {
        setIsInitializing(true);
        return await createSession(modelId);
      } finally {
        setIsInitializing(false);
      }
    }
  };
}