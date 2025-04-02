// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create a factory function for PrismaClient instantiation
const createPrismaClient = () => {
  return new PrismaClient({
    // Optionally configure logs
    // log: ['query', 'error'],
  }).$extends(withAccelerate())
}

// Define the type for the global object to hold the Prisma Client instance
// This prevents creating multiple instances in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

// Use the existing global instance if available, otherwise create a new one
export const db = globalForPrisma.prisma ?? createPrismaClient()

// In development, store the created instance globally
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
