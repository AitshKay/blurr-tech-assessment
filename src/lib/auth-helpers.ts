import { NextRequest } from 'next/server';
import { getAuthSession } from '@/auth';
import type { AuthResult } from '@/types/auth';

/**
 * Get the current user session
 * Uses NextAuth.js v5 beta's auth() function
 */
export const getCurrentUser = async (): Promise<AuthResult> => {
  try {
    // Get the session using the getAuthSession function
    const { user, session } = await getAuthSession();
    
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

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { user } = await getCurrentUser();
  return !!user;
};

/**
 * Get the current user's role
 */
export const getUserRole = async (): Promise<string | null> => {
  const { user } = await getCurrentUser();
  return user?.role || null;
};
