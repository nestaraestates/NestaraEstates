import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.31.139', 'localhost'],
  experimental: {
    serverMinification: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
