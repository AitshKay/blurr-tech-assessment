import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { validateProviderAPIKey } from '@/lib/ai-provider-utils';
import type { AIProviderConfigRequest, AIProviderConfig } from '../../../../../src/types/ai';

// Extend the Prisma client type to include our custom models
type PrismaClient = typeof prisma & {
  aIProviderConfig: any;
  aIProvider: any;
};

const prismaClient = prisma as PrismaClient;

interface ConfigWithProvider extends Omit<AIProviderConfig, 'apiKey'> {
  provider?: {
    id: string;
    name: string;
    displayName: string;
  };
}

export async function GET() {
  try {
    const { user } = await getAuthSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const configs = await prismaClient.aIProviderConfig.findMany({
      where: { userId: user.id },
      include: { provider: true },
      orderBy: [{ isDefault: 'desc' }, { lastUsedAt: 'desc' }],
    });

    // Remove sensitive data before sending response
    const safeConfigs = configs.map(({ apiKey, ...config }: ConfigWithProvider & { apiKey: string }) => ({
      ...config,
      providerName: config.provider?.name || config.providerId,
      displayName: config.provider?.displayName || config.providerId,
    }));

    return NextResponse.json(safeConfigs);
  } catch (error) {
    console.error('Error fetching AI configs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch AI configurations: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getAuthSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let data: AIProviderConfigRequest;
    try {
      data = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { providerId, apiKey, modelName, isDefault = false, config = {} } = data;

    // Input validation
    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Only validate API key if it's provided in the request
    if (apiKey) {
      const isValid = validateProviderAPIKey(providerId, apiKey);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid API key format' },
          { status: 400 }
        );
      }
    }

    try {
      // If this is set as default, unset any existing default for this user
      if (isDefault) {
        await prismaClient.aIProviderConfig.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Ensure the provider exists
      let provider = await prismaClient.aIProvider.findUnique({
        where: { id: providerId }
      });

      if (!provider) {
        // Create provider if it doesn't exist
        provider = await prismaClient.aIProvider.create({
          data: {
            id: providerId,
            name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
            displayName: providerId.charAt(0).toUpperCase() + providerId.slice(1),
            baseUrl: '',
            requiresKey: true,
            envKey: `${providerId.toUpperCase()}_API_KEY`,
            defaultModel: 'default',
          },
        });
      }

      // Prepare the configuration data
      const configData: any = {
        userId: user.id,
        providerId,
        providerName: provider.name,
        displayName: provider.displayName,
        modelName: modelName || provider.defaultModel || 'default',
        isDefault: Boolean(isDefault),
        config: config || {},
        lastUsedAt: new Date(),
      };

      // Only include API key if provided
      if (apiKey) {
        configData.apiKey = apiKey;
      }

      // Check for existing config for this provider and user
      const existingConfig = await prismaClient.aIProviderConfig.findFirst({
        where: {
          userId: user.id,
          providerId,
        },
      });

      let savedConfig: any;

      if (existingConfig) {
        // Update existing config
        savedConfig = await prismaClient.aIProviderConfig.update({
          where: { id: existingConfig.id },
          data: configData,
        });
      } else {
        // Create new config
        savedConfig = await prismaClient.aIProviderConfig.create({
          data: configData,
        });
      }

      // Remove sensitive data before sending response
      const { apiKey: _, ...safeConfig } = savedConfig;
      
      // Format the response
      const responseData = {
        id: safeConfig.id,
        providerId: safeConfig.providerId,
        providerName: safeConfig.providerName,
        displayName: safeConfig.displayName || safeConfig.providerName,
        modelName: safeConfig.modelName,
        isDefault: safeConfig.isDefault,
        lastUsedAt: safeConfig.lastUsedAt,
      };
      
      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Error processing request:', error);
      
      // Handle Prisma errors
      let errorMessage = 'Failed to process request';
      let statusCode = 500;
      
      if (error instanceof Error) {
        // Handle specific Prisma errors if needed
        if ('code' in error && error.code === 'P2002') {
          errorMessage = 'A configuration with these settings already exists';
          statusCode = 409;
        } else {
          errorMessage = error.message;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Error saving AI config:', error);
    let errorMessage = 'Failed to save AI configuration';
    let statusCode = 500;
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      errorDetails = error.stack || error.message;
    } else if (typeof error === 'string') {
      errorDetails = error;
    } else {
      errorDetails = JSON.stringify(error);
    }
    
    const response: { error: string; details?: string } = { error: errorMessage };
    
    if (process.env.NODE_ENV === 'development') {
      response.details = errorDetails;
    }
    
    return NextResponse.json(response, { status: statusCode });
  }
}
