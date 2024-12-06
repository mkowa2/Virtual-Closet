import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Bypass ESLint errors during the build
  },
  async redirects() {
    return [
      {
        source: "/", // Redirect the root URL
        destination: "/sign-in", // Target sign-in page
        permanent: true, // Indicates a permanent redirect (301)
      },
    ];
  },
};

export default nextConfig;
