import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

export interface ConversationItem {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  providerId: string;
  model?: string;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  className?: string;
}

export function ConversationList({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  className = '',
}: ConversationListProps) {
  const { createConversation, currentProvider } = useChat();

  const handleNewChat = async () => {
    if (!currentProvider?.id) return;
    
    try {
      // Create a new conversation with the current provider
      const defaultModel = currentProvider.defaultModel || currentProvider.models?.[0];
      if (defaultModel) {
        createConversation(currentProvider.id, defaultModel);
      }
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
        <p className="text-sm text-muted-foreground mb-4">
          No conversations yet
        </p>
        <Button size="sm" onClick={handleNewChat}>
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Recent Chats</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNewChat}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)] pr-2">
        <div className="space-y-1">
          {Object.values(conversations)
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((conversation) => (
              <div key={conversation.id} className="group relative">
                <Button
                  variant={conversation.id === currentConversationId ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-between pr-8',
                    conversation.id === currentConversationId && 'font-medium'
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <span className="truncate">
                    {conversation.title || 'New Chat'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
