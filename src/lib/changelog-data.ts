export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: {
    type: "feature" | "improvement" | "fix";
    text: string;
  }[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2026-03-21",
    title: "Major Feature Expansion — Maps, Voice, Gamification & More",
    description:
      "Biggest update ever with 16+ new features including Google Maps integration, voice transactions, financial challenges, travel mode, and a complete onboarding experience.",
    changes: [
      { type: "feature", text: "Budget Rollover — unspent budget carries to next month automatically" },
      { type: "feature", text: "Onboarding Wizard — 4-step setup guide for new users (goal, currency, first budget)" },
      { type: "feature", text: "Competitor comparison pages — /vs/ynab, /vs/monarch, /vs/copilot, /vs/rocket-money, /vs/lunch-money, /vs/mint" },
      { type: "feature", text: "For Couples marketing page — household sharing and split expense features highlighted" },
      { type: "feature", text: "Net Worth Dashboard — total assets minus liabilities with breakdown card" },
      { type: "feature", text: "Financial Challenges & Gamification — no-spend days, saving targets, streaks, 6 badge types" },
      { type: "feature", text: "Shareable Wrapped Cards — 5 story-style cards (9:16) with Web Share API / PNG download" },
      { type: "feature", text: "PWA Shortcuts — long-press app icon for quick Expense, Income, Scan, Dashboard" },
      { type: "feature", text: "Quick Actions bar on mobile dashboard — 4 color-coded action buttons" },
      { type: "feature", text: "Money Map with Google Maps — transactions plotted on real map with colored pins by spend amount" },
      { type: "feature", text: "Location Picker — search places via Google Places Autocomplete or tap on map" },
      { type: "feature", text: "GPS capture on transactions — auto-capture coordinates with one tap" },
      { type: "feature", text: "Voice Transaction — record voice, AI transcribes (Whisper) and parses (GPT-4) into transaction form" },
      { type: "feature", text: "Money Mood — tag transactions with mood (😄🙂😐😟😫), see spending-by-mood insights on dashboard" },
      { type: "feature", text: "Price Watch — alerts when item prices change >10%, dashboard card with price trend badges" },
      { type: "feature", text: "Merchant Intelligence — full merchant profiles with visit frequency, sparkline trends, insights" },
      { type: "feature", text: "Household Leaderboard — podium, weekly winner, composite score from budget/savings/streak" },
      { type: "feature", text: "Savings Jar — animated SVG jar with liquid fill, wave effect, coin drop animation" },
      { type: "feature", text: "Travel Mode — start/end trips, auto-tag transactions, trip summary with category breakdown" },
      { type: "improvement", text: "Dashboard layout — title and filters stack on mobile, side-by-side on desktop" },
      { type: "improvement", text: "Reduced border-radius across all internal app components for cleaner look" },
      { type: "improvement", text: "Location field added to Add and Edit transaction forms" },
      { type: "improvement", text: "Mood picker in both mobile cards and desktop table view" },
      { type: "improvement", text: "Voice button checks for OpenAI API key before recording" },
      { type: "fix", text: "Budget rollover correctly handles negative rollover (overspend)" },
      { type: "fix", text: "Challenges constants moved out of server actions to fix client import error" },
      { type: "fix", text: "Service worker type error with custom caching fixed" },
      { type: "fix", text: "Location update now properly saved via transaction update action" },
      { type: "fix", text: "Mood picker works on mobile — moved outside SwipeableCard to prevent tap interception" },
      { type: "fix", text: "Share cards responsive — scales to fit any screen size" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-03-19",
    title: "SEO, Analytics & Developer API",
    description:
      "Major update focused on discoverability, developer tools, and new financial features.",
    changes: [
      { type: "feature", text: "Developer REST API — full CRUD for transactions, categories, and accounts with Bearer token auth" },
      { type: "feature", text: "API Documentation page at /docs/api with interactive examples" },
      { type: "feature", text: "Investment Tracking — track stocks, ETFs, and bonds with live prices from Yahoo Finance" },
      { type: "feature", text: "Subscription Detection — AI auto-detects recurring payments with monthly/yearly totals" },
      { type: "feature", text: "Household Sharing — create a household, invite family, see shared transactions" },
      { type: "feature", text: "Financial Tips — personalized tips based on your real spending data" },
      { type: "feature", text: "About page with founder info and mission statement" },
      { type: "feature", text: "Changelog page (you're reading it!)" },
      { type: "improvement", text: "Google Analytics 4 integration for traffic insights" },
      { type: "improvement", text: "Microsoft Clarity for session recording and heatmaps" },
      { type: "improvement", text: "Structured data (JSON-LD) — SoftwareApplication, Organization, Person, FAQ, WebSite schemas" },
      { type: "improvement", text: "Sitemap.xml with all 30+ feature pages" },
      { type: "improvement", text: "robots.txt allowing AI search bots (GPTBot, ClaudeBot, PerplexityBot)" },
      { type: "improvement", text: "Canonical URLs on all public pages" },
      { type: "improvement", text: "Open Graph and Twitter Card images for social sharing" },
      { type: "improvement", text: "30 feature landing pages with individual SEO metadata" },
      { type: "improvement", text: "Updated landing page — 30 features, comparison table, statistics section, expert quote" },
      { type: "improvement", text: "All messaging updated to emphasize 100% free model with BYOK AI" },
      { type: "fix", text: "Accessibility — button labels, color contrast, viewport zoom enabled" },
      { type: "fix", text: "Mobile footer layout fixed" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-03-16",
    title: "Feature Flags & Admin Controls",
    description: "Admins can now enable/disable any feature for all users.",
    changes: [
      { type: "feature", text: "Feature flags system — toggle any of 25+ features on/off" },
      { type: "feature", text: "Admin-only Features tab in Settings" },
      { type: "improvement", text: "Lifestyle components refactored to respect feature flags" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-03-09",
    title: "AI Lifestyle Suite",
    description:
      "AI-powered tools to help you live better — not just track money.",
    changes: [
      { type: "feature", text: "Bill Negotiator — AI finds subscriptions to cancel and bills to reduce" },
      { type: "feature", text: "Money Chat — ask your finances questions in natural language" },
      { type: "feature", text: "Money Pilot — AI financial growth plan with score, actions, and projections" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-03-07",
    title: "Multi-User & Collaboration",
    description: "Support for multiple users with isolated data and shared settings.",
    changes: [
      { type: "feature", text: "Multi-user authentication with Google, GitHub, email, and Telegram" },
      { type: "feature", text: "Per-user settings, categories, accounts, and transactions" },
      { type: "feature", text: "Admin role with global feature flag control" },
      { type: "improvement", text: "Confirmed field added to SMS and Telegram transactions" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-03",
    title: "Smart Notifications & Import",
    description: "Stay on top of your finances with smart alerts and bulk data import.",
    changes: [
      { type: "feature", text: "Telegram Bot — payment reminders, budget alerts, monthly reports" },
      { type: "feature", text: "SMS Import — parse bank SMS with custom regex patterns" },
      { type: "feature", text: "Bulk CSV Import — upload bank statements to create transactions" },
      { type: "feature", text: "Spending Wrapped — annual spending recap with fun stats" },
      { type: "feature", text: "Cashflow Calendar — daily income, bills, and expenses on a calendar" },
      { type: "improvement", text: "Notification templates — customize message formats" },
      { type: "improvement", text: "Spread transactions across multiple months" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-27",
    title: "Public Launch",
    description: "MoneyStyle goes live — free for everyone.",
    changes: [
      { type: "feature", text: "Multi-Currency with automatic conversion across everything" },
      { type: "feature", text: "Account Management — bank, wallet, crypto, exchange, cash accounts" },
      { type: "improvement", text: "Polished onboarding flow for new users" },
      { type: "improvement", text: "Performance optimizations for mobile devices" },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-02-20",
    title: "AI Lifestyle Features",
    description: "AI doesn't just track your money — it helps you live better.",
    changes: [
      { type: "feature", text: "AI Money Pilot — personalized investment suggestions based on your data" },
      { type: "feature", text: "Weekend Planner — AI generates weekend plans based on your city, budget, and taste" },
      { type: "feature", text: "Meal Planner — weekly meal plans and recipes based on what you actually buy" },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-02-14",
    title: "Shopping & Price Intelligence",
    description: "Know where to shop and how prices change over time.",
    changes: [
      { type: "feature", text: "Price Analysis — compare prices across merchants and track your personal inflation" },
      { type: "feature", text: "Smart Shopping — build a list, AI finds the cheapest store for your whole basket" },
      { type: "feature", text: "Shared Expenses — split costs with friends and family, track who owes whom" },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-02-07",
    title: "Income & Bills Management",
    description: "Track what comes in, what goes out, and what's due next.",
    changes: [
      { type: "feature", text: "Income Tracking — define sources with deposit schedules and record deposits" },
      { type: "feature", text: "Installments & Bills — manage loan payments and recurring bills with reminders" },
      { type: "feature", text: "Reserves & Net Worth — track cash, gold, crypto reserves in one place" },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-01-31",
    title: "Budgets & Goals",
    description: "Set limits. Set targets. Stay on track.",
    changes: [
      { type: "feature", text: "Budget Management — monthly spending limits per category with alert thresholds" },
      { type: "feature", text: "Savings Goals — set targets with deadlines and track progress visually" },
      { type: "improvement", text: "Category color coding for visual spending breakdowns" },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-01-24",
    title: "AI Receipt Scanner",
    description: "Snap a photo. AI does the rest.",
    changes: [
      { type: "feature", text: "AI Receipt Scanner — photograph any receipt, AI extracts merchant, items, and total" },
      { type: "feature", text: "Multi-language support — English, Arabic, and Farsi receipt parsing" },
      { type: "improvement", text: "Line items stored per transaction for detailed price tracking" },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-01-17",
    title: "Smart Dashboard",
    description: "Your financial overview at a glance.",
    changes: [
      { type: "feature", text: "Smart Dashboard with real-time spending overview" },
      { type: "feature", text: "Spending heatmap — see which days you spend the most" },
      { type: "feature", text: "Category breakdown charts and monthly trend analysis" },
      { type: "feature", text: "AI expense predictions based on spending history" },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-01-10",
    title: "Categories & Tags",
    description: "Organize your transactions your way.",
    changes: [
      { type: "feature", text: "Custom categories with colors and icons" },
      { type: "feature", text: "Tags for flexible transaction labeling" },
      { type: "feature", text: "Merchant-based auto-categorization rules" },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-01-03",
    title: "Transaction Management",
    description: "The core of any finance tracker — logging every transaction.",
    changes: [
      { type: "feature", text: "Transaction tracking with date, amount, merchant, and description" },
      { type: "feature", text: "Multiple transaction types — income, expense, transfer" },
      { type: "feature", text: "Transaction search and filtering" },
    ],
  },
  {
    version: "0.1.0",
    date: "2025-12-27",
    title: "Project Kickoff",
    description: "The idea that became MoneyStyle.",
    changes: [
      { type: "feature", text: "Initial project setup with Next.js, Prisma, and PostgreSQL" },
      { type: "feature", text: "User authentication with email, Google, and GitHub" },
      { type: "feature", text: "Basic app layout with sidebar navigation" },
    ],
  },
];
