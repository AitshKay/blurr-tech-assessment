import { ChatMessage, ChatContext } from "@/types/chatbot";
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

const API_BASE_URL = '/api/chat';

export class ChatBotService {
  private static instance: ChatBotService;
  private ai: GoogleGenerativeAI;
  private model: GenerativeModel;

  private constructor() {
    // In Next.js 13+, server-side environment variables are available in process.env
    // We've configured next.config.mjs to expose GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please make sure it's set in your .env file and you've restarted your development server.");
    }
    this.ai = new GoogleGenerativeAI(apiKey);
    this.model = this.ai.getGenerativeModel({ model: "gemini-pro" });
  }

  public static getInstance(): ChatBotService {
    if (!ChatBotService.instance) {
      ChatBotService.instance = new ChatBotService();
    }
    return ChatBotService.instance;
  }

  async createChatSession(userId: string, context: ChatContext): Promise<string> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    if (!context || typeof context !== 'object') {
      throw new Error('Context is required and must be an object');
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createSession',
          data: { 
            userId, 
            context: {
              ...context,
              projectId: context.projectId || null,
              taskId: context.taskId || null,
              employeeId: context.employeeId || null,
              currentDateTime: new Date().toISOString()
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create chat session');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create chat session');
      }

      if (!result.data?.id) {
        throw new Error('Invalid response: Missing chat session ID');
      }

      return result.data.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat session';
      throw new Error(errorMessage);
    }
  }

  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getMessages',
          data: { chatId }
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get chat history');
      }

      // Ensure we only return valid chat messages
      return (result.data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
        content: msg.content || '',
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  async getChatSession(chatId: string) {
    if (!chatId || typeof chatId !== 'string') {
      throw new Error('Chat ID is required and must be a string');
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getSession',
          data: { chatId }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch chat session');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get chat session');
      }

      if (!result.data) {
        throw new Error('Chat session not found');
      }

      // Parse the context string back to an object
      try {
        const context = result.data.context ? 
          (typeof result.data.context === 'string' ? 
            JSON.parse(result.data.context) : 
            result.data.context) : 
          {};

        return {
          ...result.data,
          context
        };
      } catch (parseError) {
        console.error('Error parsing chat context:', parseError);
        return {
          ...result.data,
          context: {}
        };
      }
    } catch (error) {
      console.error('Error getting chat session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get chat session';
      throw new Error(errorMessage);
    }
  }

  async saveMessage(chatId: string, content: string, role: 'user' | 'assistant') {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveMessage',
          data: { chatId, content, role }
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to save message');
      }

      return result.data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, content: string): Promise<string> {
    try {
      const session = await this.getChatSession(chatId);

      if (!session?.context) {
        throw new Error("Chat session not found or invalid");
      }

      const context = session.context as ChatContext;
      const formattedContext = this.formatChatContext(context);

      const history = await this.getChatHistory(chatId);

      const contextMessage = {
        role: "system" as const,
        parts: [{ text: formattedContext }],
      };

      const messages = [
        contextMessage,
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        {
          role: "user" as const,
          parts: [{ text: content }],
        }
      ];

      const response = await this.model.generateContent({
        contents: messages
      });

      const assistantMessage = await response.response.text();

      // Save messages to database using our API endpoints
      await this.saveMessage(chatId, content, 'user');
      await this.saveMessage(chatId, assistantMessage, 'assistant');

      return assistantMessage;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      throw new Error(errorMessage);
    }
  }

  private formatChatContext(context: ChatContext): string {
    return `
    You are an AI assistant helping with Blurr HR Portal.
    Current Context:
    - Project: ${context.projectId || "N/A"}
    - Task: ${context.taskId || "N/A"}
    - Employee: ${context.employeeId || "N/A"}
    - Current Time: ${context.currentDateTime}
    - User: ${context.user.name}

    Please provide relevant information based on this context.
    `;
  }

  async callWithRetry(
    chatId: string,
    content: string,
    maxRetries = 3
  ): Promise<string> {
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        return await this.sendMessage(chatId, content);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
        if (errorMessage.includes("rate limit") && retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        } else {
          throw new Error(errorMessage);
        }
      }
    }

    throw new Error("Max retries exceeded");
  }
}
