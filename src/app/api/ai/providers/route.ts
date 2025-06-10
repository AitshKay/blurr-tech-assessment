import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

// Type assertion for Prisma client with our custom models
type PrismaClientWithExtensions = typeof prisma & {
  aIProvider: any;
  aIProviderConfig: any;
};

const prismaClient = prisma as unknown as PrismaClientWithExtensions;
import { Prisma } from '@prisma/client';

export async function GET() {
  const { user } = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use the correct Prisma model name with proper type casting
    const providers = await prismaClient.aIProvider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
