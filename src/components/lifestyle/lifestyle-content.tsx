"use client";

import { useState } from "react";
import { Sparkles, CalendarHeart, ChefHat, ShoppingCart } from "lucide-react";
import { MoneyAdviceSection } from "@/components/profile/money-advice-section";
import { WeekendPlannerContent } from "@/components/weekend-planner/weekend-planner-content";
import { MealPlannerContent } from "@/components/meal-planner/meal-planner-content";
import { ShoppingBasketsSection } from "./shopping-baskets-section";

const TABS = [
  { key: "money-advice", label: "Money Advice", icon: Sparkles },
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lifestyle</h2>
        <p className="text-muted-foreground">
          AI-powered planning and smart shopping
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
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
