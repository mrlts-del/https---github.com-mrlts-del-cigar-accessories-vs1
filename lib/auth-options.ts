// lib/auth-options.ts
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
export const authOptions: NextAuthConfig = {
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
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? ""
    })
  ],
  callbacks: {
    // Your existing callbacks, ensure they are Edge-compatible
    async jwt({ token, user }) {
       if (user) {
         token.id = user.id;
         token.role = user.role;
       }
       return token;
    },
     async session({ session, token }) {
       if (token && session.user) {
         if (token.id && typeof token.id === 'string') {
           session.user.id = token.id as string; // Persistent TS error here might be ignorable
         }
         if (token.role) {
           session.user.role = token.role;
         }
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin" // Custom sign-in page
  },
  secret: process.env.AUTH_SECRET,
  // debug: process.env.NODE_ENV === 'development', // Optional debug flag for NextAuth itself
};
