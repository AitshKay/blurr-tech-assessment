import { prisma } from './prisma';

export async function getUserAIConfig(userId: string) {
  try {
    const configs = await prisma.aIProviderConfig.findMany({
      where: { userId },
      include: {
        provider: true
      }
    });

    return configs.map(config => ({
      id: config.id,
      providerId: config.providerId,
      providerName: config.provider.name,
      displayName: config.provider.displayName,
      apiKey: config.apiKey,
      modelName: config.modelName,
      isDefault: config.isDefault,
      baseUrl: config.provider.baseUrl || undefined,
      lastUsedAt: config.lastUsedAt || undefined
    }));
  } catch (error) {
    console.error('Error fetching user AI configs:', error);
    return [];
  }
}

export async function saveUserAIConfig(
  userId: string, 
  providerId: string, 
  apiKey: string, 
  modelName: string,
  isDefault: boolean = true
) {
  try {
    // If this is being set as default, unset any existing defaults
    if (isDefault) {
      await prisma.aIProviderConfig.updateMany({
        where: { 
          userId,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    // Check if config already exists
    const existing = await prisma.aIProviderConfig.findFirst({
      where: {
        userId,
        providerId,
        modelName
      }
    });

    if (existing) {
      // Update existing config
      return await prisma.aIProviderConfig.update({
        where: { id: existing.id },
        data: {
          apiKey,
          isDefault,
          lastUsedAt: new Date()
        }
      });
    } else {
      // Create new config
      return await prisma.aIProviderConfig.create({
        data: {
          userId,
          providerId,
          apiKey,
          modelName,
          isDefault,
          lastUsedAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error saving user AI config:', error);
    throw error;
  }
}

export async function getDefaultAIConfig(userId: string) {
  try {
    // First try to get the user's default config
    const defaultConfig = await prisma.aIProviderConfig.findFirst({
      where: { 
        userId,
        isDefault: true 
      },
      include: {
        provider: true
      }
    });

    if (defaultConfig) {
      return {
        id: defaultConfig.id,
        providerId: defaultConfig.providerId,
        providerName: defaultConfig.provider.name,
        displayName: defaultConfig.provider.displayName,
        apiKey: defaultConfig.apiKey,
        modelName: defaultConfig.modelName,
        isDefault: true,
        baseUrl: defaultConfig.provider.baseUrl || undefined
      };
    }

    // If no default config, try to get the first available config
    const firstConfig = await prisma.aIProviderConfig.findFirst({
      where: { userId },
      include: {
        provider: true
      },
      orderBy: { lastUsedAt: 'desc' }
    });

    if (firstConfig) {
      // Set this as the default for next time
      await prisma.aIProviderConfig.update({
        where: { id: firstConfig.id },
        data: { isDefault: true }
      });

      return {
        id: firstConfig.id,
        providerId: firstConfig.providerId,
        providerName: firstConfig.provider.name,
        displayName: firstConfig.provider.displayName,
        apiKey: firstConfig.apiKey,
        modelName: firstConfig.modelName,
        isDefault: true,
        baseUrl: firstConfig.provider.baseUrl || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting default AI config:', error);
    return null;
  }
}
