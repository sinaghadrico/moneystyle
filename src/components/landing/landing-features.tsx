"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Code,
  CreditCard,
  Eye,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Link2,
  Lock,
  PiggyBank,
  Receipt,
  Repeat,
  Rocket,
  ScanLine,
  Shield,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Scissors,
  CalendarDays,
  MessageCircle,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

const FEATURES: {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  color: string;
  bg: string;
  href?: string;
}[] = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Real-time overview with spending heatmaps, category breakdowns, trend charts, and expense predictions.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: "/features/smart-dashboard",
  },
  {
    icon: CreditCard,
    title: "Transaction Tracking",
    description:
      "Log every transaction with categories, tags, line items, merchants, and multiple accounts.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    href: "/features/transaction-tracking",
  },
  {
    icon: Receipt,
    title: "AI Receipt Scanner",
    description:
      "Snap a photo of any receipt and AI extracts all line items automatically.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    href: "/features/receipt-scanner",
  },
  {
    icon: BarChart3,
    title: "Budget Management",
    description:
      "Set monthly limits per category with alert thresholds. Get alerts before you overspend.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    href: "/features/budget-management",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description:
      "Set savings targets with deadlines, track progress visually, and stay motivated.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: "/features/savings-goals",
  },
  {
    icon: PiggyBank,
    title: "Reserves & Net Worth",
    description:
      "Track cash, gold, crypto, stocks, ETFs, bonds, and more. Know your net worth at any time.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    href: "/features/reserves",
  },
  {
    icon: Repeat,
    title: "Installments & Bills",
    description:
      "Manage loan payments and recurring bills with progress tracking and due-date reminders.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    href: "/features/installments-bills",
  },
  {
    icon: TrendingUp,
    title: "Income Tracking",
    description:
      "Define income sources with deposit schedules, record deposits, and link to transactions.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    href: "/features/income-tracking",
  },
  {
    icon: Link2,
    title: "Transaction Linking",
    description:
      "Connect bank transactions to installment, bill, and income records automatically.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    href: "/features/transaction-linking",
  },
  {
    icon: ShoppingCart,
    title: "Price Analysis",
    description:
      "Compare prices across merchants and track your personal inflation rate.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    href: "/features/price-analysis",
  },
  {
    icon: ShoppingBasket,
    title: "Smart Shopping",
    description:
      "Build shopping lists and find the best store for each item — or the whole basket.",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
    href: "/features/smart-shopping",
  },
  {
    icon: Users,
    title: "Shared Expenses",
    description:
      "Split expenses with friends and family, track who owes whom, and settle debts.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    href: "/features/shared-expenses",
  },
  {
    icon: Calendar,
    title: "Weekend Planner",
    description:
      "AI-generated weekend plans based on your preferences, city, budget, and companion type.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    href: "/features/weekend-planner",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Planner",
    description:
      "Weekly meal plans based on what you actually buy. AI generates recipes and shopping lists.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    href: "/features/meal-planner",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Full support for multiple currencies with automatic conversion across everything.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    href: "/features/multi-currency",
  },
  {
    icon: Bell,
    title: "Telegram Bot",
    description:
      "Payment reminders, budget alerts, and monthly reports — all delivered via Telegram.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    href: "/features/telegram-bot",
  },
  {
    icon: Smartphone,
    title: "SMS Import",
    description:
      "Parse bank SMS messages with custom regex patterns to auto-create transactions.",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    href: "/features/sms-import",
  },
  {
    icon: Upload,
    title: "Bulk Import",
    description:
      "Import bank CSV statements or Telegram chat exports to bulk-create transactions instantly.",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    href: "/features/bulk-import",
  },
  {
    icon: Wallet,
    title: "Account Management",
    description:
      "Manage multiple accounts — bank, wallet, exchange, cash — each with its own color and icon.",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    href: "/features/account-management",
  },
  {
    icon: Trophy,
    title: "Spending Wrapped",
    description:
      "Your annual spending recap — top categories, biggest expense, favorite merchant, and trends.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    href: "/features/spending-wrapped",
  },
  {
    icon: Scissors,
    title: "Bill Negotiator",
    description:
      "AI analyzes your bills and recurring expenses to find subscriptions to cancel and costs to reduce.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    href: "/features/bill-negotiator",
  },
  {
    icon: CalendarDays,
    title: "Cashflow Calendar",
    description:
      "Monthly calendar showing income, bills, and expenses day by day with projected balance chart.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    href: "/features/cashflow-calendar",
  },
  {
    icon: MessageCircle,
    title: "Money Chat",
    description:
      "Chat with your finances — ask questions like \"how much did I spend on food?\" and get instant answers.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    href: "/features/money-chat",
  },
  {
    icon: Rocket,
    title: "Money Pilot",
    description:
      "AI-powered financial growth plan with exact amounts, platforms, and timelines tailored to your finances.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: "/features/money-pilot",
  },
  {
    icon: LineChart,
    title: "Investment Tracking",
    description:
      "Track stocks, ETFs, and bonds with live prices from Yahoo Finance. See gain/loss and portfolio performance.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    href: "/features/investment-tracking",
  },
  {
    icon: Eye,
    title: "Subscription Detection",
    description:
      "AI auto-detects recurring payments from your transactions — Netflix, Spotify, gym — with monthly totals.",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    href: "/features/subscription-detection",
  },
  {
    icon: Users,
    title: "Household Sharing",
    description:
      "Create a household, invite your partner or family, and see everyone's spending in one place.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    href: "/features/household-sharing",
  },
  {
    icon: Code,
    title: "Developer API",
    description:
      "Full REST API for transactions, categories, and accounts. Build automations and custom integrations.",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    href: "/features/developer-api",
  },
  {
    icon: GraduationCap,
    title: "Financial Tips",
    description:
      "Personalized tips based on your real data — budget warnings, savings rate, emergency fund status, and more.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    href: "/features/financial-tips",
  },
];

export interface LandingFeaturesProps {
  featuresRef: React.RefObject<HTMLElement | null>;
  featuresInView: boolean;
}

export function LandingFeatures({
  featuresRef,
  featuresInView,
}: LandingFeaturesProps) {
  return (
    <section id="features" ref={featuresRef} className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div
          className={`text-center mb-12 transition-all duration-700 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            30 features. One app.
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Everything you need to manage your money — and then some.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const card = (
              <div
                key={feature.title}
                className={`group rounded-2xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 duration-500 ${featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${Math.min(i * 50, 400)}ms` }}
              >
                <div
                  className={`inline-flex rounded-xl p-2.5 ${feature.bg}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-4 font-semibold">
                  {feature.title}
                  {feature.href && (
                    <ArrowRight className="inline ml-1.5 h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  )}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
            return feature.href ? (
              <Link
                key={feature.title}
                href={feature.href}
                className="block"
              >
                {card}
              </Link>
            ) : (
              card
            );
          })}
        </div>
      </div>
    </section>
  );
}
