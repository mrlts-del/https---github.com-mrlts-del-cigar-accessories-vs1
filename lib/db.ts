import { PrismaClient } from '@prisma/client'; // Import standard client
import { PrismaNeon } from '@prisma/adapter-neon'; // Import Neon adapter
import { Pool } from '@neondatabase/serverless'; // Import Neon Pool

// Declare a global variable to potentially cache the Prisma Client in development (Node.js only)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Check if we are in a Node.js environment (specifically NOT Edge)
const isNodeEnvironment = typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge';

if (isNodeEnvironment) {
  // In Node.js environment (development or production build)
  if (process.env.NODE_ENV === 'production') {
    // In production build (Node.js), create a single instance
    const neon = new Pool({ connectionString: process.env.DATABASE_URL! });
    const adapter = new PrismaNeon(neon);
    prisma = new PrismaClient({ adapter });
  } else {
    // In development (Node.js), use global caching to avoid multiple instances
    if (!global.prisma) {
      const neon = new Pool({ connectionString: process.env.DATABASE_URL! });
      const adapter = new PrismaNeon(neon);
      global.prisma = new PrismaClient({ adapter });
      console.log("Development: Created global Prisma Client instance (Node.js).");
    } else {
      console.log("Development: Reusing global Prisma Client instance (Node.js).");
    }
    prisma = global.prisma;
  }
} else {
  // In Edge environment (Middleware, Edge Functions)
  // Create a new instance for each request (no global caching)
  const neon = new Pool({ connectionString: process.env.DATABASE_URL! });
  const adapter = new PrismaNeon(neon);
  prisma = new PrismaClient({ adapter });
  // console.log("Edge Environment: Created new Prisma Client instance."); // Optional: Log for debugging Edge
}

export const db = prisma;
