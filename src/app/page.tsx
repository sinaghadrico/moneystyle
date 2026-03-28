import { LandingContent } from "@/components/landing/landing-content";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MoneyStyle — Know Where Every Dollar Goes",
  description:
    "100% free personal finance tracker with 30 features. Track expenses, scan receipts, manage budgets, detect subscriptions, and track investments. AI features use your own OpenAI key.",
  alternates: {
    canonical: "https://moneystyle.app/",
  },
  openGraph: {
    title: "MoneyStyle — Free Personal Finance Tracker",
    description:
      "100% free. 30 features. Track expenses, scan receipts, manage budgets, detect subscriptions. AI features use your own OpenAI key.",
    type: "website",
    siteName: "MoneyStyle",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MoneyStyle — Free Personal Finance Tracker with 30 Features",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyStyle — Free Personal Finance Tracker",
    description:
      "100% free. 30 features. Track expenses, scan receipts, manage budgets, detect subscriptions. AI features use your own OpenAI key.",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "MoneyStyle — Free Personal Finance Tracker with 30 Features",
      },
    ],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MoneyStyle",
    url: "https://moneystyle.app/",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "100% free personal finance tracker with 30 features. Track expenses, scan receipts, manage budgets, detect subscriptions, and track investments. AI features use your own OpenAI API key.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI Receipt Scanner",
      "Budget Management",
      "Price Comparison",
      "Savings Goals",
      "Multi-Currency Support",
      "Investment Tracking",
      "Subscription Detection",
      "Household Sharing",
      "Developer API",
      "Financial Tips",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MoneyStyle",
    url: "https://moneystyle.app/",
    logo: "https://moneystyle.app/logo.png",
    sameAs: [
      "https://x.com/moneystyleapp",
      "https://www.linkedin.com/company/moneystyle",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@moneystyle.app",
    },
    founder: {
      "@type": "Person",
      name: "Sina Ghadri",
      jobTitle: "Founder & CEO",
      url: "https://moneystyle.app/about",
      sameAs: ["https://www.linkedin.com/in/sina-ghadri"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sina Ghadri",
    jobTitle: "Founder & CEO, MoneyStyle",
    url: "https://moneystyle.app/about",
    sameAs: ["https://www.linkedin.com/in/sina-ghadri"],
    worksFor: {
      "@type": "Organization",
      name: "MoneyStyle",
      url: "https://moneystyle.app/",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is MoneyStyle?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MoneyStyle is an AI-powered personal finance tracker that helps you scan receipts, compare prices, manage budgets, and get personalized Money Pilot. It is free to start.",
        },
      },
      {
        "@type": "Question",
        name: "Is MoneyStyle free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MoneyStyle is 100% free. All 30 features — budgets, transactions, reserves, investments, subscriptions, and more — are completely free with no credit card required. AI-powered features like receipt scanning and Money Pilot require an OpenAI API key, which you can set up yourself or have us configure for you.",
        },
      },
      {
        "@type": "Question",
        name: "How does the AI receipt scanner work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply snap a photo of any receipt and MoneyStyle's AI automatically extracts the merchant, date, items, and total — categorizing the expense instantly.",
        },
      },
      {
        "@type": "Question",
        name: "How do AI features work in MoneyStyle?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI features like receipt scanning, Money Pilot, meal planning, and money chat are powered by OpenAI. You bring your own API key (costs about $0.01 per use) and set it in Settings. If you prefer, you can message us and we'll set up the API key for you. All non-AI features (budgets, transactions, investments, subscriptions, etc.) are completely free with no API key needed.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MoneyStyle",
    url: "https://moneystyle.app/",
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "SiteNavigationElement", name: "Features", url: "https://moneystyle.app/#features" },
      { "@type": "SiteNavigationElement", name: "Pricing", url: "https://moneystyle.app/pricing" },
      { "@type": "SiteNavigationElement", name: "About", url: "https://moneystyle.app/about" },
      { "@type": "SiteNavigationElement", name: "API Docs", url: "https://moneystyle.app/docs/api" },
      { "@type": "SiteNavigationElement", name: "Smart Dashboard", url: "https://moneystyle.app/features/smart-dashboard" },
      { "@type": "SiteNavigationElement", name: "Receipt Scanner", url: "https://moneystyle.app/features/receipt-scanner" },
      { "@type": "SiteNavigationElement", name: "Budget Management", url: "https://moneystyle.app/features/budget-management" },
      { "@type": "SiteNavigationElement", name: "Investment Tracking", url: "https://moneystyle.app/features/investment-tracking" },
      { "@type": "SiteNavigationElement", name: "Subscription Detection", url: "https://moneystyle.app/features/subscription-detection" },
      { "@type": "SiteNavigationElement", name: "Sign Up Free", url: "https://moneystyle.app/auth/register" },
    ],
  },
];

export default function LandingPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <LandingContent />
    </>
  );
}
