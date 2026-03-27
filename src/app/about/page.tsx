import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft, ArrowRight, Linkedin, Mail } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";

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
            MoneyStyle is a{" "}
            <strong className="text-foreground">100% free</strong> personal
            finance tracker with 30 features — from expense tracking and budget
            management to AI receipt scanning, investment tracking, and
            subscription detection.
          </p>
        </div>

        {/* Mission */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe everyone deserves powerful financial tools — not just
            those who can afford premium subscriptions. MoneyStyle gives you the
            same capabilities as apps charging $10-15/month, completely free. No
            ads, no data selling, no hidden fees.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">How We Keep It Free</h2>
          <p className="text-muted-foreground leading-relaxed">
            All 30 features work without paying a cent. AI-powered features like
            receipt scanning, Money Pilot, meal planning, and money chat use
            OpenAI under the hood. You have two options:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-emerald-500 font-bold shrink-0">1.</span>
              <span>
                <strong className="text-foreground">Bring your own key</strong>{" "}
                — Get an OpenAI API key and set it in Settings. Costs about
                $0.01 per AI action.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 font-bold shrink-0">2.</span>
              <span>
                <strong className="text-foreground">
                  We set it up for you
                </strong>{" "}
                — Message us and we&apos;ll configure the AI key for your
                account. Small fee covers the API costs.
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

        {/* Featured on */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Find us on</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.producthunt.com/products/moneystyle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-[#da552f]/50 hover:bg-[#da552f]/5 transition-colors"
            >
              <svg
                className="h-5 w-5 text-[#da552f]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 001.8-1.8 1.8 1.8 0 00-1.8-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804a4.2 4.2 0 014.199 4.2 4.2 4.2 0 01-4.2 4.2z" />
              </svg>
              Product Hunt
            </a>
            <a
              href="https://github.com/sinaghadrico/moneystyle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-foreground/30 hover:bg-muted transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub (Open Source)
            </a>
            <a
              href="https://t.me/moneystyle_app_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:border-[#26A5E4]/50 hover:bg-[#26A5E4]/5 transition-colors"
            >
              <svg
                className="h-5 w-5 text-[#26A5E4]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram Bot
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">
            Ready to take control of your money?
          </h2>
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

      <SiteFooter />
    </div>
  );
}
