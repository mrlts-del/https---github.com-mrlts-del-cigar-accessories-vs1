// lib/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "./auth-options"; // Import from the new options file

// Initialize Auth.js with the imported options and export the necessary functions/handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
