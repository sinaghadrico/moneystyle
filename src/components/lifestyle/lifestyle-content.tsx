"use client";

import { useState } from "react";
import { Sparkles, CalendarHeart, ChefHat, ShoppingCart, PartyPopper } from "lucide-react";
import { MoneyAdviceSection } from "@/components/profile/money-advice-section";
import { WeekendPlannerContent } from "@/components/weekend-planner/weekend-planner-content";
import { MealPlannerContent } from "@/components/meal-planner/meal-planner-content";
import { ShoppingBasketsSection } from "./shopping-baskets-section";

const TABS = [
  { key: "money-advice", label: "Advice", icon: Sparkles },
  { key: "weekend", label: "Weekend", icon: CalendarHeart },
  { key: "meals", label: "Meals", icon: ChefHat },
  { key: "shopping", label: "Shopping", icon: ShoppingCart },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function LifestyleContent({ initialTab }: { initialTab?: string }) {
  const validTab = TABS.find((t) => t.key === initialTab)?.key;
  const [activeTab, setActiveTab] = useState<Tab>(validTab ?? "money-advice");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <PartyPopper className="h-6 w-6 shrink-0" />
          Lifestyle
        </h2>
        <p className="text-sm text-muted-foreground">
          AI-powered planning and smart shopping.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "money-advice" && <MoneyAdviceSection />}
      {activeTab === "weekend" && <WeekendPlannerContent />}
      {activeTab === "meals" && <MealPlannerContent />}
      {activeTab === "shopping" && <ShoppingBasketsSection />}
    </div>
  );
}
