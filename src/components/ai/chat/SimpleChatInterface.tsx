"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { AIMessage } from "@/types/ai-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SimpleChatInterfaceProps {
  className?: string;
  messages: AIMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string | null;
}

export function SimpleChatInterface({ 
  className = "",
  messages = [],
  onSendMessage,
  isLoading = false,
  errorMessage = null 
}: SimpleChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await onSendMessage(input);
      setInput("");
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [input, isLoading, onSendMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id || Math.random().toString(36).substr(2, 9)} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">
                {message.metadata?.toolCommand ? (
                  <>
                    <span className="font-mono text-xs opacity-75">
                      {message.metadata.toolCommand} {message.metadata.toolArgs?.join(' ')}
                    </span>
                    <div className="mt-2">
                      {message.content}
                    </div>
                  </>
                ) : (
                  message.content
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="min-w-[80px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          Type /help to see available commands
        </p>
      </form>
    </div>
  );
}
