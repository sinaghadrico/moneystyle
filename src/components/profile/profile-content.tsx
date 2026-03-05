"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialOverviewCard } from "./financial-overview-card";
import { IncomeSourcesSection } from "./income-sources-section";
import { ReservesSection } from "./reserves-section";
import { InstallmentsSection } from "./installments-section";
import { BillsSection } from "./bills-section";
import { PreferencesSection } from "./preferences-section";
import {
  getIncomeSources,
  getReserves,
  getInstallments,
  getBills,
  getFinancialOverview,
} from "@/actions/profile";
import { getUserPreferences } from "@/actions/weekend-planner";
import {
  Wallet,
  UserCircle,
  BarChart3,
  TrendingUp,
  CreditCard,
  LogOut,
} from "lucide-react";
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

const FINANCE_SECTIONS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "income", label: "Income & Savings", icon: TrendingUp },
  { key: "payments", label: "Payments", icon: CreditCard },
] as const;

type FinanceSection = (typeof FINANCE_SECTIONS)[number]["key"];

export function ProfileContent() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("finance");
  const [financeSection, setFinanceSection] =
    useState<FinanceSection>("overview");
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
          <h2 className="text-2xl font-bold tracking-tight">👤 Profile</h2>
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
      {/* User info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="text-lg">
              {session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{session?.user?.name ?? "Profile"}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
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
        <div className="space-y-5">
          {/* Finance sub-navigation */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {FINANCE_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = financeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setFinanceSection(section.key)}
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

          {/* Overview */}
          {financeSection === "overview" && overview && (
            <FinancialOverviewCard overview={overview} />
          )}

          {/* Income & Savings */}
          {financeSection === "income" && (
            <div className="space-y-6">
              <IncomeSourcesSection
                sources={incomeSources}
                onRefresh={loadData}
              />
              <ReservesSection reserves={reserves} onRefresh={loadData} />
            </div>
          )}

          {/* Payments */}
          {financeSection === "payments" && (
            <div className="space-y-6">
              <InstallmentsSection
                installments={installments}
                onRefresh={loadData}
              />
              <BillsSection bills={bills} onRefresh={loadData} />
            </div>
          )}
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
