# AI Chat Implementation

This document provides an overview of the new AI chat implementation in the HR Dashboard.

## Architecture Overview

The new AI chat implementation follows a modular architecture with clear separation of concerns:

```
src/components/ai-new/
├── chat/                    # Main chat components
│   ├── AIChat.tsx           # Main chat container
│   ├── messages/            # Message-related components
│   │   ├── MessageList.tsx  # Displays chat messages
│   │   └── MessageInput.tsx # Input field for new messages
│   ├── providers/           # Provider-related components
│   │   ├── ProviderSelector.tsx # Provider selection
│   │   └── ApiKeyDialog.tsx     # API key management
│   └── sidebar/             # Sidebar components
│       ├── ModelSelector.tsx    # Model selection
│       └── ConversationList.tsx # Conversation history
├── stores/                  # State management
│   ├── chatStore.ts         # Chat state and actions
│   ├── modelStore.ts        # Model management
│   └── providerStore.ts     # Provider management
└── index.ts                 # Public API
```

## Key Features

1. **Multiple AI Providers**
   - Support for Google, OpenAI, Anthropic, Alibaba, and Ollama
   - Easy to add new providers
   - Provider-specific settings and API key management

2. **Model Management**
   - Dynamic model loading per provider
   - Default model configuration
   - Model metadata (context window, max tokens)

3. **Conversation Management**
   - Multiple concurrent conversations
   - Conversation history
   - Model switching within conversations

4. **Security**
   - Encrypted API key storage
   - Secure state management
   - Provider-specific API key validation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install zustand @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   ```

2. **Environment Variables**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key
   # Add provider-specific API keys as needed
   ```

3. **Usage**
   ```tsx
   import { AIChat } from '@/components/ai-new';
   
   function AIPage() {
     return (
       <div className="container mx-auto p-4">
         <AIChat className="max-w-4xl mx-auto" />
       </div>
     );
   }
   ```

## State Management

The application uses Zustand for state management with three main stores:

1. **providerStore**: Manages AI providers and API keys
2. **modelStore**: Handles available models and default selections
3. **chatStore**: Manages conversations and messages

## Adding a New Provider

1. Add the provider to `ProviderSelector.tsx`
2. Add default models in `modelStore.ts`
3. Implement any provider-specific logic in a new file under `src/lib/providers/`

## Security Considerations

- API keys are encrypted before being stored in localStorage
- Sensitive data is never logged
- All user inputs are sanitized before processing

## Testing

Run the test suite with:
```bash
npm test
```

## Future Improvements

- [ ] Add support for streaming responses
- [ ] Implement token counting
- [ ] Add support for file attachments
- [ ] Implement conversation search
- [ ] Add support for custom prompts

## Troubleshooting

- **API Key Not Working**: Verify the key is correctly entered and has the required permissions
- **Models Not Loading**: Check the network tab for failed API requests
- **State Not Persisting**: Ensure the storage key is not being cleared unexpectedly
