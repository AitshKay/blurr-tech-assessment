'use client';

import { AIChat } from '@/components/ai-new';
import { useEffect, useState } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { useTheme } from '@/components/theme/theme-provider';

export default function DashboardChatPage() {
  const [isReady, setIsReady] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // This code only runs on the client side
    setIsReady(true);
    
    // Set initial theme - only access window after mount
    const darkMode = theme === 'dark' || 
      (typeof window !== 'undefined' && theme === 'system' && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(darkMode);
    
    // Listen for system theme changes if using system theme
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'dark' : ''}`}>
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isReady ? 'AI Assistant' : 'Setting up AI Assistant...'}
          </h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden p-4 bg-background/50">
        <div className="max-w-7xl mx-auto h-full">
          <ChatProvider>
            <AIChat className="h-full bg-card rounded-lg border shadow-sm" />
          </ChatProvider>
        </div>
      </main>
    </div>
  );
}
