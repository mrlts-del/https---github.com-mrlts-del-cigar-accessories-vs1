// lib/auth.ts
// Re-export authOptions for potential use elsewhere,
// but remove the v5 initialization causing Edge issues.
export { authOptions } from "./auth-options";

// Note: The handlers, auth, signIn, signOut exports from v5 are removed.
// These functionalities are accessed differently in v4 (e.g., via API route, getSession, useSession).
