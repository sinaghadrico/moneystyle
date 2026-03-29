"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
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
  TrendingUp,
  Map,
  Mic,
  Target,
  Users,
  CreditCard,
} from "lucide-react";

// ── Animate on scroll hook ──
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

// ── Data ──
const FEATURES = [
  { icon: Receipt, title: "AI Receipt Scanner", desc: "Snap a photo. AI extracts merchant, items, and total instantly.", color: "from-orange-500 to-red-500", bg: "bg-orange-500/10" },
  { icon: Brain, title: "Money Pilot", desc: "AI scores your finances 0-100. Get personalized investment suggestions and action steps.", color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
  { icon: BarChart3, title: "Smart Dashboard", desc: "Spending heatmaps, category charts, expense predictions — your financial overview at a glance.", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
  { icon: Bot, title: "Telegram Bot", desc: "Send '250 Carrefour #grocery' — done. Get budget alerts and monthly reports.", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  { icon: Map, title: "Money Map", desc: "See where you spend on a real Google Map. Colored pins by spend amount.", color: "from-teal-500 to-emerald-500", bg: "bg-teal-500/10" },
  { icon: Mic, title: "Voice Transactions", desc: "Say it. AI transcribes and parses into a transaction with Whisper + GPT-4.", color: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
  { icon: Target, title: "Savings Goals", desc: "Set targets with deadlines. Animated jar fills up as you save.", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  { icon: Users, title: "Household Sharing", desc: "Family finance. Invite members, see shared transactions, compete on leaderboard.", color: "from-indigo-500 to-blue-500", bg: "bg-indigo-500/10" },
  { icon: CreditCard, title: "Bill Negotiator", desc: "AI finds subscriptions to cancel and bills to reduce. Actionable steps included.", color: "from-red-500 to-pink-500", bg: "bg-red-500/10" },
];

const STATS = [
  { value: "30+", label: "Features" },
  { value: "$0", label: "Forever" },
  { value: "9", label: "AI tools" },
  { value: "100%", label: "Open Source" },
];

const SCREENSHOTS = [
  { src: "/screenshot/desktop/dashboard.png", alt: "Dashboard", label: "Smart Dashboard" },
  { src: "/screenshot/mobile/transactions.png", alt: "Transactions", label: "Track Everything" },
  { src: "/screenshot/desktop/pilot.png", alt: "Money Pilot", label: "AI Money Pilot" },
  { src: "/screenshot/mobile/map.png", alt: "Money Map", label: "Money Map" },
  { src: "/screenshot/mobile/ai-features.png", alt: "AI Features", label: "AI Features" },
  { src: "/screenshot/mobile/lifestyle.png", alt: "Lifestyle", label: "Lifestyle Planner" },
];

export default function LandingV2() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Auto-rotate screenshots
  useEffect(() => {
    const t = setInterval(() => setActiveScreenshot((p) => (p + 1) % SCREENSHOTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Track mouse for parallax
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleDemo = async () => {
    setDemoLoading(true);
    if (isLoggedIn) await signOut({ redirect: false });
    const result = await signInAsDemo();
    if (result.success) window.location.href = "/dashboard";
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">MoneyStyle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="#features" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
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

      {/* ── Hero with parallax ── */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-28 sm:pb-24">
        {/* Floating gradient orbs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }} />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s", transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }} />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground mb-6 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                100% Free &middot; Open Source &middot; AI-Powered
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Know where every
                <br />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  dollar goes
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-5 text-lg text-muted-foreground sm:text-xl max-w-lg leading-relaxed">
                The personal finance tracker with <strong>30+ features</strong>, AI insights, and zero cost. Track spending, scan receipts, plan weekends, grow wealth.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-8 flex flex-wrap gap-3">
                {!isLoggedIn && (
                  <Button asChild size="lg" className="text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                    <Link href="/auth/register">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" className="text-base hover:scale-105 transition-all" onClick={handleDemo} disabled={demoLoading}>
                  {demoLoading ? "Loading..." : "Try Live Demo"}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://www.producthunt.com/products/moneystyle" target="_blank" rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#da552f] to-[#ef7a4a] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#da552f]/20 hover:shadow-[#da552f]/40 hover:scale-105 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 001.8-1.8 1.8 1.8 0 00-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 014.199 4.2 4.2 4.2 0 01-4.2 4.2z"/></svg>
                  Product Hunt
                </a>
                <a href="https://github.com/sinaghadrico/moneystyle" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 shadow-lg hover:scale-105 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  Open Source
                </a>
                <a href="https://t.me/moneystyle_app_bot" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#26A5E4] to-[#0088cc] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#26A5E4]/20 hover:scale-105 transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right — interactive screenshot carousel */}
          <Reveal delay={300}>
            <div className="relative" style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }}>
              <div className="relative rounded-2xl border-2 border-border/50 bg-card shadow-2xl shadow-emerald-500/5 overflow-hidden">
                {SCREENSHOTS.map((s, i) => (
                  <div
                    key={s.alt}
                    className={`transition-all duration-700 ${i === activeScreenshot ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute inset-0"}`}
                  >
                    <Image src={s.src} alt={s.alt} width={800} height={500} className="w-full h-auto" priority={i === 0} />
                  </div>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {SCREENSHOTS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScreenshot(i)}
                    className={`transition-all duration-300 rounded-full ${i === activeScreenshot ? "w-8 h-2 bg-emerald-500" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                  />
                ))}
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium text-muted-foreground">{SCREENSHOTS[activeScreenshot].label}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats counter ── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center group">
                  <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — interactive cards ── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 scroll-mt-16">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need.{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Nothing you don&apos;t.</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-lg mx-auto">
              9 AI-powered features. 30+ tools. Zero cost.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group relative rounded-xl border bg-card p-5 hover:shadow-lg hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="text-center mt-8">
            <Link href="/features/receipt-scanner" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors">
              See all 30+ features <ArrowRight className="inline h-4 w-4 ml-1" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Why MoneyStyle — with animated checkmarks ── */}
      <section className="border-y bg-gradient-to-b from-muted/30 via-emerald-500/[0.02] to-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Why people switch to MoneyStyle
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Built by a developer who was tired of paying for basic budgeting tools.
                </p>
              </div>
            </Reveal>

            <div className="space-y-3">
              {[
                { text: "30+ features — completely free, forever", bold: "30+ features" },
                { text: "No ads, no data selling, no subscriptions", bold: "No ads" },
                { text: "AI uses your own OpenAI key — you pay ~$0.01/action directly", bold: "your own" },
                { text: "Self-hostable — run on your own server with Docker", bold: "Self-hostable" },
                { text: "Open source — MIT license, verify the code yourself", bold: "Open source" },
                { text: "Multi-currency, multi-user, household sharing", bold: "Multi-currency" },
              ].map((b, i) => (
                <Reveal key={b.text} delay={i * 80}>
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:border-emerald-500/30 hover:shadow-sm transition-all group">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm">{b.text}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-center justify-center gap-12 text-center">
          {[
            { icon: Shield, label: "Bank-level encryption", color: "text-emerald-500" },
            { icon: Zap, label: "30+ features", color: "text-amber-500" },
            { icon: Globe, label: "Multi-currency", color: "text-blue-500" },
            { icon: Smartphone, label: "PWA — any device", color: "text-purple-500" },
            { icon: TrendingUp, label: "AI-powered insights", color: "text-rose-500" },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.label} delay={i * 100}>
                <div className="group cursor-default">
                  <Icon className={`h-7 w-7 mx-auto ${t.color} group-hover:scale-125 transition-transform duration-300`} />
                  <p className="text-xs text-muted-foreground mt-2">{t.label}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Ready to take control of your money?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
              Free forever. No credit card. Start in seconds.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild size="lg" className="text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                <Link href="/auth/register">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base hover:scale-105 transition-all" onClick={handleDemo} disabled={demoLoading}>
                {demoLoading ? "Loading..." : "Try Live Demo"}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter maxWidth="max-w-6xl" />

      {/* ── CSS for gradient animation ── */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
}
