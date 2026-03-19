import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft, ArrowRight, Linkedin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "MoneyStyle is a 100% free personal finance tracker built by Sina Ghadri. 30 features, no subscriptions, no ads. AI features use your own OpenAI key.",
  alternates: {
    canonical: "https://moneystyle.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="text-sm font-bold">MoneyStyle</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-12">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            About MoneyStyle
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            MoneyStyle is a <strong className="text-foreground">100% free</strong> personal
            finance tracker with 30 features — from expense tracking and budget management
            to AI receipt scanning, investment tracking, and subscription detection.
          </p>
        </div>

        {/* Mission */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe everyone deserves powerful financial tools — not just those who can
            afford premium subscriptions. MoneyStyle gives you the same capabilities as
            apps charging $10-15/month, completely free. No ads, no data selling, no hidden fees.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">How We Keep It Free</h2>
          <p className="text-muted-foreground leading-relaxed">
            All 30 features work without paying a cent. AI-powered features like receipt
            scanning, money advice, meal planning, and money chat use OpenAI under the hood.
            You have two options:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-emerald-500 font-bold shrink-0">1.</span>
              <span>
                <strong className="text-foreground">Bring your own key</strong> — Get an
                OpenAI API key and set it in Settings. Costs about $0.01 per AI action.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 font-bold shrink-0">2.</span>
              <span>
                <strong className="text-foreground">We set it up for you</strong> — Message
                us and we&apos;ll configure the AI key for your account. Small fee covers
                the API costs.
              </span>
            </li>
          </ul>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { value: "30", label: "Features" },
            { value: "$0", label: "Price" },
            { value: "0", label: "Ads" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border bg-card p-5 text-center"
            >
              <p className="text-2xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Founder */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Built by</h2>
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                SG
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sina Ghadri</h3>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Engineer and founder of MoneyStyle. Building tools that make
                  personal finance accessible to everyone, everywhere.
                </p>
                <div className="flex gap-3 mt-3">
                  <a
                    href="https://www.linkedin.com/in/sina-ghadri"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    href="mailto:support@moneystyle.app"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Ready to take control of your money?</h2>
          <p className="text-muted-foreground">
            Free forever. No credit card. Start in seconds.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LogoMark className="h-4 w-4" />
              <span>MoneyStyle</span>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/docs/api" className="hover:text-foreground transition-colors">
                API Docs
              </Link>
            </div>
            <p>100% free personal finance tracker</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
