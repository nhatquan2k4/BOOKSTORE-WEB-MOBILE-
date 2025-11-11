import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
        port: '',
        pathname: '/image/**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
