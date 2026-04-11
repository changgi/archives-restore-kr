import type { NextConfig } from 'next'

const securityHeaders = [
  // Protects against clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable legacy XSS auditor (modern browsers use CSP instead)
  { key: 'X-XSS-Protection', value: '0' },
  // Permissions policy — disable sensors we don't use
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.archives.go.kr',
        pathname: '/next/images/**',
      },
      {
        protocol: 'https',
        hostname: 'archives.go.kr',
        pathname: '/next/images/**',
      },
      {
        protocol: 'https',
        hostname: 'theme.archives.go.kr',
        pathname: '/viewer/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
