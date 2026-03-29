"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { signInAsDemo } from "@/actions/auth";
import { LogoMark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowRight, Moon, Sun, Sparkles, Check } from "lucide-react";
import {
  PhoneFinanceIllustration,
  ReceiptScanIllustration,
  DashboardIllustration,
  SavingsIllustration,
} from "@/components/landing/illustrations";

// ── Scroll reveal ──
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Story ──
const STORY: { chapter: number; title: string; subtitle: string; desc: string; illustration: ReactNode; bg: string }[] = [
  {
    chapter: 1,
    title: "Meet Alex.",
    subtitle: "No idea where the money went.",
    desc: "Every month, the same surprise — account nearly empty by the 20th. Subscriptions sneaking in. No visibility. Sound familiar?",
    illustration: <PhoneFinanceIllustration className="w-full max-w-xs mx-auto" />,
    bg: "",
  },
  {
    chapter: 2,
    title: "Receipts got superpowers.",
    subtitle: "Snap a photo. AI reads every line.",
    desc: "No more typing. MoneyStyle scans receipts in any language — English, Arabic, Farsi. Extracts merchant, items, and total in seconds.",
    illustration: <ReceiptScanIllustration className="w-full max-w-xs mx-auto" />,
    bg: "border-y bg-muted/20",
  },
  {
    chapter: 3,
    title: "The dashboard told the truth.",
    subtitle: "Heatmaps. Charts. Predictions.",
    desc: "Alex finally saw it: $400/month on food delivery. $120 on forgotten subscriptions. The AI even predicted next month's expenses.",
    illustration: <DashboardIllustration className="w-full max-w-sm mx-auto" />,
    bg: "",
  },
  {
    chapter: 4,
    title: "Money started growing.",
    subtitle: "Goals. Challenges. Streaks.",
    desc: "A vacation fund. A no-spend-weekend challenge. Every saved dollar fills the jar. Money Pilot scored Alex 78/100 with 5 action steps.",
    illustration: <SavingsIllustration className="w-full max-w-xs mx-auto" />,
    bg: "border-y bg-muted/20",
  },
];

const FEATURES_MINI = [
  "AI Receipt Scanner", "Money Pilot (AI scoring)", "Voice Transactions", "Telegram Bot",
  "Money Map (Google Maps)", "Smart Dashboard", "Meal & Weekend Planner", "Bill Negotiator",
  "Savings Goals & Jar", "Budget with Rollover", "Household Sharing", "Multi-currency",
  "Travel Mode", "Price Analysis", "Financial Challenges", "Open Source (MIT)",
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">MoneyStyle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
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

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pt-12 pb-8 sm:pt-20 sm:pb-12">
        <div className="absolute top-10 -left-32 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 -right-32 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground mb-6 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Free &middot; Open Source &middot; AI-Powered
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Your money,<br />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">your story.</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-lg text-muted-foreground max-w-md leading-relaxed">
                The finance app that <strong>actually understands</strong> you. AI scans receipts, scores your wealth, plans your weekends, and grows your savings.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-8 flex flex-wrap gap-3">
                {!isLoggedIn && (
                  <Button asChild size="lg" className="text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                    <Link href="/auth/register">Start Your Story <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" className="text-base hover:scale-105 transition-all" onClick={handleDemo} disabled={demoLoading}>
                  {demoLoading ? "Loading..." : "Try Demo"}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href="https://www.producthunt.com/products/moneystyle" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#da552f] to-[#ef7a4a] px-3 py-1.5 text-xs font-medium text-white shadow-md hover:scale-105 transition-all">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 001.8-1.8 1.8 1.8 0 00-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 014.199 4.2 4.2 4.2 0 01-4.2 4.2z"/></svg>
                  Product Hunt
                </a>
                <a href="https://github.com/sinaghadrico/moneystyle" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs font-medium text-white dark:text-neutral-900 shadow-md hover:scale-105 transition-all">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  Open Source
                </a>
                <a href="https://t.me/moneystyle_app_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#26A5E4] to-[#0088cc] px-3 py-1.5 text-xs font-medium text-white shadow-md hover:scale-105 transition-all">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <PhoneFinanceIllustration className="w-full max-w-sm mx-auto lg:max-w-none" />
          </Reveal>
        </div>
      </section>

      {/* Story chapters */}
      {STORY.slice(1).map((s, i) => (
        <section key={s.chapter} className={s.bg}>
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className={i % 2 === 0 ? "lg:order-2" : ""}>
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 mb-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{s.chapter}</span>
                    Chapter {s.chapter}
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.title}</h2>
                  <p className="mt-2 text-xl font-medium text-foreground/80">{s.subtitle}</p>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{s.desc}</p>
                </Reveal>
              </div>
              <div className={`flex justify-center ${i % 2 === 0 ? "lg:order-1" : ""}`}>
                <Reveal delay={200}>
                  {s.illustration}
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Feature wall */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              30+ features.{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">$0 forever.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FEATURES_MINI.map((f, i) => (
            <Reveal key={f} delay={i * 40}>
              <div className="group flex items-center gap-2 rounded-lg border bg-card p-3 hover:border-emerald-500/40 hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-default">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 group-hover:scale-125 transition-transform" />
                <span className="text-xs font-medium">{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "30+", label: "Features", emoji: "🚀" },
              { value: "$0", label: "Forever", emoji: "💰" },
              { value: "9", label: "AI Tools", emoji: "🤖" },
              { value: "MIT", label: "Open Source", emoji: "🔓" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center group cursor-default">
                  <p className="text-2xl mb-1 group-hover:scale-125 transition-transform inline-block">{s.emoji}</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-24 text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">The End?</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Your story starts{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">now.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">Free forever. No credit card. Start tracking in 30 seconds.</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild size="lg" className="text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                <Link href="/auth/register">Write Your Chapter <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base hover:scale-105 transition-all" onClick={handleDemo} disabled={demoLoading}>
                {demoLoading ? "Loading..." : "Try Demo"}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-5xl" />
    </div>
  );
}
