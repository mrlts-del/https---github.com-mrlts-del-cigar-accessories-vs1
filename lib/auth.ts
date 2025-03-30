import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import type { AdapterUser } from '@auth/core/adapters';
import type { JWT } from '@auth/core/jwt';
// Remove AuthOptions type import again
import type { DefaultSession, User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

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
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}

// Helper function (keep it here or move to utils if used elsewhere)
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`Warning: Environment variable ${key} is not set.`);
    return '';
  }
  return value;
}

// Remove explicit AuthOptions type annotation again
export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      // Temporarily remove explicit credentials definition
      // credentials: {
      //   email: { label: "Email", type: "email" },
      //   password: { label: "Password", type: "password" }
      // },
      async authorize(credentials): Promise<NextAuthUser | null> {
        // Type check is still important here
        if (!credentials?.email || typeof credentials.password !== 'string') {
          console.error("Missing or invalid credentials");
          return null;
        }
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });
          if (!user || !user.password) {
            console.error("User not found or no password set for:", credentials.email);
            return null;
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            console.error("Invalid password for:", credentials.email);
            return null;
          }
          console.log("Credentials valid for:", credentials.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    }),
    // Keep OAuth providers commented out for now
    // GoogleProvider({ ... }),
    // GitHubProvider({ ... }),
  ], // End of providers array
  // Define session strategy before callbacks
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AdapterUser | NextAuthUser }): Promise<JWT> {
      try {
        if (user?.id) {
          token.id = user.id;
          const dbUser = await db.user.findUnique({ where: { id: user.id } });
          token.role = dbUser?.role ?? 'USER';
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }
      return token;
    },
    async session({ session, token }: { session: NextAuthSession; token: JWT }): Promise<NextAuthSession> {
      try {
        if (token?.id && session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
        } else {
           console.warn("Token or session.user missing in session callback", { tokenId: token?.id, userExists: !!session.user });
        }
      } catch (error) {
         console.error("Session callback error:", error);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
};
