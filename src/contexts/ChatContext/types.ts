export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  providerId?: string;
}

export interface Provider {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  apiKey?: string;
}

export interface ChatState {
  currentConversationId: string | null;
  conversations: Record<string, Conversation>;
  providers: Provider[];
  currentProviderId: string | null;
  isSending: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'CREATE_CONVERSATION'; payload: { providerId: string; model: string } }
  | { type: 'SWITCH_CONVERSATION'; payload: { conversationId: string } }
  | { type: 'DELETE_CONVERSATION'; payload: { conversationId: string } }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_PROVIDER'; payload: { providerId: string } }
  | { type: 'SET_API_KEY'; payload: { providerId: string; apiKey: string } }
  | { type: 'REMOVE_API_KEY'; payload: { providerId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
