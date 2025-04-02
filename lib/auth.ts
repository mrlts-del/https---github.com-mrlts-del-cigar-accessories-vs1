// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";
import { db } from "./db"; // Import the standard db instance
import { PrismaAdapter } from "@auth/prisma-adapter"; // Import adapter at top level

// Add a debug flag
const DEBUG = false; // Set to true to enable logging

 // Create a conditional adapter function
 function getPrismaAdapter() {
   // Only import adapter when in a Node.js environment (not Edge)
   // Use NEXT_RUNTIME check for better compatibility
   const isNodeEnvironment = process.env.NEXT_RUNTIME !== 'edge';
   if (isNodeEnvironment) {
     // Use the imported adapter and db instance directly
     if (DEBUG) console.log("Node.js environment detected, returning PrismaAdapter instance.");
     // Ensure 'db' is correctly resolved here. It's imported at the top.
     return PrismaAdapter(db);
   } else {
     if (DEBUG) console.log("Edge environment detected, skipping PrismaAdapter.");
     return undefined;
   }
 }

// Log when running in which environment
const adapter = getPrismaAdapter();
if (DEBUG) console.log(`Auth setup: ${adapter ? 'Using PrismaAdapter' : 'Skipping PrismaAdapter (Edge or incompatible environment)'}.`);

// Define the configuration directly within NextAuth call
const authConfig: NextAuthConfig = {
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
         // No need for dynamic import or getEdgePrisma anymore

         if (!credentials?.email || !credentials?.password) {
           return null;
         }

         try {
           // Use the standard db instance for the query
           const user = await db.user.findUnique({
             where: { email: credentials.email as string }
           });

          if (!user || !user.password) {
            // Add password hash comparison here in a real app
            if (DEBUG) console.log("Authorize: User not found or no password set.");
            return null;
          }

          // IMPORTANT: Add password verification logic here
          // Example: const isValid = await compare(credentials.password, user.password);
          // if (!isValid) return null;

          if (DEBUG) console.log("Authorize: User found, returning user object.");
          // Return the necessary user details for the JWT callback
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
         // No finally block needed for cached client
       }
    }),
    // OAuth providers with nullish coalescing for environment variables
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
    // The 'user' object in jwt comes from 'authorize' or OAuth provider
    async jwt({ token, user, account, profile }) {
       // The 'user' object here is the return value from 'authorize' or OAuth profile
       if (user) {
         // Assign properties from user object to token
         token.id = user.id;
         // Ensure role is correctly typed based on next-auth.d.ts (should be Prisma Role)
         token.role = user.role;
       }
       // You might want to handle OAuth account linking here if using adapter + JWT
       return token;
    },
     async session({ session, token }) {
       // Add custom properties from the JWT (token) to the session
       if (token && session.user) {
         // Check if token.id exists and is a string before assigning
         if (token.id && typeof token.id === 'string') {
           // Add explicit cast even though type is confirmed, to try and satisfy TS
           session.user.id = token.id as string;
         }
         // Role from JWT (should be Prisma Role enum based on next-auth.d.ts)
         // Add a check for role as well for robustness
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
  // Add secret if not using default behavior
  secret: process.env.AUTH_SECRET,
  // Debugging can be helpful
  // debug: process.env.NODE_ENV === 'development',
};

// Initialize Auth.js and export the handlers, auth function, etc.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
