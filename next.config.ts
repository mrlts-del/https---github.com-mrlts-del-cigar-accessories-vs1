/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This will disable ESLint checking during the build process
    ignoreDuringBuilds: true,
  },
  experimental: {
    // These settings help with prerender errors
    workerThreads: false,
    cpus: 1
  },
  /* other config options here */
};

module.exports = nextConfig;
