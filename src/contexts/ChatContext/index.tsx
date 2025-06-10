import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { ChatState, ChatAction, Message, MessageRole } from '@/contexts/ChatContext/types';
import { chatReducer } from '@/contexts/ChatContext/reducer';

// Default providers configuration
const DEFAULT_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0'],
    defaultModel: 'gemini-1.5-flash',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    defaultModel: 'claude-3-sonnet',
  },
  {
    id: 'alibaba',
    name: 'Alibaba',
    models: ['qwen-2', 'qwen-3'],
    defaultModel: 'qwen-2',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    models: ['llama3', 'mistral', 'gemma'],
    defaultModel: 'llama3',
    baseUrl: 'http://localhost:11434',
  },
];

const initialState: ChatState = {
  currentConversationId: null,
  conversations: {},
  providers: DEFAULT_PROVIDERS,
  currentProviderId: null,
  isSending: false,
  error: null,
};

type ChatContextType = {
  state: ChatState;
  actions: {
    createConversation: (providerId: string, model: string) => void;
    switchConversation: (conversationId: string) => void;
    deleteConversation: (conversationId: string) => void;
    sendMessage: (content: string) => Promise<void>;
    setProvider: (providerId: string) => void;
    setApiKey: (providerId: string, apiKey: string) => void;
    removeApiKey: (providerId: string) => void;
  };
  getCurrentConversation: () => {
    conversation: ChatState['conversations'][string] | null;
    messages: Message[];
    provider: ChatState['providers'][number] | undefined;
  };
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const createConversation = useCallback((providerId: string, model: string) => {
    dispatch({ type: 'CREATE_CONVERSATION', payload: { providerId, model } });
  }, []);

  const switchConversation = useCallback((conversationId: string) => {
    dispatch({ type: 'SWITCH_CONVERSATION', payload: { conversationId } });
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: { conversationId } });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentConversationId) return;
    
    const conversation = state.conversations[state.currentConversationId];
    if (!conversation) return;

    const provider = state.providers.find(p => p.id === conversation.providerId);
    if (!provider) {
      dispatch({ type: 'SET_ERROR', payload: 'Provider not found' });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      model: conversation.model,
      provider: conversation.providerId,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: state.currentConversationId, message: userMessage } });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Use the Gemini API
      const apiKey = provider.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is required');
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: content }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
            stopSequences: []
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
          ],
        }),
        ...(apiKey ? { headers: { 'x-goog-api-key': apiKey } } : {})
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        model: conversation.model,
        provider: conversation.providerId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: state.currentConversationId, message: assistantMessage } });
    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to send message' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentConversationId, state.conversations]);

  const setProvider = useCallback((providerId: string) => {
    dispatch({ type: 'SET_PROVIDER', payload: { providerId } });
  }, []);

  const setApiKey = useCallback((providerId: string, apiKey: string) => {
    dispatch({ type: 'SET_API_KEY', payload: { providerId, apiKey } });
  }, []);

  const removeApiKey = useCallback((providerId: string) => {
    dispatch({ type: 'REMOVE_API_KEY', payload: { providerId } });
  }, []);

  const getCurrentConversation = useCallback(() => {
    if (!state.currentConversationId) {
      return { conversation: null, messages: [], provider: undefined };
    }

    const conversation = state.conversations[state.currentConversationId] || null;
    const provider = conversation?.providerId 
      ? state.providers.find((p: { id: string }) => p.id === conversation.providerId)
      : undefined;

    return {
      conversation,
      messages: conversation?.messages || [],
      provider,
    };
  }, [state.currentConversationId, state.conversations, state.providers]);

  const contextValue = useMemo(() => ({
    state,
    actions: {
      createConversation,
      switchConversation,
      deleteConversation,
      sendMessage,
      setProvider,
      setApiKey,
      removeApiKey,
    },
    getCurrentConversation,
  }), [
    state,
    createConversation,
    switchConversation,
    deleteConversation,
    sendMessage,
    setProvider,
    setApiKey,
    removeApiKey,
    getCurrentConversation,
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
