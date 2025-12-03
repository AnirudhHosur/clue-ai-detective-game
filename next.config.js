/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  },
}

module.exports = nextConfig