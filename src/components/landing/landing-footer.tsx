"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { LatestPostsSection } from "@/components/landing/latest-posts-client";
import {
  ArrowRight,
  Brain,
  Calendar,
  Lock,
  Receipt,
  Shield,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

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

export interface LandingFooterProps {
  isLoggedIn: boolean;
  demoLoading: boolean;
  trustRef: React.RefObject<HTMLElement | null>;
  trustInView: boolean;
  ctaRef: React.RefObject<HTMLElement | null>;
  ctaInView: boolean;
  onDemo: () => void;
}

export function LandingFooter({
  isLoggedIn,
  demoLoading,
  trustRef,
  trustInView,
  ctaRef,
  ctaInView,
  onDemo,
}: LandingFooterProps) {
  return (
    <>
      {/* ── Blog Posts ── */}
      <LatestPostsSection />

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
                  label: "Money Pilot",
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
      <section ref={trustRef}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${trustInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
                className={`rounded-2xl border bg-card p-6 text-center transition-all duration-500 ${trustInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
      <section ref={ctaRef} className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <div
            className={`transition-all duration-700 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
                    onClick={onDemo}
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
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
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
    </>
  );
}
