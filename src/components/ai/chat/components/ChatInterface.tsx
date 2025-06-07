// src/components/ai/chat/components/ChatInterface.tsx
import { AIMessage } from '@/types/ai-provider';
import { SimpleChatInterface } from '../SimpleChatInterface';

interface ChatInterfaceProps {
  messages: AIMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  error,
  className = '',
}: ChatInterfaceProps) {
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <SimpleChatInterface
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        errorMessage={error}
      />
    </div>
  );
}