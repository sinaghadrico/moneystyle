import type { Metadata } from "next";
import { SmartShoppingLanding } from "@/components/features/smart-shopping-landing";

export const metadata: Metadata = {
  title: "Smart Shopping — MoneyStyle",
  description:
    "Build your shopping list, compare prices across stores from your own data, and find the cheapest way to shop — single store or split strategy.",
  openGraph: {
    title: "Smart Shopping — MoneyStyle",
    description:
      "Compare real prices from your purchase history. Find the best store or split across stores for maximum savings.",
    type: "website",
    siteName: "MoneyStyle",
    images: [
      {
        url: "/features/smart-shopping/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Smart Shopping — MoneyStyle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Shopping — MoneyStyle",
    description:
      "Compare real prices from your purchase history. Find the best store or split across stores for maximum savings.",
    images: [
      {
        url: "/features/smart-shopping/twitter-image",
        width: 1200,
        height: 630,
        alt: "Smart Shopping — MoneyStyle",
      },
    ],
  },
};

export default function SmartShoppingPage() {
  return <SmartShoppingLanding />;
}
