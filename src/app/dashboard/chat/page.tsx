'use client';

import { AIChatProvider } from '@/contexts/ai-chat-context';
import { ToolAIService } from "@/services/ai/tool-ai-service";
import { AIAssistantChat } from "@/components/ai/chat/AIAssistantChat";

// Create a context provider for ToolAIService
const ToolAIServiceProvider = ({ children }: { children: React.ReactNode }) => {
  // The ToolAIService is already initialized when imported
  return <>{children}</>;
};

export default function DashboardChatPage() {
  return (
    <AIChatProvider>
      <ToolAIServiceProvider>
        <div className="flex flex-col h-screen">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <AIAssistantChat />
          </main>
        </div>
      </ToolAIServiceProvider>
    </AIChatProvider>
  );
}
