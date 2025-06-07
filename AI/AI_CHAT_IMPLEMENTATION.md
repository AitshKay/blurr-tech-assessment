# AI Chat Implementation

This document provides an overview of the AI chat feature implementation in the Blurr HR application.

## Features

- **Provider-Agnostic Architecture**: Support for multiple AI providers (Google AI, OpenAI, Anthropic, etc.)
- **Model Selection**: Choose between different AI models based on the selected provider
- **Streaming Responses**: Real-time streaming of AI responses for better user experience
- **Conversation History**: Maintains conversation history within a session
- **Responsive UI**: Works on both desktop and mobile devices

## Components

### 1. AI Provider System

- **Base Provider (`BaseAIProvider`)**: Abstract base class that defines the interface for all AI providers
- **Google Provider**: Implementation for Google's Gemini models
- **Provider Factory**: Manages provider registration and instantiation

### 2. Chat Service

- **AIChatService**: Core service that handles chat sessions, message sending, and response processing
- **Streaming Support**: Handles both streaming and non-streaming responses

### 3. React Integration

- **AIChatContext**: React context for managing chat state
- **useAIChat Hook**: Custom hook for interacting with the chat service
- **ChatInterface**: Main chat UI component
- **ProviderSettings**: Component for configuring AI provider settings

## Setup

1. **Install Dependencies**

```bash
npm install @google/generative-ai
```

2. **Environment Variables**

Create a `.env.local` file in the root of your project with the following variables:

```env
GOOGLE_API_KEY=your_google_api_key_here
# Optional: Add other provider API keys as needed
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Usage

### Basic Usage

1. Wrap your application with the `AIChatProvider`:

```tsx
import { AIChatProvider } from "@/contexts/ai-chat-context";

function App() {
  return (
    <AIChatProvider>
      <YourApp />
    </AIChatProvider>
  );
}
```

2. Use the `useAIChat` hook in your components:

```tsx
import { useAIChat } from "@/contexts/ai-chat-context";

function ChatComponent() {
  const {
    messages,
    sendMessage,
    isLoading,
    availableModels,
    activeModel,
    setActiveModel,
  } = useAIChat();
  
  // ... rest of your component
}
```

### Custom Provider Configuration

You can initialize a specific provider with custom configuration:

```tsx
const { initializeProvider } = useAIChat();

// Initialize Google provider
await initializeProvider({
  id: 'google',
  name: 'Google AI',
  apiKey: 'your_google_api_key',
  defaultModel: 'gemini-pro',
});
```

## Adding a New Provider

1. Create a new provider class that extends `BaseAIProvider`:

```typescript
import { BaseAIProvider } from "./base-provider";
import { AIModel, AIMessage } from "@/types/ai-provider";

export class MyCustomProvider extends BaseAIProvider {
  // Implement required methods
  async validateConfig(): Promise<boolean> {
    // Validate provider configuration
  }
  
  async loadModels(): Promise<void> {
    // Load available models
  }
  
  protected async _generateResponse(
    messages: AIMessage[],
    modelId: string,
    options: any
  ): Promise<AsyncIterable<string> | string> {
    // Generate response from your provider
  }
}
```

2. Register your provider in the `ProviderFactory`:

```typescript
providerFactory.registerProvider('my-custom-provider', MyCustomProvider);
```

## Error Handling

The chat service includes comprehensive error handling for various scenarios:

- Invalid API keys
- Network errors
- Rate limiting
- Unsupported models
- Invalid message formats

## Local Storage

User preferences and API keys are stored in the browser's local storage for convenience. Sensitive data is not stored on the server.

## Testing

To test the chat functionality:

1. Start the development server:

```bash
npm run dev
```

2. Navigate to `/chat` in your browser
3. Configure your AI provider settings
4. Start chatting!

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if the key has the required permissions
   - Ensure you're using the correct provider

2. **No Response from AI**
   - Check your internet connection
   - Verify the API endpoint is accessible
   - Check the browser console for errors

3. **Model Not Found**
   - Ensure the model ID is correct
   - Check if the model is available in your region
   - Verify your API key has access to the model

## Future Improvements

- [ ] Add support for more AI providers
- [ ] Implement conversation persistence
- [ ] Add support for file uploads and document analysis
- [ ] Implement user authentication for chat history
- [ ] Add support for custom system prompts
- [ ] Implement rate limiting and usage tracking
