import { AIModel, ProviderConfig } from "@/types/ai-provider";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  envKey?: string;
  requiresKey: boolean;
  models: AIModel[];
  apiKey?: string;
}

export interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initializeProvider: (config: ProviderConfig) => Promise<void>;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export interface MessageInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export interface ProviderSelectorProps {
  selectedProviderId: string;
  onProviderChange: (providerId: string) => void;
  providers: AIProvider[];
}

export interface ApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSave: () => void;
  providerName: string;
  isLoading: boolean;
  envKey?: string;
}
