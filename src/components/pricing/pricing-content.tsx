"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LogIn,
  Moon,
  Sparkles,
  Sun,
  Wallet,
  X,
} from "lucide-react";

const FREE_FEATURES = [
  "Up to 100 transactions / month",
  "Manual transaction entry",
  "5 categories",
  "1 account",
  "Basic dashboard",
  "Monthly spending overview",
  "Mobile-friendly PWA",
];

const FREE_MISSING = [
  "AI Receipt Scanner",
  "Smart Shopping",
  "Budget alerts (Telegram)",
  "Savings goals",
  "Price analysis",
  "AI Money Pilot",
  "Meal & Weekend Planner",
  "SMS Import",
  "Multi-currency",
  "Shared expenses",
];

const PRO_FEATURES = [
  "Unlimited transactions",
  "AI Receipt Scanner",
  "Unlimited categories & accounts",
  "Smart Shopping & Price Analysis",
  "Budget management with Telegram alerts",
  "Savings goals with tracking",
  "AI Money Pilot",
  "Meal Planner & Weekend Planner",
  "SMS Import (any bank)",
  "Multi-currency support",
  "Shared expenses",
  "Installments & bills tracking",
  "Income tracking & linking",
  "Transaction linking",
  "Spending predictions",
  "CSV import & export",
  "Priority support",
];

const FAQ = [
  {
    q: "Can I try Pro features before paying?",
    a: "Yes! Start with Free and upgrade anytime. You can also try the live demo to see all Pro features in action.",
  },
  {
    q: "What happens if I go over 100 transactions on Free?",
    a: "You'll get a gentle reminder to upgrade. We won't delete your data or lock you out — you just won't be able to add new transactions until next month.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel with one click. You keep access until the end of your billing period, and your data is always yours to export.",
  },
  {
    q: "Is my financial data safe?",
    a: "Yes. All data is encrypted at rest and in transit. We never sell your data or share it with third parties. Ever.",
  },
  {
    q: "Do you offer annual pricing?",
    a: "Yes — pay annually and get 2 months free (that's $49.90/year instead of $59.88).",
  },
];

export function PricingContent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();

  const hero = useInView(0.1);
  const plans = useInView(0.1);
  const faq = useInView(0.1);
  const cta = useInView(0.15);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <LogoMark className="h-7 w-7" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MoneyStyle
              </span>
            </Link>
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
            {isLoggedIn ? (
              <Button asChild size="sm">
                <Link href="/dashboard">
                  Open App
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">
                    <LogIn className="mr-1 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">
                    Get Started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={hero.ref} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 text-center">
          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Simple, honest pricing.
          </h1>
          <p
            className={`mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl transition-all duration-700 delay-100 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Start free. Upgrade when you need AI superpowers. No hidden fees, no
            surprises.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section ref={plans.ref}>
        <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {/* Free */}
            <div
              className={`rounded-2xl border bg-card p-8 transition-all duration-500 ${plans.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Free</h2>
                <p className="mt-1 text-muted-foreground">
                  For getting started with personal finance tracking.
                </p>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold tracking-tight">
                    $0
                  </span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </div>

              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
                  {isLoggedIn ? "Current Plan" : "Get Started Free"}
                </Link>
              </Button>

              <div className="mt-8 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  What&apos;s included
                </p>
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Not included
                </p>
                {FREE_MISSING.map((f) => (
                  <div
                    key={f}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div
              className={`rounded-2xl border-2 border-primary bg-card p-8 relative transition-all duration-500 delay-150 ${plans.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Most Popular
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold">Pro</h2>
                <p className="mt-1 text-muted-foreground">
                  Full power. AI features, unlimited everything.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">
                    $4.99
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  or $49.90/year (2 months free)
                </p>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
                  {isLoggedIn ? "Upgrade to Pro" : "Start Free, Upgrade Later"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="mt-8 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Everything in Free, plus
                </p>
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faq.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2
            className={`text-3xl font-bold tracking-tight text-center mb-12 transition-all duration-700 ${faq.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Questions? Answers.
          </h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 ${faq.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={cta.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <div
            className={`transition-all duration-700 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start free. Upgrade when you&apos;re ready.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              No credit card required. No time limit on Free. Upgrade, downgrade,
              or cancel anytime.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-4 sm:px-0">
              <Button asChild size="lg" className="text-base">
                <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
                  {isLoggedIn ? "Open Dashboard" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LogoMark className="h-4 w-4" />
              <span>MoneyStyle</span>
            </div>
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
