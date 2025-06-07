import { GoogleProvider } from "./providers/google-provider";
import { BaseAIProvider } from "./providers/base-provider";
import { ProviderConfig } from "@/types/ai-provider";

type ProviderConstructor = new () => BaseAIProvider;

class ProviderFactory {
  private static instance: ProviderFactory;
  private providers: Map<string, ProviderConstructor> = new Map();
  private instances: Map<string, BaseAIProvider> = new Map();

  private constructor() {
    // Register default providers
    this.registerProvider('google', GoogleProvider);
  }

  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  registerProvider(id: string, provider: ProviderConstructor): void {
    this.providers.set(id, provider);
  }

  getProvider(id: string): BaseAIProvider | undefined {
    if (this.instances.has(id)) {
      return this.instances.get(id);
    }
    
    const ProviderClass = this.providers.get(id);
    if (!ProviderClass) return undefined;
    
    const instance = new ProviderClass();
    this.instances.set(id, instance);
    return instance;
  }

  async initializeProvider(config: ProviderConfig): Promise<BaseAIProvider> {
    const { id, ...providerConfig } = config;
    const provider = this.getProvider(id);
    
    if (!provider) {
      throw new Error(`Provider with id '${id}' is not registered`);
    }

    await provider.initialize(providerConfig);
    return provider;
  }

  getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const providerFactory = ProviderFactory.getInstance();
