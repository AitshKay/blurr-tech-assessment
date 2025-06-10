import type { ChatState, ChatAction, Provider } from '@/contexts/ChatContext/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CREATE_CONVERSATION': {
      const { providerId, model } = action.payload;
      const conversationId = generateId();
      const newConversation = {
        id: conversationId,
        title: `Conversation ${Object.keys(state.conversations).length + 1}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model,
        providerId,
      };

      return {
        ...state,
        currentConversationId: conversationId,
        currentProviderId: providerId,
        conversations: {
          ...state.conversations,
          [conversationId]: newConversation,
        },
      };
    }

    case 'SWITCH_CONVERSATION':
      return {
        ...state,
        currentConversationId: action.payload.conversationId,
      };

    case 'DELETE_CONVERSATION': {
      const { [action.payload.conversationId]: _, ...remainingConversations } = state.conversations;
      const newCurrentId = state.currentConversationId === action.payload.conversationId ? null : state.currentConversationId;
      
      return {
        ...state,
        currentConversationId: newCurrentId,
        conversations: remainingConversations,
      };
    }

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;

      return {
        ...state,
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: [...conversation.messages, message],
            updatedAt: Date.now(),
          },
        },
      };
    }

    case 'SET_PROVIDER':
      return {
        ...state,
        currentProviderId: action.payload.providerId,
      };

    case 'SET_API_KEY':
      return {
        ...state,
        providers: state.providers.map((provider: Provider) => 
          provider.id === action.payload.providerId
            ? { ...provider, apiKey: action.payload.apiKey }
            : provider
        ),
      };

    case 'REMOVE_API_KEY':
      return {
        ...state,
        providers: state.providers.map((provider: Provider) => 
          provider.id === action.payload.providerId
            ? { ...provider, apiKey: undefined }
            : provider
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isSending: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}
