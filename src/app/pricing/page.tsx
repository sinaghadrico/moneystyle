import type { Metadata } from "next";
import { PricingContent } from "@/components/pricing/pricing-content";

export const metadata: Metadata = {
  title: "Pricing — MoneyStyle",
  description:
    "Start free. Upgrade when you need more. Simple, transparent pricing with no hidden fees.",
  openGraph: {
    title: "Pricing — MoneyStyle",
    description:
      "Start free. Upgrade when you need more. Simple, transparent pricing.",
    type: "website",
    siteName: "MoneyStyle",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
