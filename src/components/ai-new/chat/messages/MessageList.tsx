import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  provider?: string;
};

interface MessageListProps {
  messages: Message[];
  isSending: boolean;
  className?: string;
}

export function MessageList({ messages, isSending, className }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full text-muted-foreground', className)}>
        <p>Start a conversation with the AI assistant</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div className={cn(
            'max-w-[80%] rounded-lg px-4 py-3',
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            message.role === 'system' && 'bg-yellow-50 dark:bg-yellow-900/30'
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {message.content.split('\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {paragraph || <br />}
                </p>
              ))}
            </div>
            
            {(message.model || message.provider) && (
              <div className="mt-1 text-xs opacity-70 flex items-center gap-2 justify-end">
                {message.provider && (
                  <span className="capitalize">{message.provider}</span>
                )}
                {message.model && (
                  <span className="text-xs opacity-50">{message.model}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {isSending && (
        <div className="flex items-center justify-start">
          <div className="bg-muted rounded-lg px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
