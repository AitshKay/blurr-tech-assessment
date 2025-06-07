import { providerFactory } from "./provider-factory";
import { AIMessage, AIProvider, AIModel, ProviderConfig, ChatSession } from "@/types/ai-provider";
import { v4 as uuidv4 } from 'uuid';

export class AIChatService {
  private static instance: AIChatService;
  private sessions: Map<string, ChatSession> = new Map();
  private activeProvider: AIProvider | null = null;

  private constructor() {}

  static getInstance(): AIChatService {
    if (!AIChatService.instance) {
      AIChatService.instance = new AIChatService();
    }
    return AIChatService.instance;
  }

  async initializeProvider(config: ProviderConfig): Promise<AIProvider> {
    const provider = await providerFactory.initializeProvider(config);
    const models = await provider.getModels();
    this.activeProvider = {
      id: provider.id,
      name: provider.name,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      models,
      defaultModel: config.defaultModel || models[0]?.id || ''
    };
    return this.activeProvider!;
  }

  async createSession(modelId?: string): Promise<ChatSession> {
    if (!this.activeProvider) {
      throw new Error("No active AI provider");
    }

    const modelToUse = modelId || this.activeProvider.defaultModel;
    if (!modelToUse || !this.activeProvider.models.some(m => m.id === modelToUse)) {
      throw new Error(`Model '${modelToUse}' is not available`);
    }

    const session: ChatSession = {
      id: uuidv4(),
      providerId: this.activeProvider.id,
      model: modelToUse,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async sendMessage(
    sessionId: string,
    content: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
      context?: AIMessage[];
      [key: string]: any;
    } = {}
  ): Promise<AsyncIterable<string> | string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add user message to session
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // Add to session messages
    session.messages.push(userMessage);
    session.updatedAt = new Date();

    // Get the provider
    const provider = providerFactory.getProvider(session.providerId);
    if (!provider) {
      throw new Error(`Provider ${session.providerId} not found`);
    }

    // Prepare messages with context if provided
    let messagesToSend = [...session.messages];
    if (options.context?.length) {
      // Combine context with current conversation, removing duplicates by message ID
      const contextMessages = options.context.filter(ctxMsg => 
        !session.messages.some(msg => msg.id === ctxMsg.id)
      );
      messagesToSend = [...contextMessages, ...session.messages];
    }

    // Generate response
    try {
      const response = await provider.generateResponse(
        messagesToSend,
        session.model,
        options
      );

      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async saveAssistantResponse(
    sessionId: string,
    content: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const assistantMessage: AIMessage = {
      role: 'assistant',
      content,
    };

    session.messages.push(assistantMessage);
    session.updatedAt = new Date();
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveProvider(): AIProvider | null {
    return this.activeProvider;
  }

  async getAvailableModels(): Promise<AIModel[]> {
    if (!this.activeProvider) {
      return [];
    }
    return this.activeProvider.models;
  }
}

export const chatService = AIChatService.getInstance();
