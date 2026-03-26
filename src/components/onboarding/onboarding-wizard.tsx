"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  BarChart3,
  PiggyBank,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/actions/settings";
import { completeOnboarding, setupOnboardingBudgets } from "@/actions/onboarding";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Goal = "track" | "budget" | "save" | "all";

type Currency = {
  code: string;
  symbol: string;
};

type BudgetCategory = {
  emoji: string;
  name: string;
  color: string;
  amount: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOALS: { id: Goal; label: string; icon: React.ElementType }[] = [
  { id: "track", label: "Track spending", icon: Receipt },
  { id: "budget", label: "Budget better", icon: BarChart3 },
  { id: "save", label: "Save more", icon: PiggyBank },
  { id: "all", label: "All of the above", icon: Sparkles },
];

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "\u20AC" },
  { code: "GBP", symbol: "\u00A3" },
  { code: "AED", symbol: "\u062F.\u0625" },
  { code: "SAR", symbol: "\uFDFC" },
  { code: "INR", symbol: "\u20B9" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
];

const INITIAL_BUDGETS: BudgetCategory[] = [
  { emoji: "\uD83C\uDF54", name: "Food & Dining", color: "#ef4444", amount: "" },
  { emoji: "\uD83D\uDED2", name: "Groceries", color: "#22c55e", amount: "" },
  { emoji: "\uD83D\uDE97", name: "Transport", color: "#3b82f6", amount: "" },
  { emoji: "\uD83C\uDFAC", name: "Entertainment", color: "#a855f7", amount: "" },
];

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            i <= current
              ? "w-8 bg-gradient-to-r from-emerald-500 to-teal-500"
              : "w-2.5 bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function WelcomeStep({
  selected,
  onSelect,
}: {
  selected: Goal | null;
  onSelect: (g: Goal) => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-2xl font-bold">Welcome to MoneyStyle</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Let&apos;s get your finances set up in a few quick steps.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">What&apos;s your main goal?</p>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const active = selected === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelect(g.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${active ? "text-emerald-500" : "text-muted-foreground"}`}
                />
                <span className="text-sm font-medium">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CurrencyStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-2xl font-bold">Set Your Currency</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick the currency you use most often. You can change it later in
          settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CURRENCIES.map((c) => {
          const active = selected === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelect(c.code)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all ${
                active
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <span className="text-lg font-bold">{c.symbol}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {c.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BudgetStep({
  budgets,
  onChange,
}: {
  budgets: BudgetCategory[];
  onChange: (idx: number, amount: string) => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-2xl font-bold">Your First Budget</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Set monthly spending limits for common categories. You can skip this
          and set them up later.
        </p>
      </div>

      <div className="space-y-3">
        {budgets.map((b, idx) => (
          <div
            key={b.name}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <span className="text-2xl">{b.emoji}</span>
            <span className="flex-1 text-left text-sm font-medium">
              {b.name}
            </span>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={b.amount}
              onChange={(e) => onChange(idx, e.target.value)}
              className="w-28 text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CompleteStep({
  currency,
  budgetCount,
}: {
  currency: string;
  budgetCount: number;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
        <Check className="h-10 w-10 text-white animate-in zoom-in duration-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is ready. Here&apos;s what we set up:
        </p>
      </div>

      <div className="mx-auto max-w-xs space-y-2 text-left text-sm">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>Currency set to {currency}</span>
        </div>
        {budgetCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>
              {budgetCount} budget{budgetCount > 1 ? "s" : ""} created
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [goal, setGoal] = useState<Goal | null>(null);

  // Step 2
  const [currency, setCurrency] = useState("USD");

  // Step 3
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);

  const budgetCount = budgets.filter((b) => b.amount && Number(b.amount) > 0).length;

  const handleBudgetChange = useCallback((idx: number, amount: string) => {
    setBudgets((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], amount };
      return next;
    });
  }, []);

  // Navigation ---------------------------------------------------------------

  const canGoNext = () => {
    if (step === 0) return goal !== null;
    return true;
  };

  const handleNext = async () => {
    if (step >= TOTAL_STEPS - 1) return;

    setLoading(true);
    try {
      // Save currency when leaving step 2
      if (step === 1) {
        await updateSettings({ currency });
      }

      // Save budgets when leaving step 3
      if (step === 2) {
        const items = budgets
          .filter((b) => Number(b.amount) > 0)
          .map((b) => ({ name: b.name, color: b.color, amount: Number(b.amount) }));
        if (items.length > 0) {
          await setupOnboardingBudgets(items);
        }
      }

      setStep((s) => s + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      router.refresh();
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Render -------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex w-full max-w-lg flex-col gap-8 px-6 py-10">
        {/* Logo */}
        <div className="text-center">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-xl font-bold text-transparent">
            MoneyStyle
          </span>
        </div>

        {/* Progress */}
        <ProgressDots current={step} />

        {/* Step content */}
        <div className="min-h-[320px]">
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {step === 0 && <WelcomeStep selected={goal} onSelect={setGoal} />}
            {step === 1 && (
              <CurrencyStep selected={currency} onSelect={setCurrency} />
            )}
            {step === 2 && (
              <BudgetStep budgets={budgets} onChange={handleBudgetChange} />
            )}
            {step === 3 && (
              <CompleteStep currency={currency} budgetCount={budgetCount} />
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full gap-2">
          {step === 0 ? (
            <Button
              className="flex-1"
              disabled={!canGoNext() || loading}
              onClick={handleNext}
            >
              Get Started
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : step === TOTAL_STEPS - 1 ? (
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              disabled={loading}
              onClick={handleFinish}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={handleBack}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={handleNext}
              >
                {step === 2 && budgetCount === 0 ? "Skip" : "Next"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
