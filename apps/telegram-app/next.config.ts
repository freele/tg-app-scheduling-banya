import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bania/shared", "@bania/supabase", "@bania/google-calendar"],
};

export default nextConfig;
