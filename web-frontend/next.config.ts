import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
        port: '',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'salt.tikicdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
