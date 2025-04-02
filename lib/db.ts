// lib/db.ts
import { PrismaClient } from '@prisma/client'; // Use standard client

// Add a debug flag
const DEBUG = false; // Set to true to enable logging

// Standard Prisma Client creation function
function createPrismaClient() {
  if (DEBUG) console.log("Creating standard Prisma Client instance.");
  return new PrismaClient();
}

// Type definition for the global prisma instance
type GlobalPrisma = ReturnType<typeof createPrismaClient>;

// Global caching logic
let prisma: GlobalPrisma | undefined;

// Check if we are NOT in the Edge runtime environment
const isNodeEnvironment = process.env.NEXT_RUNTIME !== 'edge';

if (isNodeEnvironment) {
  if (DEBUG) console.log("Detected Node.js environment (or not Edge). Applying global caching.");
  if (process.env.NODE_ENV === 'production') {
    prisma = createPrismaClient();
  } else {
    // In development, use global object to prevent too many connections
    const globalWithPrisma = global as typeof globalThis & {
      prisma?: GlobalPrisma;
    };
    if (!globalWithPrisma.prisma) {
      if (DEBUG) console.log("Development environment: Creating new global Prisma instance.");
      globalWithPrisma.prisma = createPrismaClient();
    } else {
      if (DEBUG) console.log("Development environment: Reusing existing global Prisma instance.");
    }
    prisma = globalWithPrisma.prisma;
  }
} else {
  // In Edge environments, this setup won't cache.
  if (DEBUG) console.log("Detected Edge environment. Global 'db' instance will be undefined.");
  // prisma remains undefined for Edge in this module's scope.
}

// Export the cached instance for Node.js environments.
export const db = prisma!; // Use non-null assertion cautiously. Code using this export should only run in Node.js context.

// Export the creator function if needed elsewhere
export { createPrismaClient };
