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

  // 2. Cho phép tải ảnh từ Ngrok và Tiki
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tautologously-hyperconscious-carolyne.ngrok-free.dev', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'salt.tikicdn.com', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;