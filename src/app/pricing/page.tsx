import type { Metadata } from "next";
import { PricingContent } from "@/components/pricing/pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "MoneyStyle is 100% free. All 30 features included. AI features use your own OpenAI API key — or we can set it up for you.",
  alternates: {
    canonical: "https://moneystyle.app/pricing",
  },
  openGraph: {
    title: "Pricing — MoneyStyle",
    description:
      "100% free. All 30 features included. AI features use your own OpenAI key.",
    type: "website",
    siteName: "MoneyStyle",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
