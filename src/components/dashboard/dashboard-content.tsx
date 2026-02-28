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
} from "@/actions/dashboard";
import { getAccountsList } from "@/actions/transactions";
import type {
  DashboardStats,
  MonthlyData,
  CategoryBreakdown,
  MerchantTotal,
  MonthlyCategoryData,
  CategoryMeta,
  PeriodFilter,
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

export function DashboardContent() {
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [merchants, setMerchants] = useState<MerchantTotal[]>([]);
  const [monthlyCat, setMonthlyCat] = useState<MonthlyCategoryData[]>([]);
  const [catMeta, setCatMeta] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountsList().then(setAccounts);
  }, []);

  const loadData = useCallback(async (p: PeriodFilter, accId: string) => {
    setLoading(true);
    const aid = accId || undefined;
    const [s, m, c, t, mc] = await Promise.all([
      getDashboardStats(p, aid),
      getMonthlyData(p, aid),
      getCategoryBreakdown(p, aid),
      getTopMerchants(p, 10, aid),
      getMonthlyCategoryBreakdown(p, aid),
    ]);
    setStats(s);
    setMonthly(m);
    setCategories(c);
    setMerchants(t);
    setMonthlyCat(mc.data);
    setCatMeta(mc.categories);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(period, accountId);
  }, [period, accountId, loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <Select
              value={accountId || "all"}
              onValueChange={(v) => setAccountId(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[170px]">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <MonthlyCategoryChart data={monthlyCat} categories={catMeta} />
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
