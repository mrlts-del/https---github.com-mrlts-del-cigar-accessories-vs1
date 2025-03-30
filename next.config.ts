import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    // This helps when there are issues with prerendering
    workerThreads: false,
    cpus: 1
  },
  /* other config options here */
};

export default nextConfig;
