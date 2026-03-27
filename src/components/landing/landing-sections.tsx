"use client";

import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  ScanLine,
  ShoppingBasket,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    emoji: "😰",
    title: "Where did $500 go?",
    description:
      "You check your bank, see the balance, and have no idea what happened this month.",
  },
  {
    emoji: "🧾",
    title: "Receipts in a drawer",
    description:
      "Paper receipts pile up. You promise yourself you'll review them. You never do.",
  },
  {
    emoji: "🛒",
    title: "Same item, different prices",
    description:
      "You buy the same groceries every week but never know which store is actually cheaper.",
  },
];

const PILLARS = [
  {
    icon: LayoutDashboard,
    label: "See Everything",
    title: "Know exactly where every dollar goes",
    description:
      "Log transactions, scan receipts with AI, and get real-time dashboards with spending heatmaps, category breakdowns, and trend predictions.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    mockItems: [
      { label: "Groceries", value: "$342", pct: 35 },
      { label: "Dining Out", value: "$185", pct: 19 },
      { label: "Transport", value: "$128", pct: 13 },
      { label: "Entertainment", value: "$95", pct: 10 },
      { label: "Bills & Utils", value: "$230", pct: 23 },
    ],
  },
  {
    icon: ScanLine,
    label: "Automate Everything",
    title: "Snap a receipt. AI does the rest.",
    description:
      "Take a photo of any receipt — AI extracts every line item, categorizes it, and logs the transaction. Works with English, Arabic, and Farsi.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    mockItems: [
      { label: "Whole Milk 1L", value: "$3.49", pct: 0 },
      { label: "Sourdough Bread", value: "$4.99", pct: 0 },
      { label: "Free-Range Eggs", value: "$6.29", pct: 0 },
      { label: "Olive Oil 500ml", value: "$8.99", pct: 0 },
      { label: "Total: $23.76", value: "Auto-saved", pct: 0 },
    ],
  },
  {
    icon: ShoppingBasket,
    label: "Save Money",
    title: "AI finds the cheapest store for your basket",
    description:
      "Build a shopping list and AI compares prices across every store you've ever shopped at — from your own data. Split across stores for max savings.",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
    href: "/features/smart-shopping",
    mockItems: [
      { label: "GreenGrocer", value: "$28.75", pct: 100 },
      { label: "FreshMart", value: "$34.50", pct: 70 },
      { label: "MegaStore", value: "$31.20", pct: 85 },
      { label: "Split Strategy", value: "$22.75", pct: 0 },
      { label: "You save", value: "$23.50", pct: 0 },
    ],
  },
];

const STEPS = [
  {
    num: "1",
    title: "Create your free account",
    description:
      "Sign up in 10 seconds. No credit card, no subscription. All 30 features are yours — completely free.",
  },
  {
    num: "2",
    title: "Log or scan your first expense",
    description:
      "Add a transaction manually or snap a receipt — AI extracts everything. Import bank CSV for instant history.",
  },
  {
    num: "3",
    title: "Want AI? Bring your own key",
    description:
      "Set your own OpenAI API key in Settings to unlock receipt scanning, Money Pilot, and more. Or message us — we'll set it up for you.",
  },
];

export interface LandingSectionsProps {
  painRef: React.RefObject<HTMLElement | null>;
  painInView: boolean;
  whyTrackRef: React.RefObject<HTMLElement | null>;
  whyTrackInView: boolean;
  pillarRefs: React.RefObject<HTMLElement | null>[];
  pillarInViews: boolean[];
  howItWorksRef: React.RefObject<HTMLElement | null>;
  howItWorksInView: boolean;
  comparisonRef: React.RefObject<HTMLElement | null>;
  comparisonInView: boolean;
}

