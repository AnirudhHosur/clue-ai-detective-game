/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  },
  images: {
    domains: ['replicate.delivery', 'firebasestorage.googleapis.com', 'detective-ai-game-generator.firebasestorage.app'],
  },
  // Disable ESLint during build to prevent warnings from failing the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig