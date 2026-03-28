import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["@prisma/client"],
  async redirects() {
    return [
      { source: "/features/money-advice", destination: "/features/money-pilot", permanent: true },
      { source: "/features/wealth-pilot", destination: "/features/money-pilot", permanent: true },
      { source: "/wealth", destination: "/pilot", permanent: true },
    ];
  },
};

export default withSerwist(nextConfig);
