// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options"; // Import the v4 options

// Initialize NextAuth with the options
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };
