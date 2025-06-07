import { PrismaClient as BasePrismaClient } from "@prisma/client";

// Custom Prisma client extensions will be defined here

// Create a type that includes our custom methods
type CustomPrismaClient = BasePrismaClient & {
  $transaction<T>(
    fn: (prisma: Omit<PrismaClient, 
      '$connect' | 
      '$disconnect' | 
      '$on' | 
      '$transaction' | 
      '$use' | 
      '$extends'
    >) => Promise<T>
  ): Promise<T>;
  chatSession: {
    create: (args: {
      data: {
        id?: string;
        userId: string;
        projectId?: string | null;
        taskId?: string | null;
        employeeId?: string | null;
        context: string;
        createdAt?: Date;
        updatedAt?: Date;
      }
    }) => Promise<{
      id: string;
      userId: string;
      projectId: string | null;
      taskId: string | null;
      employeeId: string | null;
      context: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    findUnique: (args: { 
      where: { id: string },
      select?: { context: boolean }
    }) => Promise<{
      id: string;
      context: string;
      projectId: string | null;
      taskId: string | null;
      employeeId: string | null;
      createdAt: Date;
      updatedAt: Date;
      messages?: Array<{
        id: string;
        content: string;
        role: string;
        createdAt: Date;
      }>;
    } | null>;
  };
  chatMessage: {
    createMany: (args: {
      data: Array<{
        id?: string;
        content: string;
        role: string;
        chatId: string;
        createdAt?: Date;
        updatedAt?: Date;
      }>
    }) => Promise<{
      count: number;
    }>;
    findMany: (args: {
      where: { chatId: string };
      orderBy: { createdAt: "asc" | "desc" };
    }) => Promise<Array<{
      id: string;
      content: string;
      role: string;
      chatId: string;
      createdAt: Date;
      updatedAt: Date;
    }>>;
  };
};

// Export the PrismaClient type with our custom methods
export type PrismaClient = CustomPrismaClient;

// This is the actual client instance that will be used in the application
export const prisma = new BasePrismaClient() as PrismaClient;

