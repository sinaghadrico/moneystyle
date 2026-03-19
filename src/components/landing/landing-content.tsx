"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { signInAsDemo } from "@/actions/auth";
import { useInView } from "@/hooks/use-in-view";
import { useTelegramAutoAuth } from "@/hooks/use-telegram-auto-auth";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowRight,
  Loader2,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CreditCard,
  Globe,
  LayoutDashboard,
  Link2,
  Lock,
  LogIn,
  Moon,
  PiggyBank,
  Receipt,
  Repeat,
  ScanLine,
  Send,
  Shield,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  Scissors,
  CalendarDays,
  MessageCircle,
  Rocket,
  Users,
  UtensilsCrossed,
  Wallet,
  LineChart,
  Eye,
  Code,
  GraduationCap,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    emoji: "😰",
    title: "Where did $500 go?",
    description:
      "You check your bank, see the balance, and have no idea what happened this month.",
  },
  {
    emoji: "🧾",
    title: "Receipts in a drawer",
    description:
      "Paper receipts pile up. You promise yourself you'll review them. You never do.",
  },
  {
    emoji: "🛒",
    title: "Same item, different prices",
    description:
      "You buy the same groceries every week but never know which store is actually cheaper.",
  },
];

const PILLARS = [
  {
    icon: LayoutDashboard,
    label: "See Everything",
    title: "Know exactly where every dollar goes",
    description:
      "Log transactions, scan receipts with AI, and get real-time dashboards with spending heatmaps, category breakdowns, and trend predictions.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    mockItems: [
      { label: "Groceries", value: "$342", pct: 35 },
      { label: "Dining Out", value: "$185", pct: 19 },
      { label: "Transport", value: "$128", pct: 13 },
      { label: "Entertainment", value: "$95", pct: 10 },
      { label: "Bills & Utils", value: "$230", pct: 23 },
    ],
  },
  {
    icon: ScanLine,
    label: "Automate Everything",
    title: "Snap a receipt. AI does the rest.",
    description:
      "Take a photo of any receipt — AI extracts every line item, categorizes it, and logs the transaction. Works with English, Arabic, and Farsi.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    mockItems: [
      { label: "Whole Milk 1L", value: "$3.49", pct: 0 },
      { label: "Sourdough Bread", value: "$4.99", pct: 0 },
      { label: "Free-Range Eggs", value: "$6.29", pct: 0 },
      { label: "Olive Oil 500ml", value: "$8.99", pct: 0 },
      { label: "Total: $23.76", value: "Auto-saved", pct: 0 },
    ],
  },
  {
    icon: ShoppingBasket,
    label: "Save Money",
    title: "AI finds the cheapest store for your basket",
    description:
      "Build a shopping list and AI compares prices across every store you've ever shopped at — from your own data. Split across stores for max savings.",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
    href: "/features/smart-shopping",
    mockItems: [
      { label: "GreenGrocer", value: "$28.75", pct: 100 },
      { label: "FreshMart", value: "$34.50", pct: 70 },
      { label: "MegaStore", value: "$31.20", pct: 85 },
      { label: "Split Strategy", value: "$22.75", pct: 0 },
      { label: "You save", value: "$23.50", pct: 0 },
    ],
  },
];

const STEPS = [
  {
    num: "1",
    title: "Create your free account",
    description:
      "Sign up in 10 seconds. No credit card, no subscription. All 30 features are yours — completely free.",
  },
  {
    num: "2",
    title: "Log or scan your first expense",
    description:
      "Add a transaction manually or snap a receipt — AI extracts everything. Import bank CSV for instant history.",
  },
  {
    num: "3",
    title: "Want AI? Bring your own key",
    description:
      "Set your own OpenAI API key in Settings to unlock receipt scanning, money advice, and more. Or message us — we'll set it up for you.",
  },
];

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
    icon: Sparkles,
    title: "AI Money Advice",
    description:
      "Personalized investment suggestions based on your actual income, expenses, and reserves.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    href: "/features/money-advice",
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
    title: "Wealth Pilot",
    description:
      "AI-powered wealth growth plan with exact amounts, platforms, and timelines tailored to your finances.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: "/features/wealth-pilot",
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

