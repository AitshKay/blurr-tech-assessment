import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaClient {
    interface AIProviderDelegate<ExtArgs = any> {
      findMany: (args?: any) => Promise<any[]>;
      findUnique: (args: { where: { id: string } }) => Promise<any>;
    }
    
    interface AIProviderConfigDelegate<ExtArgs = any> {
      findMany: (args?: any) => Promise<any[]>;
      findFirst: (args: any) => Promise<any>;
      create: (args: { data: any }) => Promise<any>;
      update: (args: { where: { id: string }, data: any }) => Promise<any>;
      updateMany: (args: { where: any, data: any }) => Promise<any>;
    }
  }
}

declare module '@prisma/client' {
  interface PrismaClient {
    aIProvider: PrismaClient['AIProviderDelegate'];
    aIProviderConfig: PrismaClient['AIProviderConfigDelegate'];
  }
}

export {};
