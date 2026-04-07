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
    ],
  },
};

export default nextConfig;
