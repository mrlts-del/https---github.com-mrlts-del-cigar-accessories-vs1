// lib/auth.ts
import NextAuth from "next-auth" // Remove explicit User import
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import { db } from "./db"
// Rely on Role type augmentation from types/next-auth.d.ts

// First, define and export the authOptions
export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
         email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) { // Remove return type annotation
          // Your authorization logic
          if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          // Consider adding password hashing and comparison here
          return null
        }

        // Return user object if credentials are valid
         // Return the essential data needed for the jwt callback
         // Include DefaultUser fields as NextAuth might expect them internally
         return {
           id: user.id,
           role: user.role, // Prisma Role enum
           name: user.name, // Can be null/undefined
           email: user.email, // Can be null/undefined
           image: user.image, // Can be null/undefined
         };
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
    // Your callbacks
      async jwt({ token, user }) {
        // The 'user' object here is the return value from 'authorize'
        if (user) {
          // Assign properties to token, matching types in next-auth.d.ts
          // Ensure the types from 'user' (authorize return) are compatible
          token.id = user.id; // Should be string
          token.role = user.role; // Should be Prisma Role enum
        }
      return token
    },
    async session({ session, token }) {
      // Add custom properties from the JWT (token) to the session
       if (token && session.user) {
         // Revert to simpler check, relying on augmentation for correct types
         if (token.role) {
           session.user.role = token.role;
         }
         if (token.id) {
          session.user.id = token.id as string     // Cast id if necessary
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin" // Custom sign-in page
  },
  // Add session strategy if needed, e.g., 'jwt'
  session: {
    strategy: "jwt",
  },
  // Add secret if not using default behavior
  secret: process.env.AUTH_SECRET,
}

// Then initialize Auth.js and export the handlers, auth function, etc.
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