export function LandingSections({
  painRef,
  painInView,
  whyTrackRef,
  whyTrackInView,
  pillarRefs,
  pillarInViews,
  howItWorksRef,
  howItWorksInView,
  comparisonRef,
  comparisonInView,
}: LandingSectionsProps) {
  return (
    <>
      {/* ── Pain Points ── */}
      <section ref={painRef} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div
            className={`text-center mb-10 transition-all duration-700 ${painInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Sound familiar?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PAIN_POINTS.map((p, i) => (
              <div
                key={p.title}
                className={`rounded-2xl border bg-card p-6 transition-all duration-500 ${painInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Track (Statistics + Expert Quote) ── */}
      <section ref={whyTrackRef} id="why-track">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${whyTrackInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Personal Finance Tracking Matters
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              The numbers don&apos;t lie — and most people don&apos;t track them.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {[
              {
                stat: "$7,951",
                label: "average credit card debt per U.S. household",
                source: "Federal Reserve, 2024",
              },
              {
                stat: "32%",
                label: "of Americans maintain a household budget",
                source: "Gallup, 2023",
              },
              {
                stat: "20%",
                label: "more saved per month by people who track expenses",
                source: "NBER, 2022",
              },
            ].map((item, i) => (
              <div
                key={item.stat}
                className={`rounded-2xl border bg-card p-6 text-center transition-all duration-500 ${whyTrackInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {item.stat}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {item.source}
                </p>
              </div>
            ))}
          </div>
          <div
            className={`mx-auto max-w-2xl transition-all duration-700 delay-300 ${whyTrackInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <blockquote className="rounded-2xl border bg-card p-6 sm:p-8">
              <p className="text-lg italic text-muted-foreground leading-relaxed">
                &ldquo;Tracking every dollar isn&apos;t about restriction —
                it&apos;s about awareness. When people see exactly where their
                money goes, they naturally make better decisions.&rdquo;
              </p>
              <footer className="mt-4 text-sm font-medium">
                — Sina Ghadri, Founder &amp; CEO of MoneyStyle
              </footer>
            </blockquote>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Sources:{" "}
              <a
                href="https://www.federalreserve.gov/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Federal Reserve
              </a>
              ,{" "}
              <a
                href="https://news.gallup.com/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Gallup
              </a>
              ,{" "}
              <a
                href="https://www.nber.org/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                NBER
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Solution Pillars ── */}
      {PILLARS.map((pillar, pi) => {
        const pRef = pillarRefs[pi];
        const pInView = pillarInViews[pi];
        const isEven = pi % 2 === 0;
        return (
          <section
            key={pillar.label}
            ref={pRef}
            className={pi % 2 !== 0 ? "bg-muted/30 border-y" : ""}
          >
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* Text */}
                <div
                  className={`${!isEven ? "lg:order-2" : ""} transition-all duration-700 ${pInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium mb-4 ${pillar.bg} ${pillar.color}`}
                  >
                    <pillar.icon className="h-4 w-4" />
                    {pillar.label}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {pillar.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                    {pillar.description}
                  </p>
                  {pillar.href && (
                    <Link
                      href={pillar.href}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      See how it works
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                {/* Mock UI */}
                <div
                  className={`${!isEven ? "lg:order-1" : ""} transition-all duration-700 delay-200 ${pInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div className="rounded-2xl border bg-card p-5 shadow-lg">
                    <div className="space-y-2.5">
                      {pillar.mockItems.map((item, i) => (
                        <div
                          key={item.label}
                          className={`transition-all duration-500 ${pInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                          style={{ transitionDelay: `${400 + i * 120}ms` }}
                        >
                          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                            <span
                              className={`text-sm font-bold ${i === pillar.mockItems.length - 1 ? pillar.color : ""}`}
                            >
                              {item.value}
                            </span>
                          </div>
                          {item.pct > 0 && pi === 0 && (
                            <div className="mt-1 mx-1 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                                style={{
                                  width: pInView ? `${item.pct}%` : "0%",
                                  transitionDelay: `${500 + i * 120}ms`,
                                }}
                              />
                            </div>
                          )}
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

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${howItWorksInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in seconds
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              No setup. No complexity. Just sign up and go.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`relative rounded-2xl border bg-card p-6 transition-all duration-500 ${howItWorksInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section ref={comparisonRef} className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className={`text-center mb-12 transition-all duration-700 ${comparisonInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              MoneyStyle vs Traditional Budgeting
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              See how AI-powered finance tracking compares to manual methods.
            </p>
          </div>
          <div
            className={`overflow-x-auto transition-all duration-700 delay-200 ${comparisonInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-sm font-semibold">Feature</th>
                  <th className="py-3 px-4 text-sm font-semibold text-emerald-500">MoneyStyle</th>
                  <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">Spreadsheet</th>
                  <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">Basic App</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI Receipt Scanning", true, false, false],
                  ["Price Comparison", true, false, false],
                  ["AI Money Pilot", true, false, "Limited"],
                  ["Multi-Currency", true, "Manual", "Limited"],
                  ["Budget Alerts", true, false, true],
                  ["Investment Tracking", true, false, false],
                  ["Subscription Detection", true, false, false],
                  ["Developer API", true, false, false],
                  ["Free to Start", true, true, "Varies"],
                ].map(([feature, ms, sheet, basic], i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 text-sm font-medium">{feature as string}</td>
                    {[ms, sheet, basic].map((val, j) => (
                      <td key={j} className="py-3 px-4 text-sm">
                        {val === true ? (
                          <span className="text-emerald-500 font-medium">Yes</span>
                        ) : val === false ? (
                          <span className="text-muted-foreground">No</span>
                        ) : (
                          <span className="text-muted-foreground">{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
