# AI Chat Assistant - Current Architecture

## Overview
The current AI Chat Assistant is a React-based component that interfaces with various AI providers (OpenAI, Google, Anthropic, etc.) to provide conversational AI capabilities within the HR dashboard.

## File Structure

### Core Components
- `src/components/ai/chat/AIAssistantChat.tsx` - Main chat component
- `src/components/ai/chat/components/` - Contains sub-components:
  - `ProviderSelector.tsx` - For selecting AI providers
  - `ChatMessages.tsx` - Displays chat messages
  - `ChatInput.tsx` - Input field for user messages
  - `ApiKeyDialog.tsx` - Dialog for entering API keys

### Hooks
- `src/hooks/useAIChat.ts` - Main chat hook for managing chat state
- `src/hooks/useAIChatState.ts` - Manages AI provider state and initialization
- `src/hooks/useAIProviders.ts` - Fetches and manages available AI providers

### State Management
- `src/stores/ai/useAIProviderStore.ts` - Zustand store for provider state
- `src/stores/ai/useAIChatStore.ts` - Zustand store for chat state
- `src/contexts/ai-chat-context.tsx` - React context for chat state

### Types
- `src/types/ai.ts` - TypeScript interfaces for AI-related types

### Utils
- `src/utils/ai-provider-utils.ts` - Utility functions for AI providers
- `src/utils/provider-utils.ts` - Helper functions for provider management

## Data Flow
1. User opens the chat interface
2. `AIAssistantChat` mounts and initializes the chat state
3. User selects a provider (or one is loaded from saved preferences)
4. If needed, user enters API key for the provider
5. User sends a message
6. Message is processed and sent to the selected AI provider
7. Response is received and displayed in the chat

## Current Limitations
- No persistent storage of API keys
- Limited model selection
- No context awareness of HR data
- Basic chat functionality without advanced features
- No memory of conversation history between sessions
- Limited error handling and user feedback
