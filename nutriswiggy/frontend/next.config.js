/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow running inside different ports easily if needed
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
