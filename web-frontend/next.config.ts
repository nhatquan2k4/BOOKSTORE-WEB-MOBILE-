import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  
  // 1. Cấu hình Proxy để sửa lỗi CORS (Gọi vào /api-backend sẽ chuyển sang Ngrok)
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'https://tautologously-hyperconscious-carolyne.ngrok-free.dev/api/:path*', 
      },
    ];
  },
  
  // 2. Cho phép tải ảnh từ Ngrok và nguồn khác
  images: {
    remotePatterns: [
      // Production - Ngrok
      { protocol: 'https', hostname: 'tautologously-hyperconscious-carolyne.ngrok-free.dev', port: '', pathname: '/**' },
      // External CDN
      { protocol: 'https', hostname: 'salt.tikicdn.com', port: '', pathname: '/**' },
      // Local development
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '80', pathname: '/**' },
    ],
  },
};

export default nextConfig;