import NextAuth from 'next-auth';
import type { AuthResult } from '@/types/auth';
import { authConfig } from '@/lib/next-auth-config';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Initialize NextAuth with the configuration
// @ts-ignore - NextAuth v5 beta types issue
const nextAuthHandler = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        // @ts-ignore - We know these properties exist
        session.user.id = token.sub || token.id;
        // @ts-ignore - We know role exists
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        // @ts-ignore - We know id exists
        token.id = user.id;
        // @ts-ignore - We know role exists
        token.role = user.role;
      }
      return token;
    },
  },
});

// Export the auth functions and handlers
export const {
  handlers,
  auth,
  signIn,
  signOut,
} = nextAuthHandler;

// Create auth handler for getting the current session
export const getAuthSession = async (): Promise<AuthResult> => {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { user: null, session: null };
    }
    
    return {
      user: {
        id: session.user.id || '',
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        // @ts-ignore - We know role exists
        role: session.user.role || 'user',
      },
      session,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, session: null };
  }
};

// Export the auth options for reference
export { authConfig as authOptions };

// Export types for use in your application
export type { Session } from 'next-auth';