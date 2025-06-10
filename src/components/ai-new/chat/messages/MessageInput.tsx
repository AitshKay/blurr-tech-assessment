import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperPlaneIcon, StopIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  isSending?: boolean;
  apiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
  onRemoveApiKey?: () => void;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  className = '',
  placeholder = 'Type your message...',
  isSending = false,
  apiKey,
  onApiKeyChange,
  onRemoveApiKey,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isLocalSending, setIsLocalSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const content = message.trim();
    if (!content || isSending || isLocalSending) return;

    setIsLocalSending(true);
    setMessage('');
    
    try {
      await onSendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    } finally {
      setIsLocalSending(false);
      // Focus the input after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    // TODO: Implement stop generation
    console.log('Stop generation requested');
  };

  return (
    <div className={cn('relative', className)}>
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[60px] max-h-[200px] resize-none pr-12"
        rows={1}
      />
      
      <div className="absolute right-2 bottom-2 flex gap-1">
        {isSending ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="h-8 w-8"
          >
            <StopIcon className="h-4 w-4" />
            <span className="sr-only">Stop generating</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="h-8 w-8"
          >
            <PaperPlaneIcon className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        )}
      </div>
      
      <div className="mt-1 flex justify-between px-1">
        <div className="text-xs text-muted-foreground">
          {message.length > 0 && (
            <span>{message.trim().length} characters</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded-md">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded-md">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded-md">Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
