import { useChat as useChatContext } from '@/contexts/ChatContext';

export function useChat() {
  const { state, actions, getCurrentConversation } = useChatContext();
  const { conversation, messages, provider } = getCurrentConversation();

  return {
    // State
    currentConversation: conversation,
    currentProvider: provider,
    providers: state.providers,
    isSending: state.isSending,
    error: state.error,
    messages,
    
    // Actions
    createConversation: actions.createConversation,
    switchConversation: actions.switchConversation,
    deleteConversation: actions.deleteConversation,
    sendMessage: actions.sendMessage,
    setProvider: actions.setProvider,
    setApiKey: actions.setApiKey,
    removeApiKey: actions.removeApiKey,
  };
}

export function useSelectedProvider() {
  const { state, actions } = useChatContext();
  
  return {
    provider: state.currentProviderId 
      ? state.providers.find((p: { id: string }) => p.id === state.currentProviderId)
      : null,
    providers: state.providers,
    setSelectedProvider: actions.setProvider,
    setApiKey: actions.setApiKey,
    removeApiKey: actions.removeApiKey,
  };
}
