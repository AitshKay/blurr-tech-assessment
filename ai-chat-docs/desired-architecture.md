# AI Chat Assistant - Desired Architecture

## Vision
A seamless AI chat assistant integrated with the HR dashboard that provides intelligent assistance for HR-related tasks, with support for multiple AI providers, persistent settings, and deep integration with HR data.

## Core Requirements

### 1. Provider Management
- Support for multiple AI providers (OpenAI, Google, Anthropic, Alibaba, Ollama)
- Persistent storage of API keys (encrypted)
- Default provider selection
- Easy switching between providers

### 2. Model Management
- Dynamic model fetching per provider
- Default model selection (Gemini 1.5 Flash as priority for Google)
- Model switching during conversation
- Model metadata (context window, capabilities, etc.)

### 3. HR Integration
- Read access to employee data
- Read/write access to projects and tasks
- Context awareness of current dashboard view
- Permission-based data access

### 4. User Experience
- Persistent conversation history
- File attachments
- Code execution (sandboxed)
- Suggested actions/quick replies
- Loading states and error handling

## Technical Architecture

### Components Structure
```
components/ai-new/
├── chat/
│   ├── AIChat.tsx           # Main chat component
│   ├── providers/           # Provider-specific components
│   │   ├── ProviderSelector.tsx
│   │   └── ApiKeyManager.tsx
│   ├── messages/            # Message components
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageActions.tsx
│   └── sidebar/             # Chat sidebar
│       ├── ConversationList.tsx
│       └── ModelSelector.tsx
├── hooks/
│   ├── useAIChat.ts         # Main chat logic
│   ├── useAIProviders.ts    # Provider management
│   ├── useAIModels.ts       # Model management
│   └── useHRContext.ts      # HR data integration
└── stores/
    ├── chatStore.ts         # Chat state
    ├── providerStore.ts     # Provider state
    └── modelStore.ts        # Model state
```

### Data Flow
1. User authenticates
2. Load saved preferences (provider, model, API key)
3. Initialize chat with selected provider
4. Fetch available models for the provider
5. User interacts with chat
6. Messages are processed with HR context
7. Responses are generated and displayed
8. Conversation state is persisted

### Integration Points
- HR Data API for employee/project/task access
- Secure storage for API keys
- Authentication service
- Real-time updates (WebSockets)

## Technical Stack
- **Frontend**: React 18+, TypeScript
- **State Management**: Zustand + React Query
- **UI Components**: ShadCN/UI
- **AI Providers**: Vercel AI SDK
- **Storage**: LocalStorage (temporary) + Backend API (persistent)
- **Authentication**: NextAuth.js
- **Real-time**: WebSockets (optional)

## Security Considerations
- Encrypt API keys at rest
- Validate all AI responses before rendering
- Implement rate limiting
- Sanitize all user inputs
- Role-based access control for HR data
