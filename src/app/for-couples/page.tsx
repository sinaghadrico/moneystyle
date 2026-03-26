import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Scissors,
  BarChart3,
  Target,
  Lock,
  MessageCircle,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "MoneyStyle for Couples",
  description:
    "Manage your finances together. Shared accounts, split expenses, joint budgets, and household collaboration — all free.",
  alternates: {
    canonical: "https://moneystyle.app/for-couples",
  },
};

const steps = [
  {
    number: 1,
    title: "Create Your Household",
    description:
      "Invite your partner with a simple link. They join your household in seconds — no complicated setup.",
  },
  {
    number: 2,
    title: "Track Together",
    description:
      "Shared transactions, split expenses, and joint budgets. See the full picture of your household finances.",
  },
  {
    number: 3,
    title: "Grow Together",
    description:
      "Combined savings goals and financial insights. Build your future as a team with shared financial clarity.",
  },
];

const features = [
  {
    icon: Users,
    title: "Household Sharing",
    description: "Share finances with unlimited members. Everyone stays on the same page.",
  },
  {
    icon: Scissors,
    title: "Split Expenses",
    description: "Split any transaction between partners. Fair, flexible, and automatic.",
  },
  {
    icon: BarChart3,
    title: "Joint Budgets",
    description: "Set and track budgets together. Know exactly where your money goes.",
  },
  {
    icon: Target,
    title: "Shared Savings Goals",
    description: "Save for goals as a team. Vacations, home down payments, or emergency funds.",
  },
  {
    icon: Lock,
    title: "Individual Privacy",
    description: "Keep personal transactions private. Share what you want, keep what you don't.",
  },
  {
    icon: MessageCircle,
    title: "Money Chat for Two",
    description: "AI-powered advice tailored for couple finances. Ask anything, anytime.",
  },
];

const stats = [
  { value: "Unlimited", label: "Members" },
  { value: "$0", label: "Price" },
  { value: "Real-time", label: "Sync" },
];

export default function ForCouplesPage() {
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

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-16">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
            <Heart className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Money,{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Managing finances as a couple shouldn&apos;t be stressful. MoneyStyle brings
            transparency, collaboration, and shared goals to your household — completely free.
          </p>
        </div>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-center">How It Works</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-sm">
                  {step.number}
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-center">Everything You Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-5 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <feature.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Better Together Stats */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Better Together</h2>
            <p className="text-muted-foreground">
              Couples who budget together save{" "}
              <strong className="text-foreground">2x more</strong>. Start building your
              financial future as a team.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
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
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Start Managing Money Together</h2>
          <p className="text-muted-foreground">
            Free forever. No credit card. Create your household in seconds.
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
