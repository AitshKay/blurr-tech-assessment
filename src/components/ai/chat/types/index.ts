import { AIModel } from "@/types/ai-provider";

export interface ChatAIModel extends AIModel {
  isFree?: boolean;
  description?: string;
}

export interface ChatAIProvider {
  id: string;
  name: string;
  baseUrl: string;
  envKey?: string;
  requiresKey: boolean;
  models: ChatAIModel[];
  apiKey?: string;
  defaultModel?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  requiresKey: boolean;
  models: ChatAIModel[];
  apiKey?: string;
  defaultModel?: string; // Made optional to match usage
}

export interface MessageListProps {
  messages: ChatMessage[];
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
  providers: ChatAIProvider[];
  className?: string;
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
