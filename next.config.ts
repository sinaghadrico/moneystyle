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
};

export default withSerwist(nextConfig);
