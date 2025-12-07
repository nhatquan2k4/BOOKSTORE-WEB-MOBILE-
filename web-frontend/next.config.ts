import type { NextConfig } from "next";

// Determine if we're building for GitHub Pages
const isGithubPages = process.env.GITHUB_PAGES === 'true';
// Replace 'your-repo-name' with your actual repository name
const repoName = process.env.REPO_NAME || 'BOOKSTORE-WEB-MOBILE-';

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: isGithubPages ? 'export' : undefined,
  
  // Set base path for GitHub Pages (repo name)
  basePath: isGithubPages ? `/${repoName}` : '',
  
  // Enable trailing slashes for better compatibility
  trailingSlash: true,
  
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
    ],
    // GitHub Pages requires unoptimized images for static export
    unoptimized: isGithubPages ? true : false,
  },
};

export default nextConfig;
