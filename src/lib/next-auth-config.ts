import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';
import type { User } from '@prisma/client';

export const authConfig = {
  // Configure CORS and security
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  // @ts-ignore - TypeScript doesn't recognize the adapter type properly
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        }) as (User & { password: string | null }) | null;

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub || token.id;
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};
