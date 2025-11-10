import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove "output: export" to allow dynamic routes with client components
  // output: "export",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.vietqr.io",
        port: "",
        pathname: "/image/**",
      },
    ],
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
