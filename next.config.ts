import type { NextConfig } from "next";

// Comma-separated hosts (e.g. your LAN IP) for dev HMR when opening the app
// from another device. See: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : undefined;

const nextConfig: NextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
};

export default nextConfig;
