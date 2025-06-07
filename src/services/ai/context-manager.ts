import { AIMessage } from "@/types/ai-provider";

export class ContextManager {
  private static instance: ContextManager;
  private maxTokens: number = 4000; // Default max tokens
  private messages: AIMessage[] = [];
  private maxHistoryLength = 10; // Number of messages to keep in context
  private tokenCount = 0;
  private maxTokenLimit = 4000; // Adjust based on model's context window

  private constructor() {}

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  // Add a new message to the context
  addMessage(message: AIMessage): void {
    this.messages.push(message);
    this.tokenCount += this.estimateTokenCount(message.content);
    this.trimContext();
  }

  // Get current context
  getContext(): AIMessage[] {
    return [...this.messages];
  }

  // Clear the context
  clearContext(): void {
    this.messages = [];
    this.tokenCount = 0;
  }

  // Estimate token count (simplified - consider using a proper tokenizer)
  private estimateTokenCount(text: string): number {
    // Rough estimate: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }

  // Trim context to stay within limits
  private trimContext(): void {
    // First trim by message count
    while (this.messages.length > this.maxHistoryLength) {
      const removed = this.messages.shift();
      if (removed) {
        this.tokenCount -= this.estimateTokenCount(removed.content);
      }
    }

    // Then trim by token count if still needed
    while (this.tokenCount > this.maxTokenLimit && this.messages.length > 1) {
      const removed = this.messages.shift();
      if (removed) {
        this.tokenCount -= this.estimateTokenCount(removed.content);
      }
    }
  }

  // Get conversation summary (placeholder for summarization logic)
  async getSummary(): Promise<string> {
    // In a real implementation, you might use the AI to summarize the conversation
    return "Conversation context summary...";
  }
}

export const contextManager = ContextManager.getInstance();
