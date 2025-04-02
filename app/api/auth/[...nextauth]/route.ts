// app/api/auth/[...nextauth]/route.ts
// Note: Adjust the import path if your lib directory is structured differently
// Assuming 'lib' is directly under the project root based on previous context.
import { handlers } from "@/lib/auth"; // Use alias if configured, or direct path '../../../../lib/auth'

export const { GET, POST } = handlers;

// If you were previously using NextAuth directly like below, remove it:
// import NextAuth from "next-auth"
// import { authOptions } from "@/lib/auth" // Or direct path
// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
