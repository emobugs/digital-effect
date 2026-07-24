import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" махнато — сайтът върви като Node app (Hostinger),
  // за да работят API routes (/api/contact → Resend).
  images: {
    unoptimized: true,
  },
  experimental: {
    cpus: 1,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.parallelism = 1;
    }
    return config;
  },
};

export default nextConfig;
