import NextAuth, { type DefaultSession, type User as NextAuthUser, type Session as NextAuthSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google'; // Import Google provider
import GitHubProvider from 'next-auth/providers/github'; // Import GitHub provider
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client'; // Removed unused PrismaUser import
import type { AdapterUser } from '@auth/core/adapters'; // Import AdapterUser
import type { JWT } from '@auth/core/jwt'; // Import JWT from @auth/core/jwt

// Extend the default Session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

// Extend the JWT type
declare module '@auth/core/jwt' { // Augment JWT from @auth/core/jwt
  interface JWT {
    id: string;
    role: Role;
  }
}

// Helper function to ensure env vars are present
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    // In production, you might want to throw an error or handle this differently
    console.error(`Warning: Environment variable ${key} is not set.`);
    return ''; // Return empty string or handle as appropriate for your setup
    // throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || typeof credentials.password !== 'string') {
          console.error('Missing or invalid credentials');
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || typeof user.password !== 'string' || user.password.length === 0) {
          console.error('User not found or no password set for:', credentials.email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password as string
        );

        if (!isPasswordValid) {
          console.error('Invalid password for:', credentials.email);
          return null;
        }

        console.log('Credentials valid for:', credentials.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: getEnvVar('GOOGLE_CLIENT_ID'),
      clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
    }),
    GitHubProvider({
      clientId: getEnvVar('GITHUB_CLIENT_ID'),
      clientSecret: getEnvVar('GITHUB_CLIENT_SECRET'),
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AdapterUser | NextAuthUser }): Promise<JWT> {
      if (user && user.id) {
        token.id = user.id;
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        token.role = dbUser?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }: { session: NextAuthSession; token: JWT }): Promise<NextAuthSession> {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET, // IMPORTANT: Add AUTH_SECRET to .env for production
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
