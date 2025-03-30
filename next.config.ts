import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Re-enable TypeScript errors during build
    // ignoreBuildErrors: true, // Removed
  },
  experimental: {
    // Keep these experimental flags for now
    workerThreads: false,
    cpus: 1
  },
  /* other config options here */
};

export default nextConfig;
