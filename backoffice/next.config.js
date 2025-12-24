/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8090',
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:8090'
    return [
      { source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` },
      { source: '/health', destination: `${backend}/health` },
    ]
  },
}

module.exports = nextConfig


