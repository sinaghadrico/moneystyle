"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowRight,
  Loader2,
  Moon,
  Receipt,
  Send,
  Sparkles,
  Sun,
} from "lucide-react";

export interface LandingHeroProps {
  isLoggedIn: boolean;
  isTelegramMiniApp: boolean;
  tgAuthStatus: string;
  theme: string | undefined;
  demoLoading: boolean;
  heroRef: React.RefObject<HTMLElement | null>;
  heroInView: boolean;
  onSetTheme: (theme: string) => void;
  onDemo: () => void;
  onSignInWithTelegram: () => void;
}

export function LandingHero({
  isLoggedIn,
  isTelegramMiniApp,
  tgAuthStatus,
  theme,
  demoLoading,
  heroRef,
  heroInView,
  onSetTheme,
  onDemo,
  onSignInWithTelegram,
}: LandingHeroProps) {
  return (
    <>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">MoneyStyle</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSetTheme(theme === "dark" ? "light" : "dark")}
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
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div
                className={`transition-all duration-700 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-foreground/70 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  100% Free &middot; Bring your own AI key &middot; No credit
                  card
                </div>
              </div>
              <h1
                className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl transition-all duration-700 delay-100 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                The AI Personal Finance Tracker That{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Knows Where Every Dollar Goes
                </span>
              </h1>
              <p
                className={`mt-6 text-lg text-muted-foreground sm:text-md max-w-lg transition-all duration-700 delay-200 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                MoneyStyle is a completely free personal finance tracker that
                shows you exactly where every dollar goes. All 30 features are
                free — forever. Want AI powers like receipt scanning and Money
                Pilot? Just bring your own OpenAI API key, or let us set it up
                for you.
              </p>
              <div
                className={`mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all duration-700 delay-300 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
                    onClick={onSignInWithTelegram}
                    disabled={tgAuthStatus === "loading"}
                  >
                    {tgAuthStatus === "loading" ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {tgAuthStatus === "loading"
                      ? "Signing in..."
                      : "Sign in with Telegram"}
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
                  onClick={onDemo}
                  disabled={demoLoading}
                >
                  {demoLoading ? "Loading..." : "Try Live Demo"}
                </Button>
              </div>

              {/* Product Hunt + GitHub badges */}
              <div
                className={`mt-6 flex flex-wrap items-center gap-3 transition-all duration-700 delay-500 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                <a
                  href="https://www.producthunt.com/products/moneystyle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#da552f] to-[#ef7a4a] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#da552f]/20 hover:shadow-[#da552f]/40 hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 001.8-1.8 1.8 1.8 0 00-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 014.199 4.2 4.2 4.2 0 01-4.2 4.2z" />
                  </svg>
                  Featured on Product Hunt
                </a>
                <a
                  href="https://t.me/moneystyle_app_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#26A5E4] to-[#0088cc] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#26A5E4]/20 hover:shadow-[#26A5E4]/40 hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram Bot
                </a>
                <a
                  href="https://github.com/sinaghadrico/moneystyle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-neutral-800 to-neutral-900 dark:from-neutral-200 dark:to-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/20 dark:shadow-neutral-400/20 hover:shadow-neutral-900/40 hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Open Source
                </a>
              </div>
            </div>

            {/* Phone mockup */}
            <div
              className={`hidden lg:flex justify-center transition-all duration-1000 delay-500 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
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
                            className={`flex-1 rounded-sm transition-all duration-1000 ${heroInView ? "" : "!h-0"} ${i === 10 ? "bg-emerald-500" : "bg-muted"}`}
                            style={{
                              height: heroInView ? `${h}%` : "0%",
                              transitionDelay: `${800 + i * 60}ms`,
                            }}
                          />
                        ),
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
                        className={`transition-all duration-500 ${heroInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
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
                              width: heroInView ? `${cat.pct}%` : "0%",
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
                  className={`absolute -right-6 top-24 rounded-xl border bg-card px-3 py-2 shadow-lg transition-all duration-500 ${heroInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
                  style={{ transitionDelay: "1600ms" }}
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-[10px] font-medium">Receipt scanned</p>
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
    </>
  );
}
