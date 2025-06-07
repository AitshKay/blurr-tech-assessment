import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { chatService } from '@/services/ai/chat-service';
import { AIModel, AIMessage, ChatSession, ProviderConfig } from '@/types/ai-provider';
import { contextManager } from '@/services/ai/context-manager';

export interface AIProviderConfig extends Omit<ProviderConfig, 'apiKey'> {
  apiKey?: string;
  envKey?: string;
  requiresKey?: boolean;
  name: string;
  id: string;
  models: AIModel[];
}

interface SendMessageOptions {
  systemMessage?: AIMessage;
  userMessage?: AIMessage;
  assistantMessage?: AIMessage;
  stream?: boolean;
}

interface AIChatContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  session: ChatSession | null;
  messages: AIMessage[];
  availableModels: AIModel[];
  activeModel: string | null;
  currentModel: string | null;
  activeProvider: string | null;
  
  // Actions
  initializeProvider: (config: ProviderConfig) => Promise<void>;
  createSession: (modelId?: string) => Promise<ChatSession>;
  sendMessage: (content: string | { content: string; options?: SendMessageOptions }) => Promise<void>;
  clearSession: () => void;
  setActiveModel: (modelId: string | null) => void;
  setCurrentModel: (modelId: string) => void;
  setActiveProvider: (providerId: string | null) => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const AIChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  // Create a new chat session
  const createSession = useCallback(async (modelId?: string) => {
    if (!modelId && !activeModel) {
      throw new Error('No model selected');
    }
    try {
      setIsLoading(true);
      setError(null);
      
      const newSession = await chatService.createSession(modelId || activeModel || undefined);
      setSession(newSession);
      setMessages(newSession.messages);
      
      return newSession;
    } catch (err) {
      console.error('Failed to create chat session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeModel]);

  // Initialize the chat service
  const initializeProvider = useCallback(async (config: AIProviderConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use API key from config or environment variable
      const apiKey = config.apiKey || (config.envKey ? process.env[config.envKey] as string : '');
      
      if (!apiKey && config.requiresKey !== false) {
        throw new Error(`API key is required for ${config.name}`);
      }
      
      const provider = await chatService.initializeProvider({
        ...config,
        apiKey
      } as ProviderConfig);
      
      setActiveProvider(provider.id);
      setAvailableModels(provider.models);
      
      // Set the first free model as active if available, otherwise use the first model
      const freeModels = provider.models.filter(m => m.isFree);
      const defaultModel = freeModels.length > 0 ? freeModels[0].id : provider.models[0]?.id;
      
      if (defaultModel) {
        setActiveModel(defaultModel);
        setCurrentModel(defaultModel);
        setIsInitialized(true);
        
        // Create a new session with the default model
        await createSession(defaultModel);
      } else {
        throw new Error('No models available for this provider');
      }
    } catch (err) {
      console.error('Failed to initialize AI provider:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize AI provider';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [createSession]);



  // Send a message
  const sendMessage = useCallback(async (input: string | { content: string; options?: SendMessageOptions }) => {
    const content = typeof input === 'string' ? input : input.content;
    const options = typeof input === 'object' ? input.options : undefined;
    
    if (!session || !content.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Add system message if provided
      if (options?.systemMessage) {
        contextManager.addMessage(options.systemMessage);
        setMessages(prev => [...prev, options.systemMessage!]);
      }
      
      // Add user message to context
      const userMessage = options?.userMessage || {
        id: `msg-${Date.now()}`,
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString()
      };
      
      // Only add to context if not already added via options
      if (!options?.userMessage) {
        contextManager.addMessage(userMessage);
      }
      
      // Get conversation context
      const context = contextManager.getContext();
      
      // Send message with context
      const response = await chatService.sendMessage(session.id, content, { 
        stream: options?.stream ?? true,
        context: context.filter(msg => msg.id !== userMessage.id)
      });
      
      // Get the latest session state after sending the message
      const updatedSession = chatService.getSession(session.id);
      if (updatedSession) {
        setMessages(updatedSession.messages);
      }
      
      // Handle streaming response
      if (response && typeof response === 'object' && Symbol.asyncIterator in response) {
        let fullResponse = '';
        let assistantMessage: AIMessage | null = null;
        let assistantMessageId = `msg-${Date.now()}`;
        
        // Process streaming response
        for await (const chunk of response) {
          fullResponse += chunk;
          
          // Create or update assistant message
          if (!assistantMessage) {
            // Create new assistant message
            const newMessage: AIMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date().toISOString()
            };
            assistantMessage = newMessage;
            setMessages(prev => [...prev, newMessage]);
          } else {
            // Update existing assistant message
            const updatedMessage: AIMessage = { 
              ...assistantMessage, 
              content: fullResponse 
            };
            assistantMessage = updatedMessage;
            setMessages(prev => 
              prev.map(msg => msg.id === assistantMessageId ? updatedMessage : msg)
            );
          }
        }
        
        // Save the final response to the session and context
        if (assistantMessage) {
          await chatService.saveAssistantResponse(session.id, assistantMessage.content);
          contextManager.addMessage(assistantMessage);
        }
      } else if (typeof response === 'string') {
        // Handle non-streaming response
        const assistantMessage = options?.assistantMessage || {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        };
        
        await chatService.saveAssistantResponse(session.id, response);
        contextManager.addMessage(assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Clear the current session
  const clearSession = useCallback(() => {
    setSession(null);
    setMessages([]);
    contextManager.clearContext();
  }, []);

  // Update the active model
  const updateActiveModel = useCallback((modelId: string) => {
    setActiveModel(modelId);
    // When changing models, we should create a new session
    createSession(modelId);
  }, [createSession]);

  // Load available models when the provider changes
  useEffect(() => {
    const loadModels = async () => {
      if (isInitialized) {
        const models = await chatService.getAvailableModels();
        setAvailableModels(models);
      }
    };
    
    loadModels().catch(console.error);
  }, [isInitialized]);

  const value = useMemo(() => ({
    // State
    isInitialized,
    isLoading,
    error,
    session,
    messages,
    availableModels,
    activeModel,
    currentModel,
    activeProvider,
    
    // Actions
    initializeProvider,
    createSession,
    sendMessage,
    clearSession,
    setActiveModel,
    setCurrentModel,
    setActiveProvider,
  }), [
    isInitialized,
    isLoading,
    error,
    session,
    messages,
    availableModels,
    activeModel,
    currentModel,
    activeProvider,
    initializeProvider,
    createSession,
    sendMessage,
    clearSession,
    setActiveModel,
    setCurrentModel,
    setActiveProvider,
  ]);

  const contextValue = useMemo(() => ({
    isInitialized,
    isLoading,
    error,
    session,
    messages,
    availableModels,
    activeModel,
    currentModel,
    activeProvider,
    initializeProvider,
    createSession,
    sendMessage,
    clearSession,
    setActiveModel,
    setCurrentModel,
    setActiveProvider,
  }), [
    isInitialized,
    isLoading,
    error,
    session,
    messages,
    availableModels,
    activeModel,
    currentModel,
    activeProvider,
    initializeProvider,
    createSession,
    sendMessage,
    clearSession,
  ]);

  return (
    <AIChatContext.Provider value={contextValue}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = (): AIChatContextType => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

export const useAIChatInitializer = () => {
  const context = useAIChat();
  return {
    isInitialized: context.isInitialized,
    initializeProvider: context.initializeProvider,
    availableModels: context.availableModels,
    activeProvider: context.activeProvider,
    activeModel: context.activeModel,
    error: context.error,
  };
};
