import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
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
