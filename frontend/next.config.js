/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
        pathname: '/api/v1/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090',
  },
  async rewrites() {
    // Use a server-only env var for proxying (avoid accidental mismatch in NEXT_PUBLIC_API_URL)
    const backend = process.env.BACKEND_URL || 'http://localhost:8090'
    return [
      // Proxy API calls through Next (same-origin), avoids CORS/env mismatch in the browser.
      { source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` },
      { source: '/health', destination: `${backend}/health` },
    ]
  },
}

module.exports = nextConfig

