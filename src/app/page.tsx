import { LandingContent } from "@/components/landing/landing-content";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MoneyStyle — Know Where Every Dollar Goes",
  description:
    "AI-powered personal finance tracker. Scan receipts, compare prices, manage budgets, and get personalized money advice. Free to start.",
  alternates: {
    canonical: "https://moneystyle.app/",
  },
  openGraph: {
    title: "MoneyStyle — Know Where Every Dollar Goes",
    description:
      "AI-powered finance tracking. Scan receipts, compare prices, manage budgets. Free to start.",
    type: "website",
    siteName: "MoneyStyle",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MoneyStyle — AI-powered personal finance tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyStyle — Know Where Every Dollar Goes",
    description:
      "AI-powered finance tracking. Scan receipts, compare prices, manage budgets. Free to start.",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "MoneyStyle — AI-powered personal finance tracker",
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
      "AI-powered personal finance tracker. Scan receipts, compare prices, manage budgets, and get personalized money advice.",
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
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MoneyStyle",
    url: "https://moneystyle.app/",
    logo: "https://moneystyle.app/logo.png",
    sameAs: [
      "https://twitter.com/moneystyleapp",
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
      sameAs: ["https://www.linkedin.com/in/sina_ghadri"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sina Ghadri",
    jobTitle: "Founder & CEO, MoneyStyle",
    url: "https://moneystyle.app/about",
    sameAs: ["https://www.linkedin.com/in/sina_ghadri"],
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
          text: "MoneyStyle is an AI-powered personal finance tracker that helps you scan receipts, compare prices, manage budgets, and get personalized money advice. It is free to start.",
        },
      },
      {
        "@type": "Question",
        name: "Is MoneyStyle free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MoneyStyle is free to start with no credit card required. Premium features are available via subscription.",
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
