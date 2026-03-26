export type ComparisonConfig = {
  slug: string;
  name: string;
  tagline: string;
  pricing: string;
  heroDescription: string;
  advantages: { title: string; description: string }[];
  featureMatrix: {
    feature: string;
    moneystyle: boolean | string;
    competitor: boolean | string;
  }[];
  faq: { question: string; answer: string }[];
};

export const COMPARISONS: ComparisonConfig[] = [
  {
    slug: "ynab",
    name: "YNAB (You Need A Budget)",
    tagline: "The free alternative to YNAB with AI superpowers",
    pricing: "$14.99/mo",
    heroDescription:
      "YNAB is a popular budgeting app, but at $14.99/month it adds up fast. MoneyStyle gives you everything YNAB offers — and much more — completely free. AI-powered insights, receipt scanning, lifestyle features, and global support included.",
    advantages: [
      {
        title: "Completely Free",
        description:
          "MoneyStyle is 100% free. No trial period, no hidden fees. YNAB costs $14.99/month ($179.88/year) and only offers a 34-day trial.",
      },
      {
        title: "AI-Powered Insights",
        description:
          "Get personalized money pilot, smart spending analysis, and AI-generated financial tips. YNAB has no AI features at all.",
      },
      {
        title: "Receipt Scanning with AI",
        description:
          "Snap a photo of any receipt and MoneyStyle automatically extracts items, amounts, and categories using AI. YNAB cannot scan receipts.",
      },
      {
        title: "Lifestyle Features Built In",
        description:
          "Weekend planner, meal planner, and smart shopping lists help you live better on your budget. YNAB is strictly a budgeting tool.",
      },
      {
        title: "Global & Multi-Currency",
        description:
          "MoneyStyle works worldwide with multi-currency support. YNAB is primarily designed for US and Canadian users.",
      },
      {
        title: "Smart Shopping & Price Analysis",
        description:
          "Track prices, compare deals, and get shopping recommendations. YNAB doesn't help you save money on purchases.",
      },
    ],
    featureMatrix: [
      { feature: "Monthly Price", moneystyle: "Free", competitor: "$14.99/mo" },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "Savings Goals", moneystyle: true, competitor: true },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Price Analysis", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: "Limited" },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Shared Expenses", moneystyle: true, competitor: false },
      { feature: "Telegram Bot", moneystyle: true, competitor: false },
      { feature: "Global Availability", moneystyle: true, competitor: "US/Canada" },
    ],
    faq: [
      {
        question: "Is MoneyStyle really free compared to YNAB?",
        answer:
          "Yes, MoneyStyle is completely free with no hidden costs. YNAB charges $14.99/month (or $99.99/year), which adds up to nearly $180 per year. MoneyStyle offers more features at zero cost.",
      },
      {
        question: "Can I import my data from YNAB to MoneyStyle?",
        answer:
          "You can export your transactions from YNAB as a CSV file and manually add them to MoneyStyle. We are working on a direct import feature to make switching even easier.",
      },
      {
        question: "Does MoneyStyle support zero-based budgeting like YNAB?",
        answer:
          "MoneyStyle supports flexible budget management that lets you allocate every dollar if you prefer zero-based budgeting. Plus, you get AI-powered recommendations to optimize your budget automatically.",
      },
      {
        question: "What does MoneyStyle offer that YNAB doesn't?",
        answer:
          "MoneyStyle includes AI receipt scanning, personalized money pilot, meal planning, weekend planning, smart shopping lists, price analysis, shared expenses, Telegram bot integration, and multi-currency support — none of which are available in YNAB.",
      },
    ],
  },
  {
    slug: "monarch",
    name: "Monarch Money",
    tagline: "The free Monarch Money alternative with AI and lifestyle tools",
    pricing: "$99.99/yr",
    heroDescription:
      "Monarch Money is a solid finance tracker at $99.99/year, but MoneyStyle delivers the same core features plus AI insights, receipt scanning, and lifestyle planning — all for free. No credit card required, no annual commitment.",
    advantages: [
      {
        title: "Completely Free",
        description:
          "MoneyStyle costs nothing. Monarch Money charges $99.99/year ($8.33/month) with a limited free trial. Save that $100 every year.",
      },
      {
        title: "AI Receipt Scanning",
        description:
          "Photograph receipts and let AI extract every line item automatically. Monarch Money does not offer any receipt scanning capability.",
      },
      {
        title: "Lifestyle Planning Tools",
        description:
          "Plan your weekends, meals, and shopping within the same app you track finances. Monarch is limited to numbers and charts.",
      },
      {
        title: "AI-Powered Money Pilot",
        description:
          "Receive personalized financial recommendations based on your spending patterns. Monarch provides data but not actionable AI advice.",
      },
      {
        title: "Works Everywhere",
        description:
          "MoneyStyle is built for a global audience with multi-currency support. Monarch Money is designed primarily for US users.",
      },
      {
        title: "Smart Shopping & Price Tracking",
        description:
          "Track product prices and get deal recommendations. Monarch Money focuses solely on tracking what you have already spent.",
      },
    ],
    featureMatrix: [
      { feature: "Annual Price", moneystyle: "Free", competitor: "$99.99/yr" },
      { feature: "Net Worth Tracking", moneystyle: true, competitor: true },
      { feature: "Investment Tracking", moneystyle: "Basic", competitor: true },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Price Analysis", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: "Limited" },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Shared Expenses", moneystyle: true, competitor: true },
      { feature: "Global Availability", moneystyle: true, competitor: "US only" },
    ],
    faq: [
      {
        question: "How does MoneyStyle compare to Monarch Money for budgeting?",
        answer:
          "Both apps offer robust budgeting and transaction tracking. MoneyStyle adds AI-powered insights, receipt scanning, and lifestyle features on top, and it is completely free — saving you $99.99 per year compared to Monarch.",
      },
      {
        question: "Does MoneyStyle track investments like Monarch Money?",
        answer:
          "MoneyStyle offers basic income and savings tracking. If you need deep brokerage-level investment tracking, Monarch may have an edge there. However, MoneyStyle compensates with AI features and lifestyle tools that Monarch lacks entirely.",
      },
      {
        question: "Can I use MoneyStyle outside the United States?",
        answer:
          "Absolutely. MoneyStyle is built for global users with multi-currency support and works in any country. Monarch Money is primarily designed for US-based financial institutions.",
      },
      {
        question: "Is MoneyStyle good for couples like Monarch Money?",
        answer:
          "Yes. MoneyStyle supports shared expenses and collaborative finance tracking. Combined with free access for everyone, it is an excellent choice for couples who want to manage money together without paying $100/year.",
      },
    ],
  },
  {
    slug: "copilot",
    name: "Copilot Money",
    tagline: "The free, cross-platform alternative to Copilot Money",
    pricing: "$13/mo",
    heroDescription:
      "Copilot Money looks great on iPhone but costs $13/month and only works on Apple devices. MoneyStyle works on every device, includes AI features Copilot lacks, and is completely free.",
    advantages: [
      {
        title: "Works on Every Device",
        description:
          "MoneyStyle runs on Android, iPhone, tablets, and desktop browsers. Copilot Money is Apple-only — no Android, no web app for full use.",
      },
      {
        title: "Completely Free",
        description:
          "No subscription needed. Copilot charges $13/month ($156/year) just to track your spending. MoneyStyle does it for free.",
      },
      {
        title: "AI Receipt Scanning",
        description:
          "Scan receipts with AI to automatically log expenses and extract line items. Copilot Money has no receipt scanning feature.",
      },
      {
        title: "Lifestyle & Planning Tools",
        description:
          "Meal planning, weekend planning, and smart shopping built right in. Copilot is a finance-only app with no lifestyle integration.",
      },
      {
        title: "AI Money Pilot",
        description:
          "Get smart, personalized financial recommendations powered by AI. Copilot shows you data but doesn't advise you on what to do next.",
      },
      {
        title: "Global Multi-Currency Support",
        description:
          "Track expenses in any currency, anywhere in the world. Copilot Money is limited to US financial institutions only.",
      },
    ],
    featureMatrix: [
      { feature: "Monthly Price", moneystyle: "Free", competitor: "$13/mo" },
      { feature: "Android App", moneystyle: true, competitor: false },
      { feature: "iOS App", moneystyle: true, competitor: true },
      { feature: "Web App", moneystyle: true, competitor: "Limited" },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: false },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Shared Expenses", moneystyle: true, competitor: false },
      { feature: "Global Availability", moneystyle: true, competitor: "US only" },
    ],
    faq: [
      {
        question: "Can I use MoneyStyle on Android unlike Copilot Money?",
        answer:
          "Yes. MoneyStyle is a web-based app that works perfectly on Android, iOS, tablets, and desktop browsers. Copilot Money is exclusively available on Apple devices (iPhone, iPad, Mac).",
      },
      {
        question: "Is MoneyStyle as well-designed as Copilot Money?",
        answer:
          "MoneyStyle features a clean, modern UI built with mobile-first design principles. While Copilot is known for its Apple-native design, MoneyStyle delivers a polished experience across all platforms.",
      },
      {
        question: "How much would I save switching from Copilot to MoneyStyle?",
        answer:
          "Copilot Money costs $13/month or $156/year. Switching to MoneyStyle saves you that entire amount since MoneyStyle is completely free with no premium tiers or hidden charges.",
      },
      {
        question: "Does MoneyStyle connect to my bank like Copilot?",
        answer:
          "MoneyStyle supports manual transaction entry, SMS import, and receipt scanning for logging expenses. It focuses on giving you full control of your data rather than relying on bank connections that often break.",
      },
    ],
  },
  {
    slug: "rocket-money",
    name: "Rocket Money",
    tagline: "The free Rocket Money alternative with AI smarts",
    pricing: "$6-12/mo",
    heroDescription:
      "Rocket Money helps you cancel subscriptions, but charges $6-12/month for premium features. MoneyStyle gives you comprehensive budgeting, AI insights, receipt scanning, and lifestyle tools — all free. No hidden fees, no negotiation commissions.",
    advantages: [
      {
        title: "Completely Free",
        description:
          "MoneyStyle is free forever. Rocket Money charges $6-12/month for premium and takes a percentage of savings from bill negotiations.",
      },
      {
        title: "AI-Powered Financial Advice",
        description:
          "Get personalized money tips and spending analysis from AI. Rocket Money focuses on bill negotiation, not holistic financial guidance.",
      },
      {
        title: "AI Receipt Scanning",
        description:
          "Scan any receipt to automatically log expenses with AI extraction. Rocket Money does not offer receipt scanning of any kind.",
      },
      {
        title: "Lifestyle Planning Built In",
        description:
          "Plan meals, weekends, and shopping alongside your finances. Rocket Money is solely focused on bills and subscriptions.",
      },
      {
        title: "No Commission on Savings",
        description:
          "Rocket Money takes up to 60% of the money they save you on bill negotiations. MoneyStyle never takes a cut of your savings.",
      },
      {
        title: "Global Availability",
        description:
          "MoneyStyle works worldwide with multi-currency support. Rocket Money only works with US-based financial institutions and service providers.",
      },
    ],
    featureMatrix: [
      { feature: "Monthly Price", moneystyle: "Free", competitor: "$6-12/mo" },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "Subscription Tracking", moneystyle: true, competitor: true },
      { feature: "Bill Negotiation", moneystyle: false, competitor: "Paid (commission)" },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Price Analysis", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: false },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Savings Goals", moneystyle: true, competitor: true },
      { feature: "Global Availability", moneystyle: true, competitor: "US only" },
    ],
    faq: [
      {
        question: "Does MoneyStyle cancel subscriptions like Rocket Money?",
        answer:
          "MoneyStyle tracks your subscriptions and recurring bills so you can see exactly what you are paying for. While it does not auto-negotiate or cancel on your behalf, it helps you identify and manage subscriptions yourself — without paying a commission.",
      },
      {
        question: "Is MoneyStyle really free while Rocket Money charges?",
        answer:
          "Yes. MoneyStyle is 100% free. Rocket Money has a free tier with limited features, but charges $6-12/month for premium and takes up to 60% commission on any bill savings they negotiate for you.",
      },
      {
        question: "What does MoneyStyle offer that Rocket Money does not?",
        answer:
          "MoneyStyle includes AI receipt scanning, personalized money pilot, meal planning, weekend planning, smart shopping, price analysis, multi-currency support, and installment tracking — none of which Rocket Money provides.",
      },
      {
        question: "Can I track bills and recurring expenses on MoneyStyle?",
        answer:
          "Absolutely. MoneyStyle has dedicated bills and installment tracking features that let you monitor all recurring expenses, set reminders, and see upcoming payments at a glance.",
      },
    ],
  },
  {
    slug: "lunch-money",
    name: "Lunch Money",
    tagline: "The free Lunch Money alternative with mobile app and AI",
    pricing: "~$10/mo",
    heroDescription:
      "Lunch Money is a developer-friendly finance tracker at ~$10/month, but it lacks a native mobile app and AI features. MoneyStyle gives you a polished mobile experience, AI receipt scanning, lifestyle tools, and more — completely free.",
    advantages: [
      {
        title: "Mobile-First Design",
        description:
          "MoneyStyle is built mobile-first with a responsive, app-like experience. Lunch Money has no native mobile app — only a desktop web interface.",
      },
      {
        title: "Completely Free",
        description:
          "No monthly fee. Lunch Money charges approximately $10/month ($120/year). MoneyStyle delivers more features at zero cost.",
      },
      {
        title: "AI Receipt Scanning",
        description:
          "Scan receipts on the go and let AI handle categorization. Lunch Money has no AI features or receipt scanning capability.",
      },
      {
        title: "AI Money Pilot",
        description:
          "Get personalized financial insights and recommendations powered by AI. Lunch Money shows data but provides no intelligent guidance.",
      },
      {
        title: "Lifestyle Features",
        description:
          "Meal planner, weekend planner, and smart shopping lists are built in. Lunch Money is a spreadsheet-style tracker with no lifestyle integration.",
      },
      {
        title: "Telegram Bot Integration",
        description:
          "Log expenses and check balances directly from Telegram. Lunch Money relies on its API for automation but has no chat bot support.",
      },
    ],
    featureMatrix: [
      { feature: "Monthly Price", moneystyle: "Free", competitor: "~$10/mo" },
      { feature: "Mobile App", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: true },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "Developer API", moneystyle: false, competitor: true },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Price Analysis", moneystyle: true, competitor: false },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Telegram Bot", moneystyle: true, competitor: false },
      { feature: "Shared Expenses", moneystyle: true, competitor: false },
    ],
    faq: [
      {
        question: "Does Lunch Money have a mobile app?",
        answer:
          "No. Lunch Money is a web-only application with no native mobile app. MoneyStyle is designed mobile-first and works beautifully on phones, tablets, and desktops alike.",
      },
      {
        question: "Is MoneyStyle good for developers like Lunch Money?",
        answer:
          "While Lunch Money is known for its developer API, MoneyStyle focuses on providing a polished user experience with AI-powered features. It is designed for anyone who wants smart finance management without writing code.",
      },
      {
        question: "Can MoneyStyle handle multiple currencies like Lunch Money?",
        answer:
          "Yes. MoneyStyle supports multi-currency tracking just like Lunch Money, so you can manage finances across different countries and currencies with ease.",
      },
      {
        question: "How much would I save switching from Lunch Money?",
        answer:
          "Lunch Money costs approximately $10/month or $120/year. Switching to MoneyStyle saves you that full amount while gaining AI features, a mobile app, and lifestyle planning tools.",
      },
    ],
  },
  {
    slug: "mint",
    name: "Mint (Discontinued)",
    tagline: "Mint is gone — MoneyStyle is the free alternative you need",
    pricing: "Discontinued",
    heroDescription:
      "Mint was shut down in early 2024, leaving millions of users without a free finance tracker. MoneyStyle is the perfect replacement — free, modern, AI-powered, and packed with features Mint never had. No ads, no upsells, just smart money management.",
    advantages: [
      {
        title: "Actually Available",
        description:
          "Mint was discontinued and merged into Credit Karma. MoneyStyle is actively developed and free to use today.",
      },
      {
        title: "No Ads, No Upsells",
        description:
          "Mint was free but plastered with ads and credit card offers. MoneyStyle is clean and ad-free — your finances, not marketing.",
      },
      {
        title: "AI-Powered Intelligence",
        description:
          "MoneyStyle uses AI for receipt scanning, money pilot, and spending insights. Mint relied on basic categorization rules from a decade ago.",
      },
      {
        title: "Lifestyle Features",
        description:
          "Meal planning, weekend planning, and smart shopping go beyond what any traditional finance app offers. Mint never had these.",
      },
      {
        title: "Modern, Fast Interface",
        description:
          "Built with modern technology for a fast, responsive experience. Mint became notoriously slow and buggy in its later years.",
      },
      {
        title: "Your Data Stays Private",
        description:
          "MoneyStyle does not sell your data or show targeted financial product ads. Mint monetized user data through Intuit's advertising network.",
      },
    ],
    featureMatrix: [
      { feature: "Status", moneystyle: "Active", competitor: "Discontinued" },
      { feature: "Price", moneystyle: "Free", competitor: "Was Free (with ads)" },
      { feature: "Ad-Free Experience", moneystyle: true, competitor: false },
      { feature: "Budget Management", moneystyle: true, competitor: true },
      { feature: "Transaction Tracking", moneystyle: true, competitor: true },
      { feature: "Credit Score", moneystyle: false, competitor: true },
      { feature: "AI Money Pilot", moneystyle: true, competitor: false },
      { feature: "AI Receipt Scanning", moneystyle: true, competitor: false },
      { feature: "Meal Planner", moneystyle: true, competitor: false },
      { feature: "Weekend Planner", moneystyle: true, competitor: false },
      { feature: "Smart Shopping Lists", moneystyle: true, competitor: false },
      { feature: "Multi-Currency", moneystyle: true, competitor: false },
      { feature: "Installment Tracking", moneystyle: true, competitor: false },
      { feature: "Telegram Bot", moneystyle: true, competitor: false },
      { feature: "Active Development", moneystyle: true, competitor: false },
    ],
    faq: [
      {
        question: "What happened to Mint?",
        answer:
          "Intuit shut down Mint in early 2024 and migrated users to Credit Karma. Many users were left looking for a free, ad-free alternative — which is exactly what MoneyStyle provides.",
      },
      {
        question: "Is MoneyStyle a good replacement for Mint?",
        answer:
          "Yes. MoneyStyle offers everything Mint did — budgeting, transaction tracking, and financial overview — plus AI features, receipt scanning, and lifestyle tools that Mint never had. And unlike Mint, there are no ads.",
      },
      {
        question: "Can I import my old Mint data into MoneyStyle?",
        answer:
          "If you exported your Mint data before it shut down, you can manually add your transaction history to MoneyStyle. We recommend starting fresh to take full advantage of AI-powered categorization.",
      },
      {
        question: "Will MoneyStyle also shut down like Mint?",
        answer:
          "MoneyStyle is independently built and actively developed. Unlike Mint, which was a legacy product inside a large corporation, MoneyStyle is focused solely on being the best free finance app and has no conflicting business interests.",
      },
    ],
  },
];

export function getComparison(slug: string): ComparisonConfig | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
