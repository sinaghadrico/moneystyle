import { LandingContent } from "@/components/landing/landing-content";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MoneyStyle — Know Where Every Dollar Goes",
  description:
    "AI-powered personal finance tracker. Scan receipts, compare prices, manage budgets, and get personalized money advice. Free to start.",
  openGraph: {
    title: "MoneyStyle — Know Where Every Dollar Goes",
    description:
      "AI-powered finance tracking. Scan receipts, compare prices, manage budgets. Free to start.",
    type: "website",
    siteName: "MoneyStyle",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyStyle — Know Where Every Dollar Goes",
    description:
      "AI-powered finance tracking. Scan receipts, compare prices, manage budgets. Free to start.",
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
