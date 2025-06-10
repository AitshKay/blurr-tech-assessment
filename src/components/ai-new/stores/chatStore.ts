import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSafeStorage } from '@/lib/storage';
import { useStore } from '@/hooks/useStore';

type MessageRole = 'user' | 'assistant' | 'system';

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  providerId?: string;
};

type ChatState = {
  // Current conversation
  currentConversationId: string | null;
  conversations: Record<string, Conversation>;
  
  // UI State
  isSending: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  createNewConversation: (providerId: string, model: string) => string;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateMessage: (messageId: string, content: string) => void;
  setError: (error: string | null) => void;
};

const STORAGE_KEY = 'ai-chat-store';

// Generate a simple ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Create the store with proper typing
const store = create<ChatState>()(
  persist(
    (set, get) => ({
      currentConversationId: null,
      conversations: {},
      isSending: false,
      error: null,

      sendMessage: async (content) => {
        const { currentConversationId, conversations } = get();
        if (!currentConversationId) return;

        const conversation = conversations[currentConversationId];
        if (!conversation) return;

        // Create user message
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
          model: conversation.model,
          provider: conversation.providerId,
        };

        // Add user message to conversation
        const updatedConversation = {
          ...conversation,
          messages: [...conversation.messages, userMessage],
          updatedAt: Date.now(),
        };

        set((state) => ({
          conversations: {
            ...state.conversations,
            [currentConversationId]: updatedConversation,
          },
          isSending: true,
        }));

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Create assistant message
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: `This is a simulated response to: ${content}`,
            timestamp: Date.now(),
            model: conversation.model,
            provider: conversation.providerId,
          };

          // Add assistant message to conversation
          set((state) => {
            const currentConv = state.conversations[currentConversationId];
            if (!currentConv) return state;

            return {
              conversations: {
                ...state.conversations,
                [currentConversationId]: {
                  ...currentConv,
                  messages: [...currentConv.messages, assistantMessage],
                  updatedAt: Date.now(),
                },
              },
              isSending: false,
            };
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: message, isSending: false });
          console.error('Error sending message:', error);
        }
      },

      createNewConversation: (providerId, model) => {
        const conversationId = generateId();
        const newConversation: Conversation = {
          id: conversationId,
          title: `New Chat ${Object.keys(get().conversations).length + 1}`,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model,
          providerId,
        };

        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: newConversation,
          },
          currentConversationId: conversationId,
        }));

        return conversationId;
      },

      switchConversation: (conversationId) => {
        if (get().conversations[conversationId]) {
          set({ currentConversationId: conversationId });
        }
      },

      deleteConversation: (conversationId) => {
        const { [conversationId]: _, ...remainingConversations } = get().conversations;
        set({
          conversations: remainingConversations,
          currentConversationId: get().currentConversationId === conversationId ? 
            Object.keys(remainingConversations)[0] || null : 
            get().currentConversationId
        });
      },

      updateMessage: (messageId, content) => {
        const { currentConversationId, conversations } = get();
        if (!currentConversationId) return;

        const conversation = conversations[currentConversationId];
        if (!conversation) return;

        const updatedMessages = conversation.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        );

        set({
          conversations: {
            ...conversations,
            [currentConversationId]: {
              ...conversation,
              messages: updatedMessages,
              updatedAt: Date.now(),
            },
          },
        });
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
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
);

// Create a stable reference for the server snapshot
const getServerSnapshot = () => store.getState();

// Hook to use the store with proper server-side rendering
export function useChatStore<T>(selector: (state: ChatState) => T): T {
  return useStore(store, selector, () => selector(getServerSnapshot()));
}

export const useChatStoreSSR = useChatStore;

// Helper hooks
export function useCurrentConversation() {
  return useChatStore((state) => {
    const conversation = state.currentConversationId 
      ? state.conversations[state.currentConversationId] 
      : null;
    
    return {
      conversation,
      messages: conversation?.messages || [],
      sendMessage: state.sendMessage,
      updateMessage: state.updateMessage,
    };
  });
}

export function useConversationList() {
  return useChatStore((state) => ({
    conversations: Object.values(state.conversations).sort(
      (a, b) => b.updatedAt - a.updatedAt
    ),
    currentConversationId: state.currentConversationId,
    createNewConversation: state.createNewConversation,
    switchConversation: state.switchConversation,
    deleteConversation: state.deleteConversation,
  }));
}
