import type { NextConfig } from "next";

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
};

export default nextConfig;
