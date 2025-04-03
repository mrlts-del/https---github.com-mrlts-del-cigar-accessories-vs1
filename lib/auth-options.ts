// lib/auth-options.ts
// Removed explicit dotenv loading - rely on Next.js built-in handling

import type { NextAuthOptions, User, Session } from "next-auth"; // Import v4 types (remove JWT from here)
import type { JWT } from "next-auth/jwt"; // Import JWT type from correct path
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Use v4 adapter package
import type { AdapterUser } from "next-auth/adapters"; // Import AdapterUser type from correct path
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./db"; // Adjust import path as needed

// Add a debug flag (optional, can be removed if logs are clean)
const DEBUG = false;

// Conditional adapter function (copied from previous lib/auth.ts)
function getPrismaAdapter() {
  const isNodeEnvironment = process.env.NEXT_RUNTIME !== 'edge';
  if (isNodeEnvironment) {
    if (DEBUG) console.log("Node.js environment detected, returning PrismaAdapter instance.");
    // Ensure 'db' is correctly resolved here. It's imported at the top.
    return PrismaAdapter(db);
  } else {
    if (DEBUG) console.log("Edge environment detected, skipping PrismaAdapter.");
    return undefined;
  }
}

const adapter = getPrismaAdapter();
if (DEBUG) console.log(`Auth setup (options): ${adapter ? 'Using PrismaAdapter' : 'Skipping PrismaAdapter'}.`);

// Define and export the auth options
export const authOptions: NextAuthOptions = { // Use NextAuthOptions type
  adapter: adapter, // Use the conditional adapter
  session: { strategy: "jwt" }, // Use JWT strategy for Edge compatibility
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
       },
       async authorize(credentials) {
         // Use the standard 'db' instance imported at the top
         if (!credentials?.email || !credentials?.password) {
           return null;
         }
         try {
           const user = await db.user.findUnique({
             where: { email: credentials.email as string }
           });
          if (!user || !user.password) {
            if (DEBUG) console.log("Authorize: User not found or no password set.");
            return null;
          }
          // IMPORTANT: Add password verification logic here
          // Example: const isValid = await compare(credentials.password, user.password);
          // if (!isValid) return null;
          if (DEBUG) console.log("Authorize: User found, returning user object.");
          return {
            id: user.id,
            role: user.role, // Prisma Role enum
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Error during authorization:", error); // Keep error log even if DEBUG is false
           return null; // Return null on error
         }
       }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!, // Use non-null assertion or remove ?? ""
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Use non-null assertion or remove ?? ""
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!, // Use non-null assertion or remove ?? ""
      clientSecret: process.env.GITHUB_SECRET!, // Use non-null assertion or remove ?? ""
      allowDangerousEmailAccountLinking: true,
    })
  ],
  callbacks: {
    // Add types to callback parameters
    async jwt({ token, user }: { token: JWT; user?: AdapterUser | User }) { // Add types for token and user
       console.log("[DEBUG] JWT Callback - User:", user); // Log user object
       console.log("[DEBUG] JWT Callback - Initial Token:", token); // Log initial token
       if (user) {
         token.id = user.id;
         // Assuming 'role' exists on your User model and is added to AdapterUser/User type if needed
         // If 'role' is not directly on the user object passed here, you might need to fetch it
         token.role = (user as any).role; // Cast to any temporarily if role isn't typed on user/adapterUser
       }
       console.log("[DEBUG] JWT Callback - Final Token:", token); // Log final token
       return token;
    },
     async session({ session, token }: { session: Session; token: JWT }) { // Add types for session and token
       if (token && session.user) {
         if (token.id && typeof token.id === 'string') {
           session.user.id = token.id; // Assign token.id to session.user.id
         }
         if (token.role) {
           // Ensure session.user is extended to include 'role' in your types/next-auth.d.ts
           (session.user as any).role = token.role; // Cast to any temporarily if role isn't typed on session.user
         }
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin" // Custom sign-in page
  },
  // Use NEXTAUTH_SECRET as per v4 convention
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable NextAuth debug logging
};
