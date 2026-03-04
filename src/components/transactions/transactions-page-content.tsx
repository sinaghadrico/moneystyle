"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  List,
  Merge,
  SlidersHorizontal,
  TrendingUp,
  Landmark,
  Users,
  Tags,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionsContent } from "@/components/transactions/transactions-content";
import { MergeSuggestionsContent } from "@/components/merge/merge-suggestions-content";
import { AccountsContent } from "@/components/accounts/accounts-content";
import { PersonsContent } from "@/components/persons/persons-content";
import { CategoriesContent } from "@/components/categories/categories-content";
import { PriceAnalysisContent } from "@/components/price-analysis/price-analysis-content";

const TABS = [
  { key: "list", label: "List", icon: List },
  { key: "merge", label: "Merge", icon: Merge },
  { key: "manage", label: "Manage", icon: SlidersHorizontal },
  { key: "prices", label: "Prices", icon: TrendingUp },
] as const;

type Tab = (typeof TABS)[number]["key"];

const MANAGE_SECTIONS = [
  { key: "accounts", label: "Accounts", icon: Landmark },
  { key: "persons", label: "Persons", icon: Users },
  { key: "categories", label: "Categories", icon: Tags },
] as const;

type ManageSection = (typeof MANAGE_SECTIONS)[number]["key"];

export function TransactionsPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [manageSection, setManageSection] =
    useState<ManageSection>("accounts");

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && TABS.some((t) => t.key === urlTab)) {
      setActiveTab(urlTab as Tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
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
      {activeTab === "list" && (
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-[500px] w-full rounded-md" />
            </div>
          }
        >
          <TransactionsContent />
        </Suspense>
      )}

      {activeTab === "merge" && <MergeSuggestionsContent />}

      {activeTab === "manage" && (
        <div className="space-y-5">
          {/* Manage sub-navigation */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {MANAGE_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = manageSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setManageSection(section.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {manageSection === "accounts" && <AccountsContent />}
          {manageSection === "persons" && <PersonsContent />}
          {manageSection === "categories" && <CategoriesContent />}
        </div>
      )}

      {activeTab === "prices" && (
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-[500px] w-full rounded-md" />
            </div>
          }
        >
          <PriceAnalysisContent />
        </Suspense>
      )}
    </div>
  );
}
