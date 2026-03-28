import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth/error",
          "/dashboard",
          "/transactions",
          "/profile",
          "/settings",
          "/admin",
          "/pilot",
          "/wealth",
          "/chat",
          "/money-map",
          "/lifestyle",
          "/onboarding",
          "/api/",
          "/_next/",
          "*/opengraph-image",
          "*/twitter-image",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
    ],
    sitemap: "https://moneystyle.app/sitemap.xml",
  };
}
