"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  LogIn,
  Moon,
  Search,
  ShoppingBasket,
  Sparkles,
  Split,
  Store,
  Sun,
  Trophy,
  Wallet,
} from "lucide-react";

import { useInView } from "@/hooks/use-in-view";

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  prefix = "",
  duration = 1500,
  active,
}: {
  target: number;
  prefix?: string;
  duration?: number;
  active: boolean;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target * 100) / 100);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return (
    <span>
      {prefix}
      {value.toFixed(2)}
    </span>
  );
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const SHOPPING_ITEMS = [
  { name: "Whole Milk 1L", qty: 2 },
  { name: "Sourdough Bread", qty: 1 },
  { name: "Free-Range Eggs (12)", qty: 1 },
  { name: "Olive Oil 500ml", qty: 1 },
  { name: "Cheddar Cheese 200g", qty: 2 },
];

const AUTOCOMPLETE_SUGGESTIONS = [
  "Whole Milk 1L",
  "Whole Wheat Bread",
  "Whole Chicken",
];

const MERCHANTS = [
  { name: "FreshMart", total: 34.5, isBest: false, color: "text-blue-500" },
  { name: "GreenGrocer", total: 28.75, isBest: true, color: "text-emerald-500" },
  { name: "MegaStore", total: 31.2, isBest: false, color: "text-orange-500" },
];

