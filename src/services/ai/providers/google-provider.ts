import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAIProvider } from "./base-provider";
import { AIMessage, AIModel } from "@/types/ai-provider";

export class GoogleProvider extends BaseAIProvider {
  defaultModel: string = '';
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    super("google", "Google AI");
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config?.apiKey) {
      throw new Error("Google API key is required");
    }
    return true;
  }

  async loadModels(): Promise<void> {
    this.models = [
      {
        id: "gemini-1.5-flash-latest",
        name: "Gemini 1.5 Flash (Recommended)",
        provider: this.id,
        maxTokens: 1048576,
        contextWindow: 1048576,
        supportsFunctionCalling: true,
        isFree: true,
        description: "Fastest model for most tasks, great for general use"
      },
      {
        id: "gemini-1.5-pro-latest",
        name: "Gemini 1.5 Pro",
        provider: this.id,
        maxTokens: 1048576,
        contextWindow: 1048576,
        supportsFunctionCalling: true,
        isFree: true,
        description: "Most capable model for complex tasks"
      },
      {
        id: "gemini-1.5-flash-001",
        name: "Gemini 1.5 Flash (Stable)",
        provider: this.id,
        maxTokens: 1048576,
        contextWindow: 1048576,
        supportsFunctionCalling: true,
        isFree: true,
        description: "Stable version of the Flash model"
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro (Legacy)",
        provider: this.id,
        maxTokens: 32768,
        contextWindow: 131072,
        supportsFunctionCalling: true,
        isFree: true,
        description: "Previous generation model, not recommended for new applications"
      },
    ];
    
    // Set default model to the first free model
    const defaultModel = this.models.find(m => m.isFree) || this.models[0];
    this.defaultModel = defaultModel.id;
  }

  protected async _generateResponse(
    messages: AIMessage[],
    modelId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<AsyncIterable<string> | string> {
    if (!this.client) {
      this.client = new GoogleGenerativeAI(this.config.apiKey);
    }

    const model = this.client.getGenerativeModel({ 
      model: modelId,
      ...(options.temperature && { generationConfig: { temperature: options.temperature } })
    });

    // Convert messages to Google's format
    const chat = model.startChat({
      history: messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
    });

    const systemMessage = messages.find(m => m.role === 'system');
    const prompt = systemMessage 
      ? `${systemMessage.content}\n\n${messages[messages.length - 1].content}`
      : messages[messages.length - 1].content;

    if (options.stream) {
      const result = await chat.sendMessageStream(prompt);
      return {
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            const { value, done } = await result.stream.next();
            return {
              value: value?.text() || '',
              done,
            };
          },
        }),
      };
    } else {
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    }
  }
}
