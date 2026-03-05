"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import type { FeatureConfig } from "@/lib/feature-data";
import {
  ArrowLeft,
  ArrowRight,
  LogIn,
  Moon,
  Sun,
  Wallet,
  ShoppingBasket,
  LayoutDashboard,
  CreditCard,
  Receipt,
  BarChart3,
  Target,
  PiggyBank,
  Repeat,
  TrendingUp,
  Link2,
  ShoppingCart,
  Users,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  Globe,
  Bell,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "smart-dashboard": LayoutDashboard,
  "transaction-tracking": CreditCard,
  "receipt-scanner": Receipt,
  "budget-management": BarChart3,
  "savings-goals": Target,
  reserves: PiggyBank,
  "installments-bills": Repeat,
  "income-tracking": TrendingUp,
  "transaction-linking": Link2,
  "price-analysis": ShoppingCart,
  "smart-shopping": ShoppingBasket,
  "shared-expenses": Users,
  "money-advice": Sparkles,
  "weekend-planner": Calendar,
  "meal-planner": UtensilsCrossed,
  "multi-currency": Globe,
  "telegram-bot": Bell,
  "sms-import": Smartphone,
};

export function FeatureLanding({ feature }: { feature: FeatureConfig }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();

  const hero = useInView(0.1);
  const step0 = useInView(0.15);
  const step1 = useInView(0.15);
  const step2 = useInView(0.15);
  const benefitsView = useInView(0.15);
  const cta = useInView(0.15);
  const stepViews = [step0, step1, step2];

  const Icon = ICON_MAP[feature.slug] || ShoppingBasket;
  const stepColors = [
    { badge: `bg-${feature.color}/10 text-${feature.color}`, bar: `bg-${feature.color}` },
    { badge: "bg-blue-500/10 text-blue-500", bar: "bg-blue-500" },
    { badge: "bg-purple-500/10 text-purple-500", bar: "bg-purple-500" },
  ];

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
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                MoneyLoom
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
          <div
            className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-${feature.color}/8 blur-3xl`}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 text-center">
          <div
            className={`transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6`}
            >
              <Icon className={`h-3.5 w-3.5 text-${feature.color}`} />
              {feature.badge}
            </div>
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {feature.headline}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${feature.hex}, ${feature.hexSecondary})`,
              }}
            >
              {feature.headlineAccent}
            </span>
          </h1>

          <p
            className={`mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl transition-all duration-700 delay-200 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {feature.tagline}
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

          {/* Icon */}
          <div
            className={`mt-12 flex justify-center transition-all duration-1000 delay-500 ${hero.inView ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          >
            <div
              className={`rounded-3xl p-8 border`}
              style={{
                background: `linear-gradient(135deg, ${feature.hex}15, ${feature.hexSecondary}15)`,
                borderColor: `${feature.hex}30`,
              }}
            >
              <Icon
                className="h-16 w-16 animate-bounce"
                style={{ color: feature.hex }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      {feature.steps.map((step, si) => {
        const sv = stepViews[si];
        const isEven = si % 2 === 0;
        return (
          <section
            key={si}
            ref={sv.ref}
            className={si % 2 === 0 ? "border-y bg-muted/30" : ""}
          >
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* Text */}
                <div
                  className={`${!isEven ? "lg:order-2" : ""} transition-all duration-700 ${sv.inView ? "opacity-100 translate-x-0" : `opacity-0 ${isEven ? "-translate-x-8" : "translate-x-8"}`}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium mb-4 ${stepColors[si].badge}`}
                  >
                    Step {si + 1}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground text-lg">
                    {step.description}
                  </p>
                </div>

                {/* Mock UI */}
                <div
                  className={`${!isEven ? "lg:order-1" : ""} transition-all duration-700 delay-200 ${sv.inView ? "opacity-100 translate-x-0" : `opacity-0 ${isEven ? "translate-x-8" : "-translate-x-8"}`}`}
                >
                  <div className="rounded-2xl border bg-card p-5 shadow-lg">
                    <div className="space-y-2.5">
                      {step.items.map((item, i) => (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-500 ${sv.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${item.highlight ? `border-${feature.color}/30 bg-${feature.color}/5` : ""}`}
                          style={{
                            transitionDelay: `${400 + i * 120}ms`,
                          }}
                        >
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          <span
                            className={`text-sm font-bold ${item.highlight ? `text-${feature.color}` : ""}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Benefits */}
      <section ref={benefitsView.ref} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${benefitsView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why It Works
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feature.benefits.map((b, i) => (
              <div
                key={b.title}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 hover:shadow-md ${benefitsView.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="inline-flex rounded-xl p-2.5"
                  style={{ background: `${feature.hex}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: feature.hex }} />
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

      {/* CTA */}
      <section ref={cta.ref}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 text-center">
          <div
            className={`transition-all duration-700 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Icon
              className="h-10 w-10 mx-auto mb-4"
              style={{ color: feature.hex }}
            />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Try {feature.badge} Today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-lg">
              Sign up free and start using {feature.badge} with your own
              data.
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
              <Wallet className="h-4 w-4" />
              <span>MoneyLoom</span>
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
