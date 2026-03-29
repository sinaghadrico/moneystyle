"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { signInAsDemo } from "@/actions/auth";
import { LogoMark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  ArrowRight,
  Check,
  Moon,
  Receipt,
  BarChart3,
  Bot,
  Brain,
  Globe,
  Smartphone,
  Sun,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const HIGHLIGHTS = [
  { icon: Receipt, title: "AI Receipt Scanner", desc: "Snap a photo. AI extracts every item." },
  { icon: Brain, title: "Money Pilot", desc: "AI scores your finances 0-100 with action steps." },
  { icon: BarChart3, title: "Smart Dashboard", desc: "Charts, heatmaps, predictions — all in one view." },
  { icon: Bot, title: "Telegram Bot", desc: "Log transactions by sending a message." },
  { icon: Globe, title: "Money Map", desc: "See where you spend on a real map." },
  { icon: Smartphone, title: "Works Everywhere", desc: "PWA — install on any device like a native app." },
];

const BENEFITS = [
  "30+ features — completely free",
  "No ads, no data selling, no subscriptions",
  "AI features use your own OpenAI key (~$0.01/action)",
  "Self-hostable — run on your own server",
  "Open source — verify the code yourself",
  "Multi-currency, multi-user, household sharing",
];

const SCREENSHOTS = [
  { src: "/screenshot/desktop/dashboard.png", alt: "Dashboard" },
  { src: "/screenshot/mobile/transactions.png", alt: "Transactions" },
  { src: "/screenshot/desktop/pilot.png", alt: "Money Pilot" },
  { src: "/screenshot/mobile/map.png", alt: "Money Map" },
];

export default function LandingV2() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemo = async () => {
    setDemoLoading(true);
    if (isLoggedIn) await signOut({ redirect: false });
    const result = await signInAsDemo();
    if (result.success) window.location.href = "/dashboard";
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">MoneyStyle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>
            {isLoggedIn ? (
              <Button asChild size="sm"><Link href="/dashboard">Open App <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            ) : (
              <Button asChild size="sm"><Link href="/auth/register">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — clean, focused */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-amber-500" />
            100% Free — Open Source — AI-Powered
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Know where every
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"> dollar goes</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl max-w-lg">
            The personal finance tracker with 30+ features, AI insights, and zero cost. Track, plan, grow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {!isLoggedIn && (
              <Button asChild size="lg" className="text-base">
                <Link href="/auth/register">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            )}
            <Button variant="outline" size="lg" className="text-base" onClick={handleDemo} disabled={demoLoading}>
              {demoLoading ? "Loading..." : "Try Live Demo"}
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://www.producthunt.com/products/moneystyle" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#da552f] to-[#ef7a4a] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#da552f]/20 hover:scale-105 transition-all">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 001.8-1.8 1.8 1.8 0 00-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 014.199 4.2 4.2 4.2 0 01-4.2 4.2z"/></svg>
              Product Hunt
            </a>
            <a href="https://github.com/sinaghadrico/moneystyle" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 shadow-lg hover:scale-105 transition-all">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Open Source
            </a>
          </div>
        </div>
      </section>

      {/* Screenshot showcase */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SCREENSHOTS.map((s) => (
            <div key={s.alt} className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Image src={s.src} alt={s.alt} width={600} height={400} className="w-full h-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* 6 Highlights — clean grid */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-2">What makes it different</h2>
          <p className="text-center text-muted-foreground mb-10">Not just tracking — AI that understands your money.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{h.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits checklist */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Why MoneyStyle?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <Shield className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
              <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
            </div>
            <div>
              <Zap className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <p className="text-xs text-muted-foreground">30+ features</p>
            </div>
            <div>
              <Globe className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-muted-foreground">Multi-currency</p>
            </div>
            <div>
              <Smartphone className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-xs text-muted-foreground">PWA — any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to take control?
        </h2>
        <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
          Free forever. No credit card. Start in seconds.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/register">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base" onClick={handleDemo} disabled={demoLoading}>
            {demoLoading ? "Loading..." : "Try Demo"}
          </Button>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-5xl" />
    </div>
  );
}