const TRUST_POINTS = [
  {
    icon: Lock,
    title: "Bank-Level Encryption",
    description: "Your financial data is encrypted at rest and in transit. Always.",
  },
  {
    icon: Shield,
    title: "We Never Sell Your Data",
    description: "No ads. No data brokers. No third-party tracking. Period.",
  },
  {
    icon: Sparkles,
    title: "100% Free — No Catch",
    description: "All 30 features are free. AI features use your own OpenAI key — or we can set it up for you.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function LandingContent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const { isTelegram: isTelegramMiniApp, authStatus: tgAuthStatus, signInWithTelegram } = useTelegramAutoAuth();

  const hero = useInView(0.1);
  const pain = useInView(0.15);
  const whyTrack = useInView(0.15);
  const pillars = [useInView(0.15), useInView(0.15), useInView(0.15)];
  const howItWorks = useInView(0.15);
  const comparison = useInView(0.15);
  const features = useInView(0.1);
  const trust = useInView(0.15);
  const ctaSection = useInView(0.15);

  const handleDemo = async () => {
    setDemoLoading(true);
    if (isLoggedIn) {
      await signOut({ redirect: false });
    }
    const result = await signInAsDemo();
    if (result.success) {
      window.location.href = "/dashboard";
    }
    setDemoLoading(false);
  };

  const anim = (visible: boolean, delay = 0) =>
    `transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}` +
    (delay ? ` delay-[${delay}ms]` : "");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">MoneyStyle</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>
            {isLoggedIn ? (
              <Button asChild size="sm">
                <Link href="/dashboard">
                  Open App
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : !isTelegramMiniApp ? (
              <Button asChild size="sm">
                <Link href="/auth/register">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={hero.ref} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div
                className={`transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-foreground/70 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  100% Free &middot; Bring your own AI key &middot; No credit card
                </div>
              </div>
              <h1
                className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl transition-all duration-700 delay-100 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                The AI Personal Finance Tracker That{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Knows Where Every Dollar Goes
                </span>
              </h1>
              <p
                className={`mt-6 text-lg text-muted-foreground sm:text-xl max-w-lg transition-all duration-700 delay-200 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                MoneyStyle is a completely free personal finance tracker that
                shows you exactly where every dollar goes. All 30 features
                are free — forever. Want AI powers like receipt scanning and
                money advice? Just bring your own OpenAI API key, or let us
                set it up for you.
              </p>
              <div
                className={`mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all duration-700 delay-300 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                {isLoggedIn && (
                  <Button asChild size="lg" className="text-base">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
                {!isLoggedIn && isTelegramMiniApp && (
                  <Button
                    size="lg"
                    className="text-base"
                    onClick={signInWithTelegram}
                    disabled={tgAuthStatus === "loading"}
                  >
                    {tgAuthStatus === "loading" ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {tgAuthStatus === "loading" ? "Signing in..." : "Sign in with Telegram"}
                  </Button>
                )}
                {!isLoggedIn && !isTelegramMiniApp && (
                  <Button asChild size="lg" className="text-base">
                    <Link href="/auth/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base"
                  onClick={handleDemo}
                  disabled={demoLoading}
                >
                  {demoLoading ? "Loading..." : "Try Live Demo"}
                </Button>
              </div>
            </div>

            {/* Phone mockup */}
            <div
              className={`hidden lg:flex justify-center transition-all duration-1000 delay-500 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
            >
              <div className="relative w-[280px]">
                <div className="rounded-[2.5rem] border-2 border-border/50 bg-card p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="flex justify-center mb-3">
                    <div className="h-1.5 w-16 rounded-full bg-muted" />
                  </div>
                  {/* Screen */}
                  <div className="space-y-3 px-2 pb-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          This month
                        </p>
                        <p className="text-lg font-bold">$2,847</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/15 px-2 py-1">
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          -12%
                        </p>
                      </div>
                    </div>
                    {/* Chart bars */}
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 35, 80, 55, 70, 45, 60, 75, 50, 85, 30].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-sm transition-all duration-1000 ${hero.inView ? "" : "!h-0"} ${i === 10 ? "bg-emerald-500" : "bg-muted"}`}
                            style={{
                              height: hero.inView ? `${h}%` : "0%",
                              transitionDelay: `${800 + i * 60}ms`,
                            }}
                          />
                        )
                      )}
                    </div>
                    {/* Categories */}
                    {[
                      {
                        label: "Groceries",
                        value: "$342",
                        pct: 35,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Dining",
                        value: "$185",
                        pct: 19,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Transport",
                        value: "$128",
                        pct: 13,
                        color: "bg-emerald-500",
                      },
                    ].map((cat, i) => (
                      <div
                        key={cat.label}
                        className={`transition-all duration-500 ${hero.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                        style={{ transitionDelay: `${1200 + i * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-medium">
                            {cat.value}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color} transition-all duration-1000`}
                            style={{
                              width: hero.inView ? `${cat.pct}%` : "0%",
                              transitionDelay: `${1300 + i * 100}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating notification */}
                <div
                  className={`absolute -right-6 top-24 rounded-xl border bg-card px-3 py-2 shadow-lg transition-all duration-500 ${hero.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                  style={{ transitionDelay: "1600ms" }}
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-[10px] font-medium">
                        Receipt scanned
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        5 items &middot; $23.76
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section ref={pain.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div
            className={`text-center mb-10 transition-all duration-700 ${pain.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Sound familiar?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={p.title}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 ${pain.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Track (Statistics + Expert Quote) ── */}
      <section ref={whyTrack.ref} id="why-track">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${whyTrack.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Personal Finance Tracking Matters
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              The numbers don&apos;t lie — and most people don&apos;t track them.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {[
              {
                stat: "$7,951",
                label: "average credit card debt per U.S. household",
                source: "Federal Reserve, 2024",
              },
              {
                stat: "32%",
                label: "of Americans maintain a household budget",
                source: "Gallup, 2023",
              },
              {
                stat: "20%",
                label: "more saved per month by people who track expenses",
                source: "NBER, 2022",
              },
            ].map((item, i) => (
              <div
                key={item.stat}
                className={`rounded-2xl border bg-card p-6 text-center transition-all duration-500 ${whyTrack.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {item.stat}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {item.source}
                </p>
              </div>
            ))}
          </div>
          <div
            className={`mx-auto max-w-2xl transition-all duration-700 delay-300 ${whyTrack.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <blockquote className="rounded-2xl border bg-card p-6 sm:p-8">
              <p className="text-lg italic text-muted-foreground leading-relaxed">
                &ldquo;Tracking every dollar isn&apos;t about restriction —
                it&apos;s about awareness. When people see exactly where their
                money goes, they naturally make better decisions.&rdquo;
              </p>
              <footer className="mt-4 text-sm font-medium">
                — Sina Ghadri, Founder &amp; CEO of MoneyStyle
              </footer>
            </blockquote>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sources:{" "}
              <a
                href="https://www.federalreserve.gov/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Federal Reserve
              </a>
              ,{" "}
              <a
                href="https://news.gallup.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Gallup
              </a>
              ,{" "}
              <a
                href="https://www.nber.org/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                NBER
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Solution Pillars ── */}
      {PILLARS.map((pillar, pi) => {
        const p = pillars[pi];
        const isEven = pi % 2 === 0;
        return (
          <section
            key={pillar.label}
            ref={p.ref}
            className={pi % 2 !== 0 ? "bg-muted/30 border-y" : ""}
          >
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* Text */}
                <div
                  className={`${!isEven ? "lg:order-2" : ""} transition-all duration-700 ${p.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium mb-4 ${pillar.bg} ${pillar.color}`}
                  >
                    <pillar.icon className="h-4 w-4" />
                    {pillar.label}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {pillar.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                    {pillar.description}
                  </p>
                  {pillar.href && (
                    <Link
                      href={pillar.href}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      See how it works
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                {/* Mock UI */}
                <div
                  className={`${!isEven ? "lg:order-1" : ""} transition-all duration-700 delay-200 ${p.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div className="rounded-2xl border bg-card p-5 shadow-lg">
                    <div className="space-y-2.5">
                      {pillar.mockItems.map((item, i) => (
                        <div
                          key={item.label}
                          className={`transition-all duration-500 ${p.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                          style={{ transitionDelay: `${400 + i * 120}ms` }}
                        >
                          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                            <span
                              className={`text-sm font-bold ${i === pillar.mockItems.length - 1 ? pillar.color : ""}`}
                            >
                              {item.value}
                            </span>
                          </div>
                          {item.pct > 0 && pi === 0 && (
                            <div className="mt-1 mx-1 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                                style={{
                                  width: p.inView ? `${item.pct}%` : "0%",
                                  transitionDelay: `${500 + i * 120}ms`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── How It Works ── */}
      <section ref={howItWorks.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${howItWorks.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in seconds
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              No setup. No complexity. Just sign up and go.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`relative rounded-2xl border bg-card p-6 transition-all duration-500 ${howItWorks.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section ref={comparison.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${comparison.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              MoneyStyle vs Traditional Budgeting
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              See how AI-powered finance tracking compares to manual methods.
            </p>
          </div>
          <div
            className={`overflow-x-auto transition-all duration-700 delay-200 ${comparison.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-sm font-semibold">Feature</th>
                  <th className="py-3 px-4 text-sm font-semibold text-emerald-500">MoneyStyle</th>
                  <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">Spreadsheet</th>
                  <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">Basic App</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI Receipt Scanning", true, false, false],
                  ["Price Comparison", true, false, false],
                  ["AI Money Advice", true, false, "Limited"],
                  ["Multi-Currency", true, "Manual", "Limited"],
                  ["Budget Alerts", true, false, true],
                  ["Investment Tracking", true, false, false],
                  ["Subscription Detection", true, false, false],
                  ["Developer API", true, false, false],
                  ["Free to Start", true, true, "Varies"],
                ].map(([feature, ms, sheet, basic], i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 text-sm font-medium">{feature as string}</td>
                    {[ms, sheet, basic].map((val, j) => (
                      <td key={j} className="py-3 px-4 text-sm">
                        {val === true ? (
                          <span className="text-emerald-500 font-medium">Yes</span>
                        ) : val === false ? (
                          <span className="text-muted-foreground">No</span>
                        ) : (
                          <span className="text-muted-foreground">{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── All Features ── */}
      <section id="features" ref={features.ref} className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
                  className={`group rounded-2xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 duration-500 ${features.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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

      {/* ── AI Section ── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 sm:p-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI that knows your finances
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              Not generic tips — real insights based on your actual spending,
              income, and habits.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6 text-left max-w-4xl mx-auto">
              {[
                {
                  icon: Receipt,
                  color: "text-purple-500",
                  label: "Receipt Scanner",
                  desc: "Photo to line items",
                },
                {
                  icon: TrendingUp,
                  color: "text-green-500",
                  label: "Money Advice",
                  desc: "Investment tips from data",
                },
                {
                  icon: ShoppingCart,
                  color: "text-orange-500",
                  label: "Item Grouping",
                  desc: "Auto-normalize names",
                },
                {
                  icon: Calendar,
                  color: "text-rose-500",
                  label: "Weekend Plans",
                  desc: "Based on your taste",
                },
                {
                  icon: UtensilsCrossed,
                  color: "text-teal-500",
                  label: "Meal Plans",
                  desc: "Recipes from purchases",
                },
                {
                  icon: ShoppingBasket,
                  color: "text-lime-500",
                  label: "Shop Optimizer",
                  desc: "Best store for basket",
                },
              ].map((ai) => (
                <div key={ai.label} className="rounded-xl border bg-card p-4">
                  <ai.icon className={`h-5 w-5 ${ai.color} mb-2`} />
                  <p className="text-sm font-medium">{ai.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ai.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / Self-hosted ── */}
      <section ref={trust.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${trust.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your finances deserve privacy.
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              We treat your financial data like our own — with maximum security and zero compromises.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_POINTS.map((t, i) => (
              <div
                key={t.title}
                className={`rounded-2xl border bg-card p-6 text-center transition-all duration-500 ${trust.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="inline-flex rounded-xl bg-emerald-500/10 p-3 mb-4">
                  <t.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaSection.ref} className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <div
            className={`transition-all duration-700 ${ctaSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Stop wondering where your money went.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              Join <strong className="text-foreground">10,000+ users</strong>{" "}
              who track their spending with MoneyStyle. Every feature is free
              — no subscriptions, no hidden fees. AI features use your own
              OpenAI key, or we can set it up for you.
            </p>
            {isLoggedIn ? (
              <Button asChild size="lg" className="mt-8 text-base">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-4 sm:px-0">
                  <Button asChild size="lg" className="text-base">
                    <Link href="/auth/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base"
                    onClick={handleDemo}
                    disabled={demoLoading}
                  >
                    {demoLoading ? "Loading..." : "Try Live Demo"}
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Free forever. AI features need an OpenAI key —{" "}
                  <Link
                    href="/pricing"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    see pricing details
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <LogoMark className="h-4 w-4" />
              <span>&copy; 2026 MoneyStyle</span>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/docs/api" className="hover:text-foreground transition-colors">API Docs</Link>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/moneystyleapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href="https://www.linkedin.com/company/moneystyle"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
