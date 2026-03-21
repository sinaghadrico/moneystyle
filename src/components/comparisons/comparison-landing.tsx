"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import type { ComparisonConfig } from "@/lib/comparison-data";
import { LogoMark } from "@/components/ui/logo";
import {
  ArrowLeft,
  ArrowRight,
  LogIn,
  Moon,
  Sun,
  Check,
  X,
  ChevronDown,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";

export function ComparisonLanding({
  comparison,
}: {
  comparison: ComparisonConfig;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();

  const hero = useInView(0.1);
  const whySwitch = useInView(0.15);
  const tableView = useInView(0.1);
  const moreAdvantages = useInView(0.15);
  const pricingView = useInView(0.15);
  const faqView = useInView(0.15);
  const cta = useInView(0.15);

  const topAdvantages = comparison.advantages.slice(0, 3);
  const remainingAdvantages = comparison.advantages.slice(3);

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
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 text-center">
          <div
            className={`transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              Comparison
            </div>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            MoneyStyle vs
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #10b981, #14b8a6)",
              }}
            >
              {comparison.name}
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl transition-all duration-700 delay-200 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {comparison.tagline}
          </p>

          <p
            className={`mx-auto mt-4 max-w-3xl text-base text-muted-foreground/80 transition-all duration-700 delay-250 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {comparison.heroDescription}
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
        </div>
      </section>

      {/* Why Switch */}
      <section ref={whySwitch.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${whySwitch.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Switch to MoneyStyle?
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Here&apos;s what you gain by making the move
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topAdvantages.map((adv, i) => (
              <div
                key={adv.title}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-md ${whySwitch.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="inline-flex rounded-xl p-2.5 bg-emerald-500/10">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{adv.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {adv.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section ref={tableView.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${tableView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Feature Comparison
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              See how MoneyStyle stacks up feature by feature
            </p>
          </div>

          <div
            className={`rounded-2xl border bg-card overflow-hidden shadow-sm transition-all duration-700 delay-200 ${tableView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b bg-muted/50">
              <div className="p-4 font-semibold text-sm">Feature</div>
              <div className="p-4 font-semibold text-sm text-center bg-emerald-500/10 border-x border-emerald-500/20">
                <span className="text-emerald-600 dark:text-emerald-400">
                  MoneyStyle
                </span>
              </div>
              <div className="p-4 font-semibold text-sm text-center">
                {comparison.name.length > 20
                  ? comparison.name.split(" ")[0]
                  : comparison.name}
              </div>
            </div>

            {/* Table Rows */}
            {comparison.featureMatrix.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-b last:border-b-0 transition-all duration-500 ${tableView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${300 + i * 60}ms` }}
              >
                <div className="p-4 text-sm font-medium flex items-center">
                  {row.feature}
                </div>
                <div className="p-4 text-sm text-center flex items-center justify-center bg-emerald-500/5 border-x border-emerald-500/10">
                  <CellValue value={row.moneystyle} isMoneyStyle />
                </div>
                <div className="p-4 text-sm text-center flex items-center justify-center">
                  <CellValue value={row.competitor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Advantages */}
      {remainingAdvantages.length > 0 && (
        <section ref={moreAdvantages.ref} className="border-y bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div
              className={`text-center mb-12 transition-all duration-700 ${moreAdvantages.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Even More Reasons to Switch
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {remainingAdvantages.map((adv, i) => (
                <div
                  key={adv.title}
                  className={`rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-md ${moreAdvantages.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="inline-flex rounded-xl p-2.5 bg-emerald-500/10">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="mt-4 font-semibold">{adv.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Comparison */}
      <section ref={pricingView.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${pricingView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pricing Comparison
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Stop paying for features you can get for free
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {/* MoneyStyle Card */}
            <div
              className={`rounded-2xl border-2 border-emerald-500 bg-card p-8 relative transition-all duration-700 delay-200 ${pricingView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <LogoMark className="h-6 w-6" />
                <span className="font-bold text-lg">MoneyStyle</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-muted-foreground ml-1">/ forever</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>All features included</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>AI-powered insights</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Receipt scanning</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Lifestyle planning tools</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>No ads, no data selling</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6" size="lg">
                <Link href={isLoggedIn ? "/dashboard" : "/auth/register"}>
                  {isLoggedIn ? "Open App" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Competitor Card */}
            <div
              className={`rounded-2xl border bg-card p-8 transition-all duration-700 delay-300 ${pricingView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {comparison.name[0]}
                  </span>
                </div>
                <span className="font-bold text-lg">
                  {comparison.name.length > 25
                    ? comparison.name.split(" ")[0]
                    : comparison.name}
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">
                  {comparison.pricing}
                </span>
                {comparison.pricing !== "Discontinued" && (
                  <span className="text-muted-foreground ml-1">/ paid</span>
                )}
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <span>No AI features</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <span>No receipt scanning</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <span>No lifestyle tools</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <span>Limited availability</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <span>
                    {comparison.pricing === "Discontinued"
                      ? "No longer available"
                      : "Ongoing subscription cost"}
                  </span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 cursor-default"
                size="lg"
                disabled
              >
                {comparison.pricing === "Discontinued"
                  ? "Discontinued"
                  : comparison.pricing}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqView.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${faqView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {comparison.faq.map((item, i) => (
              <FaqItem
                key={i}
                question={item.question}
                answer={item.answer}
                index={i}
                inView={faqView.inView}
              />
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
            <Zap
              className="h-10 w-10 mx-auto mb-4 text-emerald-500"
            />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Switch?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              Join thousands who have already moved to MoneyStyle. Free forever,
              no credit card required.
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
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base"
                  >
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

function CellValue({
  value,
  isMoneyStyle = false,
}: {
  value: boolean | string;
  isMoneyStyle?: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={`text-sm font-medium ${isMoneyStyle ? "text-emerald-600 dark:text-emerald-400" : ""}`}
      >
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <Check
        className={`h-5 w-5 ${isMoneyStyle ? "text-emerald-500" : "text-foreground"}`}
      />
    );
  }
  return <X className="h-5 w-5 text-muted-foreground/40" />;
}

function FaqItem({
  question,
  answer,
  index,
  inView,
}: {
  question: string;
  answer: string;
  index: number;
  inView: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}
