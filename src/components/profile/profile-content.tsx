"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialOverviewCard } from "./financial-overview-card";
import { IncomeSourcesSection } from "./income-sources-section";
import { ReservesSection } from "./reserves-section";
import { InstallmentsSection } from "./installments-section";
import { BillsSection } from "./bills-section";
import { PreferencesSection } from "./preferences-section";
import { MoneyAdviceSection } from "./money-advice-section";
import {
  getIncomeSources,
  getReserves,
  getInstallments,
  getBills,
  getFinancialOverview,
} from "@/actions/profile";
import { getUserPreferences } from "@/actions/weekend-planner";
import { Wallet, UserCircle } from "lucide-react";
import type {
  IncomeSourceData,
  ReserveData,
  InstallmentData,
  BillData,
  FinancialOverview,
  UserPreferenceData,
} from "@/lib/types";

const TABS = [
  { key: "finance", label: "Finance", icon: Wallet },
  { key: "personal", label: "Personal", icon: UserCircle },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<Tab>("finance");
  const [loading, setLoading] = useState(true);
  const [incomeSources, setIncomeSources] = useState<IncomeSourceData[]>([]);
  const [reserves, setReserves] = useState<ReserveData[]>([]);
  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [bills, setBills] = useState<BillData[]>([]);
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [preferences, setPreferences] = useState<UserPreferenceData>({
    entertainment: [],
    food: [],
    likes: [],
    city: "Dubai",
    companionType: "solo",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sources, res, inst, bl, ov, prefs] = await Promise.all([
      getIncomeSources(),
      getReserves(),
      getInstallments(),
      getBills(),
      getFinancialOverview(),
      getUserPreferences(),
    ]);
    setIncomeSources(sources);
    setReserves(res);
    setInstallments(inst);
    setBills(bl);
    setOverview(ov);
    setPreferences(prefs);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your financial and personal information
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[80px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[120px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your financial and personal information
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
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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

      {/* Finance tab */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {overview && <FinancialOverviewCard overview={overview} />}
          <IncomeSourcesSection sources={incomeSources} onRefresh={loadData} />
          <ReservesSection reserves={reserves} onRefresh={loadData} />
          <InstallmentsSection installments={installments} onRefresh={loadData} />
          <BillsSection bills={bills} onRefresh={loadData} />
          <MoneyAdviceSection />
        </div>
      )}

      {/* Personal tab */}
      {activeTab === "personal" && (
        <div className="space-y-6">
          <PreferencesSection preferences={preferences} onRefresh={loadData} />
        </div>
      )}
    </div>
  );
}
