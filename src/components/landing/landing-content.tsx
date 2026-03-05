"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CalendarRange,
  CreditCard,
  Globe,
  LayoutDashboard,
  LineChart,
  Moon,
  PiggyBank,
  Receipt,
  Repeat,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Real-time overview of income, expenses, budgets, and savings — all at a glance with beautiful charts.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: CreditCard,
    title: "Transaction Tracking",
    description:
      "Log every transaction with categories, tags, merchants, and multiple accounts. Auto-categorize with rules.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: ShoppingCart,
    title: "Price Analysis",
    description:
      "Compare prices across merchants, track your personal inflation rate, and find the cheapest store for your shopping list.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Receipt,
    title: "AI Receipt Scanner",
    description:
      "Snap a photo of any receipt and AI extracts all line items automatically. Supports English, Arabic, and Farsi.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: PiggyBank,
    title: "Reserves & Savings",
    description:
      "Track cash, gold, crypto, and other reserves with historical snapshots. Know your net worth at any time.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Repeat,
    title: "Installments & Bills",
    description:
      "Manage loan payments with progress tracking and recurring bills with payment history. Never miss a due date.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Money Advice",
    description:
      "Get personalized investment suggestions based on your actual income, expenses, and idle reserves.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Users,
    title: "Debt Tracking",
    description:
      "Split expenses with friends and family, track who owes whom, and settle debts with a clear balance sheet.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: BarChart3,
    title: "Budget Management",
    description:
      "Set monthly limits per category with alert thresholds. Visual progress bars show where you stand.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Full support for multiple currencies with automatic conversion. Track income and expenses in any currency.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    icon: Bell,
    title: "Telegram Reminders",
    description:
      "Get notified via Telegram when bills and installments are due. Smart daily reminders keep you on track.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: Smartphone,
    title: "SMS Import",
    description:
      "Parse bank SMS messages with custom regex patterns to auto-create transactions. Works with any bank.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: CalendarRange,
    title: "Spread Across Months",
    description:
      "Spread lump-sum payments (quarterly bills, annual subscriptions) across multiple months for accurate budgeting.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description:
      "Set savings targets with deadlines, track progress visually, and stay motivated to reach your financial goals.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Calendar,
    title: "Weekend Planner",
    description:
      "AI-generated weekend plans based on your preferences, budget, and city. Rate activities and get better suggestions over time.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Planner",
    description:
      "Weekly meal plans tailored to your food preferences and budget. Never wonder what to cook again.",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
  },
];

const STATS = [
  { value: "16+", label: "Feature Modules" },
  { value: "100%", label: "Open Source" },
  { value: "PWA", label: "Works Offline" },
  { value: "AI", label: "Powered" },
];

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Spending Wrapped",
    description:
      "Monthly and yearly spending summaries — your top categories, biggest expenses, favorite merchants, and no-spend streaks.",
  },
  {
    icon: LineChart,
    title: "Expense Prediction",
    description:
      "See where your monthly spending is headed based on your daily average. Know early if you'll go over budget.",
  },
  {
    icon: Shield,
    title: "Merge Duplicates",
    description:
      "Intelligent duplicate detection finds similar transactions and lets you merge them with one click.",
  },
  {
    icon: Brain,
    title: "Customizable AI Prompts",
    description:
      "Fine-tune every AI prompt in settings. Adjust receipt parsing, money advice, and item normalization to your needs.",
  },
  {
    icon: CalendarRange,
    title: "Prepaid Amortization",
    description:
      "Pay 900 for 3 months of water? Spread it so each month shows 300 — your budgets and charts stay accurate.",
  },
  {
    icon: Bell,
    title: "Custom Notification Templates",
    description:
      "Customize every alert message — budget warnings, payment reminders, and transaction notifications — with your own templates.",
  },
];

export function LandingContent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">MoneyLoom</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Open App
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            AI-Powered Personal Finance
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Take Control of
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Money
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Track every transaction, analyze spending patterns, manage bills and
            installments, and get AI-powered advice to grow your wealth — all in
            one beautiful app.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="text-base">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              A complete toolkit for managing your personal finances.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className={`inline-flex rounded-xl p-2.5 ${feature.bg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              More Than a Tracker
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Smart features that go beyond simple bookkeeping.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 sm:p-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI That Knows Your Finances
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              MoneyLoom uses AI to scan receipts, normalize product names for
              price comparison, and analyze your complete financial picture to
              suggest how to put idle money to work — with specific numbers
              based on your actual data.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left max-w-3xl mx-auto">
              <div className="rounded-xl border bg-card p-4">
                <Receipt className="h-5 w-5 text-purple-500 mb-2" />
                <p className="text-sm font-medium">Receipt Scanner</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Photo to line items in seconds
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-sm font-medium">Investment Advice</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Personalized to your reserves
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <ShoppingCart className="h-5 w-5 text-orange-500 mb-2" />
                <p className="text-sm font-medium">Smart Grouping</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-normalize product names
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built With Modern Tech
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Fast, reliable, and works offline.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "PostgreSQL",
              "Prisma",
              "OpenAI",
              "PWA",
              "shadcn/ui",
              "Recharts",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Take Control?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
            Start tracking your finances today. No sign-up required — it&apos;s
            your data, on your server.
          </p>
          <Button asChild size="lg" className="mt-8 text-base">
            <Link href="/dashboard">
              Open Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>MoneyLoom</span>
            </div>
            <p>Self-hosted personal finance tracker</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
