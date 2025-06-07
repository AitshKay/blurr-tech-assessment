import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

export const authConfig = {
  // Session configuration
  session: {
    strategy: "jwt" as const,
  },
  // Secret used to encrypt session data
  secret: process.env.NEXTAUTH_SECRET,
  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  // Callbacks for JWT and session
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub || token.id;
      }
      return session;
    },
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};
