import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Bypass ESLint errors during the build
  },
};

export default nextConfig;
