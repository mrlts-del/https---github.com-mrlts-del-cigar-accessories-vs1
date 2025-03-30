/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Keep ESLint disabled during build as per guide
    ignoreDuringBuilds: true,
  },
  // Remove the typescript block entirely to re-enable TS checks (default is false)
  // typescript: {
  //   ignoreBuildErrors: false,
  // },
  experimental: {
    // Keep these experimental flags
    workerThreads: false,
    cpus: 1
  },
  /* other config options here */
};

module.exports = nextConfig;
