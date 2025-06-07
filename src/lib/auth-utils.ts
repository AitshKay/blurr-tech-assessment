import { NextRequest, NextResponse } from 'next/server';
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

export const getAuthSession = async (req?: NextRequest, res?: NextResponse): Promise<AuthResult> => {
  try {
    // Get the session using the NextAuth.js v5 beta auth function
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

// Export a function to get the server session
export async function getServerSession() {
  return getAuthSession();
}
