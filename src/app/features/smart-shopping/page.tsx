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
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Shopping — MoneyStyle",
    description:
      "Compare real prices from your purchase history. Find the best store or split across stores for maximum savings.",
  },
};

export default function SmartShoppingPage() {
  return <SmartShoppingLanding />;
}
