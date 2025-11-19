import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: "./",
  },
  images: {
    domains: ["randomuser.me", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
