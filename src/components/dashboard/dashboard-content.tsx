"use client";

import { useState, useEffect, useCallback } from "react";
import { StatsCards } from "./stats-cards";
import {
  MonthlyBarChart,
  CategoryDonut,
  TopMerchantsChart,
  MonthlyTrendChart,
  MonthlyCategoryChart,
} from "./charts";
import { PeriodFilterSelect } from "./period-filter";
import {
  getDashboardStats,
  getMonthlyData,
  getCategoryBreakdown,
  getTopMerchants,
  getMonthlyCategoryBreakdown,
  getExpensePrediction,
  getDailySpendData,
} from "@/actions/dashboard";
import { getAccountsList } from "@/actions/transactions";
import { getBudgetProgress, type BudgetProgress } from "@/actions/budgets";
import { getSavingsProgress } from "@/actions/savings";
import { getDebtSummary } from "@/actions/persons";
import { BudgetProgressCard } from "./budget-progress";
import { PredictionCard } from "./prediction-card";
import { SavingsCard } from "./savings-card";
import { DebtsCard } from "./debts-card";
import { SpendingHeatmap } from "./spending-heatmap";
import type {
  DashboardStats,
  MonthlyData,
  CategoryBreakdown,
  MerchantTotal,
  MonthlyCategoryData,
  CategoryMeta,
  PeriodFilter,
  ExpensePrediction,
  SavingsProgress,
  DebtSummary,
  DailySpend,
} from "@/lib/types";
import type { Account } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSettings } from "@/components/settings/settings-provider";

export function DashboardContent() {
  const { settings } = useAppSettings();
  const [period, setPeriod] = useState<PeriodFilter>(settings.defaultDashboardPeriod as PeriodFilter);
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [merchants, setMerchants] = useState<MerchantTotal[]>([]);
  const [monthlyCat, setMonthlyCat] = useState<MonthlyCategoryData[]>([]);
  const [catMeta, setCatMeta] = useState<CategoryMeta[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [savings, setSavings] = useState<SavingsProgress[]>([]);
  const [debts, setDebts] = useState<DebtSummary[]>([]);
  const [prediction, setPrediction] = useState<ExpensePrediction | null>(null);
  const [dailySpend, setDailySpend] = useState<DailySpend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountsList().then(setAccounts);
  }, []);

  const loadData = useCallback(async (p: PeriodFilter, accId: string) => {
    setLoading(true);
    const aid = accId || undefined;
    const [s, m, c, t, mc, bp, sp, pred, d, ds] = await Promise.all([
      getDashboardStats(p, aid),
      getMonthlyData(p, aid),
      getCategoryBreakdown(p, aid),
      getTopMerchants(p, 10, aid),
      getMonthlyCategoryBreakdown(p, aid),
      getBudgetProgress(),
      getSavingsProgress(),
      getExpensePrediction(),
      getDebtSummary(),
      getDailySpendData(),
    ]);
    setStats(s);
    setMonthly(m);
    setCategories(c);
    setMerchants(t);
    setMonthlyCat(mc.data);
    setCatMeta(mc.categories);
    setBudgets(bp);
    setSavings(sp);
    setPrediction(pred);
    setDebts(d);
    setDailySpend(ds);
    setLoading(false);
  }, []);

  // Sync period with settings when they load from DB
  useEffect(() => {
    const p = settings.defaultDashboardPeriod as PeriodFilter;
    if (p && p !== period) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPeriod(p);
    }
  // Only run when settings change, not when period changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.defaultDashboardPeriod]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(period, accountId);
  }, [period, accountId, loadData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">📊 Dashboard</h2>
          <p className="text-muted-foreground">Financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <Select
              value={accountId || "all"}
              onValueChange={(v) => setAccountId(v === "all" ? "" : v)}
            >
              <SelectTrigger className="flex-1 sm:w-[140px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <PeriodFilterSelect value={period} onChange={setPeriod} />
        </div>
      </div>

      {loading || !stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[370px] rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {prediction && <PredictionCard prediction={prediction} />}
            {budgets.length > 0 && <BudgetProgressCard data={budgets} />}
            <SavingsCard data={savings} onRefresh={() => loadData(period, accountId)} />
            <DebtsCard data={debts} />
          </div>
          <MonthlyCategoryChart data={monthlyCat} categories={catMeta} />
          <SpendingHeatmap data={dailySpend} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MonthlyBarChart data={monthly} />
            <CategoryDonut data={categories} />
            <TopMerchantsChart data={merchants} />
            <MonthlyTrendChart data={monthly} />
          </div>
        </>
      )}

    </div>
  );
}
