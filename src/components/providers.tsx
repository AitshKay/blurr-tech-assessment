"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useState, useEffect } from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AIChatProvider } from "@/contexts/ai-chat-context";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Prevent hydration mismatch by only rendering the theme after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <AIChatProvider>
            {children}
          </AIChatProvider>
        </QueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <AIChatProvider>
            {children}
            <SonnerToaster position="top-center" richColors />
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            )}
          </AIChatProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}