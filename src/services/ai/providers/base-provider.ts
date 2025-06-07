import { AIMessage, AIModel, AIProviderInterface } from "@/types/ai-provider";

export abstract class BaseAIProvider implements AIProviderInterface {
  protected config: any;
  protected models: AIModel[] = [];
  public readonly id: string;
  public readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  async initialize(config: any): Promise<void> {
    this.config = config;
    await this.validateConfig();
    await this.loadModels();
  }

  abstract validateConfig(): Promise<boolean>;
  abstract loadModels(): Promise<void>;
  
  async generateResponse(
    messages: AIMessage[],
    modelId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<AsyncIterable<string> | string> {
    if (!this.models.some(m => m.id === modelId)) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return this._generateResponse(messages, modelId, options);
  }

  protected abstract _generateResponse(
    messages: AIMessage[],
    modelId: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<AsyncIterable<string> | string>;

  async getModels(): Promise<AIModel[]> {
    if (this.models.length === 0) {
      await this.loadModels();
    }
    return [...this.models];
  }

  protected validateApiKey(apiKey: string): boolean {
    return !!apiKey && apiKey.length > 10; // Basic validation
  }
}
