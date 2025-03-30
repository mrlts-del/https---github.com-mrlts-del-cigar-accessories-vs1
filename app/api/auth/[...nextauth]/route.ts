// Import NextAuth and the authOptions from the separate lib file
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Import from lib/auth.ts

// Initialize NextAuth with the options
const handler = NextAuth(authOptions);

// Export the handlers for GET and POST requests
export { handler as GET, handler as POST };
