import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { auth as nextAuth } from '@/auth';

// Type for auth result
type AuthResult = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  session: any;
};

export const getServerAuthSession = async (): Promise<AuthResult> => {
  try {
    // Get the session using NextAuth.js v5 beta's auth function
    const session = await nextAuth();
    
    if (!session?.user) {
      return { user: null, session: null };
    }
    
    return {
      user: {
        id: session.user.id || '',
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        role: (session.user as any).role || 'user',
      },
      session,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, session: null };
  }
};

// Export for backward compatibility
export const getAuthSession = getServerAuthSession;