const SPLIT_STRATEGY = {
  savings: 23.5,
  stores: [
    {
      name: "GreenGrocer",
      items: ["Whole Milk 1L", "Eggs (12)", "Olive Oil"],
      subtotal: 14.25,
    },
    {
      name: "FreshMart",
      items: ["Sourdough Bread", "Cheddar Cheese"],
      subtotal: 8.5,
    },
  ],
  singleStoreTotal: 46.25,
  splitTotal: 22.75,
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Based on YOUR Data",
    description:
      "Prices come from your actual purchase history — no generic estimates.",
  },
  {
    icon: Search,
    title: "No Guessing",
    description:
      "Real price comparisons from every receipt you've ever scanned.",
  },
  {
    icon: Store,
    title: "All Your Stores",
    description:
      "Every merchant you've shopped at is automatically included.",
  },
  {
    icon: Copy,
    title: "Copy & Share",
    description:
      "Export your optimized shopping list to share or take to the store.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function SmartShoppingLanding() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();

  const hero = useInView(0.2);
  const step1 = useInView(0.2);
  const step2 = useInView(0.2);
  const step3 = useInView(0.2);
  const benefits = useInView(0.2);
  const cta = useInView(0.2);

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

      {/* ── Hero ── */}
      <section ref={hero.ref} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-lime-500/8 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 text-center">
          <div
            className={`transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6">
              <ShoppingBasket className="h-3.5 w-3.5 text-lime-500" />
              Smart Shopping Feature
            </div>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Shop Smarter,
            <br />
            <span className="bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Save More
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl transition-all duration-700 delay-200 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Build your shopping list, compare real prices from your purchase
            history, and find the cheapest way to shop — one store or split
            across many.
          </p>

          <div
            className={`mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-4 sm:px-0 transition-all duration-700 delay-300 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Button asChild size="lg" className="text-base">
              <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
                {isLoggedIn ? "Open App" : "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Animated bag icon */}
          <div
            className={`mt-12 flex justify-center transition-all duration-1000 delay-500 ${hero.inView ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          >
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-lime-500/20 to-emerald-500/20 p-8 border border-lime-500/20">
                <ShoppingBasket className="h-16 w-16 text-lime-500 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-emerald-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center animate-pulse">
                5
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 1: Build Your List ── */}
      <section
        ref={step1.ref}
        className="border-y bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div
              className={`transition-all duration-700 ${step1.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-500/10 px-3 py-1 text-sm font-medium text-lime-600 dark:text-lime-400 mb-4">
                Step 1
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Build Your List
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Start typing and get autocomplete suggestions from your purchase
                history. Add items, set quantities, and your basket is ready in
                seconds.
              </p>
            </div>

            {/* Mock UI */}
            <div
              className={`transition-all duration-700 delay-200 ${step1.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <div className="rounded-2xl border bg-card p-5 shadow-lg">
                {/* Search bar */}
                <div className="relative mb-4">
                  <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="text-foreground">Whol</span>
                      <span
                        className={`inline-block w-0.5 h-4 bg-foreground align-middle ${step1.inView ? "animate-[blink_1s_steps(2)_infinite]" : ""}`}
                      />
                    </span>
                  </div>
                  {/* Autocomplete dropdown */}
                  <div
                    className={`absolute left-0 right-0 top-full mt-1 rounded-xl border bg-card shadow-lg overflow-hidden transition-all duration-500 delay-700 ${step1.inView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                  >
                    {AUTOCOMPLETE_SUGGESTIONS.map((item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 text-sm hover:bg-muted transition-all ${i === 0 ? "bg-muted/50" : ""}`}
                        style={{
                          animationDelay: `${800 + i * 100}ms`,
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Item list */}
                <div className="mt-16 space-y-2">
                  {SHOPPING_ITEMS.map((item, i) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all duration-500 ${step1.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{
                        transitionDelay: `${400 + i * 150}ms`,
                      }}
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        x{item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2: Compare Stores ── */}
      <section ref={step2.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Mock UI (left on desktop) */}
            <div
              className={`order-2 lg:order-1 transition-all duration-700 delay-200 ${step2.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <div className="rounded-2xl border bg-card p-5 shadow-lg">
                {/* Scanning state */}
                <div
                  className={`text-center py-4 transition-all duration-500 ${step2.inView ? "opacity-100" : "opacity-0"}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-500 mb-6 ${step2.inView ? "animate-pulse" : ""}`}
                  >
                    <Search className="h-4 w-4" />
                    Analyzing your purchase history...
                  </div>
                </div>

                {/* Merchant cards */}
                <div className="space-y-3">
                  {MERCHANTS.map((merchant, i) => (
                    <div
                      key={merchant.name}
                      className={`relative flex items-center justify-between rounded-xl border p-4 transition-all duration-500 ${
                        merchant.isBest
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : ""
                      } ${step2.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                      style={{
                        transitionDelay: `${600 + i * 200}ms`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Store className={`h-5 w-5 ${merchant.color}`} />
                        <span className="font-medium">{merchant.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          ${merchant.total.toFixed(2)}
                        </span>
                        {merchant.isBest && (
                          <Trophy
                            className={`h-5 w-5 text-amber-500 transition-all duration-500 ${step2.inView ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                            style={{ transitionDelay: "1400ms" }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Best store highlight */}
                <div
                  className={`mt-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 text-center transition-all duration-500 ${step2.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "1600ms" }}
                >
                  <p className="text-sm text-muted-foreground">
                    Best single store
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    GreenGrocer — $28.75
                  </p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div
              className={`order-1 lg:order-2 transition-all duration-700 ${step2.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                Step 2
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Compare Stores
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                AI analyzes prices from your own transaction history — every
                receipt you've scanned, every purchase you've logged. See which
                store wins for your exact basket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 3: Split & Save ── */}
      <section
        ref={step3.ref}
        className="border-y bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text */}
            <div
              className={`transition-all duration-700 ${step3.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                Step 3
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Split & Save
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Go beyond single-store shopping. See exactly which items to buy
                where for maximum savings, with a clear comparison against the
                single-store option.
              </p>
            </div>

            {/* Mock UI */}
            <div
              className={`transition-all duration-700 delay-200 ${step3.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <div className="rounded-2xl border bg-card p-5 shadow-lg">
                {/* Split columns */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {SPLIT_STRATEGY.stores.map((store, i) => (
                    <div
                      key={store.name}
                      className={`rounded-xl border p-3 transition-all duration-500 ${step3.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                      style={{
                        transitionDelay: `${400 + i * 200}ms`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {store.name}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {store.items.map((item, j) => (
                          <div
                            key={item}
                            className={`flex items-center gap-1.5 transition-all duration-400 ${step3.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                            style={{
                              transitionDelay: `${800 + i * 200 + j * 100}ms`,
                            }}
                          >
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t text-right">
                        <span className="text-sm font-bold">
                          ${store.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Savings comparison */}
                <div
                  className={`rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 transition-all duration-500 ${step3.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: "1200ms" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      Single store
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      ${SPLIT_STRATEGY.singleStoreTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      Split strategy
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ${SPLIT_STRATEGY.splitTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Split className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">You save</span>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      <AnimatedCounter
                        target={SPLIT_STRATEGY.savings}
                        prefix="$"
                        active={step3.inView}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section ref={benefits.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${benefits.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why It Works
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Smart Shopping is powered by your real spending data.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <div
                key={b.title}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-md hover:border-primary/20 ${benefits.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="inline-flex rounded-xl bg-lime-500/10 p-2.5">
                  <b.icon className="h-5 w-5 text-lime-500" />
                </div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={cta.ref} className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <div
            className={`transition-all duration-700 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <ShoppingBasket className="h-10 w-10 mx-auto text-lime-500 mb-4" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start Shopping Smarter
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              Every receipt you scan makes Smart Shopping more accurate. Sign
              up free and start saving.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 px-4 sm:px-0">
              {isLoggedIn ? (
                <Button asChild size="lg" className="text-base">
                  <Link href="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base">
                    <Link href="/auth/register">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                </>
              )}
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
            <Link href="/" className="hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
