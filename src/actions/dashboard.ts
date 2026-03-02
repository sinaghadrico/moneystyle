"use server";

import { prisma } from "@/lib/db";
import type {
  DashboardStats,
  MonthlyData,
  CategoryBreakdown,
  MerchantTotal,
  MonthlyCategoryData,
  CategoryMeta,
  ExpensePrediction,
  DailySpend,
} from "@/lib/types";
import { getDateRange } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";

const NOT_MERGED: Prisma.TransactionWhereInput = { mergedIntoId: null };

async function getPrimaryCurrency(): Promise<string> {
  const settings = await prisma.appSettings.findFirst();
  return settings?.currency ?? "AED";
}

function getDateFilter(period: string, accountId?: string): Prisma.TransactionWhereInput {
  const fromDate = getDateRange(period);
  const where: Prisma.TransactionWhereInput = { ...NOT_MERGED };
  if (fromDate) where.date = { gte: fromDate };
  if (accountId) where.accountId = accountId;
  return where;
}

/**
 * Split-aware expense calculation helper with multi-currency conversion.
 * Returns total expense converted to the target currency.
 */
async function getMyExpense(
  baseWhere: Prisma.TransactionWhereInput,
  targetCurrency: string,
  rates: Map<string, number>
): Promise<number> {
  const expenseWhere = { ...baseWhere, type: "expense" as const, amount: { not: null } };

  const transactions = await prisma.transaction.findMany({
    where: expenseWhere,
    select: {
      amount: true,
      currency: true,
      splits: { select: { amount: true, personId: true } },
    },
  });

  let total = 0;
  for (const t of transactions) {
    if (t.splits.length > 0) {
      for (const s of t.splits) {
        if (s.personId === null) {
          total += convertAmount(Number(s.amount), t.currency, targetCurrency, rates);
        }
      }
    } else {
      total += convertAmount(Number(t.amount), t.currency, targetCurrency, rates);
    }
  }

  return total;
}

export async function getDashboardStats(
  period: string = "all",
  accountId?: string
): Promise<DashboardStats> {
  const where = getDateFilter(period, accountId);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const [incomeRows, myExpense, count] = await Promise.all([
    prisma.transaction.findMany({
      where: { ...where, type: "income", amount: { not: null } },
      select: { amount: true, currency: true },
    }),
    getMyExpense(where, primaryCurrency, rates),
    prisma.transaction.count({ where }),
  ]);

  let totalIncome = 0;
  for (const row of incomeRows) {
    totalIncome += convertAmount(Number(row.amount), row.currency, primaryCurrency, rates);
  }

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(myExpense * 100) / 100,
    balance: Math.round((totalIncome - myExpense) * 100) / 100,
    transactionCount: count,
  };
}

export async function getMonthlyData(
  period: string = "all",
  accountId?: string
): Promise<MonthlyData[]> {
  const where = getDateFilter(period, accountId);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...where, amount: { not: null } },
    select: {
      date: true,
      amount: true,
      currency: true,
      type: true,
      splits: { select: { amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const month = t.date.toISOString().slice(0, 7);
    const current = monthMap.get(month) || { income: 0, expense: 0 };

    if (t.type === "income") {
      current.income += convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
    } else if (t.type === "expense") {
      if (t.splits.length > 0) {
        for (const s of t.splits) {
          if (s.personId === null) {
            current.expense += convertAmount(Number(s.amount), t.currency, primaryCurrency, rates);
          }
        }
      } else {
        current.expense += convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
      }
    }

    monthMap.set(month, current);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
    }));
}

export async function getCategoryBreakdown(
  period: string = "all",
  accountId?: string
): Promise<CategoryBreakdown[]> {
  const where = getDateFilter(period, accountId);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...where, type: "expense", amount: { not: null } },
    select: {
      categoryId: true,
      amount: true,
      currency: true,
      splits: { select: { categoryId: true, amount: true, personId: true } },
    },
  });

  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const catTotals = new Map<string | null, { total: number; count: number }>();

  for (const tx of transactions) {
    if (tx.splits.length > 0) {
      for (const s of tx.splits) {
        if (s.personId !== null) continue;
        const key = s.categoryId;
        const entry = catTotals.get(key) ?? { total: 0, count: 0 };
        entry.total += convertAmount(Number(s.amount), tx.currency, primaryCurrency, rates);
        entry.count += 1;
        catTotals.set(key, entry);
      }
    } else {
      const key = tx.categoryId;
      const entry = catTotals.get(key) ?? { total: 0, count: 0 };
      entry.total += convertAmount(Number(tx.amount ?? 0), tx.currency, primaryCurrency, rates);
      entry.count += 1;
      catTotals.set(key, entry);
    }
  }

  return Array.from(catTotals.entries())
    .map(([catId, data]) => {
      const cat = catId ? categoryMap.get(catId) : null;
      return {
        name: cat?.name ?? "Uncategorized",
        color: cat?.color ?? "#6b7280",
        total: Math.round(data.total * 100) / 100,
        count: data.count,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export async function getTopMerchants(
  period: string = "all",
  limit: number = 10,
  accountId?: string
): Promise<MerchantTotal[]> {
  const where = getDateFilter(period, accountId);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: {
      ...where,
      type: "expense",
      amount: { not: null },
      merchant: { not: null },
    },
    select: { merchant: true, amount: true, currency: true },
  });

  const merchantMap = new Map<string, { total: number; count: number }>();
  for (const t of transactions) {
    const key = t.merchant ?? "Unknown";
    const entry = merchantMap.get(key) ?? { total: 0, count: 0 };
    entry.total += convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
    entry.count += 1;
    merchantMap.set(key, entry);
  }

  return Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export async function getMonthlyCategoryBreakdown(
  period: string = "all",
  accountId?: string
): Promise<{ data: MonthlyCategoryData[]; categories: CategoryMeta[] }> {
  const where = getDateFilter(period, accountId);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...where, type: "expense", amount: { not: null } },
    select: {
      date: true,
      amount: true,
      currency: true,
      categoryId: true,
      splits: { select: { categoryId: true, amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const categories = await prisma.category.findMany();
  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  const monthCatMap = new Map<string, Map<string, number>>();
  const allCatNames = new Set<string>();

  for (const t of transactions) {
    const month = t.date.toISOString().slice(0, 7);

    if (t.splits.length > 0) {
      for (const s of t.splits) {
        if (s.personId !== null) continue;
        const cat = s.categoryId ? categoryLookup.get(s.categoryId) : null;
        const catName = cat?.name ?? "Uncategorized";
        allCatNames.add(catName);
        if (!monthCatMap.has(month)) monthCatMap.set(month, new Map());
        const catTotals = monthCatMap.get(month)!;
        catTotals.set(catName, (catTotals.get(catName) ?? 0) + convertAmount(Number(s.amount), t.currency, primaryCurrency, rates));
      }
    } else {
      const cat = t.categoryId ? categoryLookup.get(t.categoryId) : null;
      const catName = cat?.name ?? "Uncategorized";
      allCatNames.add(catName);
      if (!monthCatMap.has(month)) monthCatMap.set(month, new Map());
      const catTotals = monthCatMap.get(month)!;
      catTotals.set(catName, (catTotals.get(catName) ?? 0) + convertAmount(Number(t.amount), t.currency, primaryCurrency, rates));
    }
  }

  const data: MonthlyCategoryData[] = Array.from(monthCatMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, catTotals]) => {
      const row: MonthlyCategoryData = { month };
      for (const name of allCatNames) {
        row[name] = Math.round((catTotals.get(name) ?? 0) * 100) / 100;
      }
      return row;
    });

  const catTotalMap = new Map<string, number>();
  for (const [, catTotals] of monthCatMap) {
    for (const [name, total] of catTotals) {
      catTotalMap.set(name, (catTotalMap.get(name) ?? 0) + total);
    }
  }

  const catMeta: CategoryMeta[] = Array.from(allCatNames)
    .map((name) => {
      const cat = categories.find((c) => c.name === name);
      return { name, color: cat?.color ?? "#6b7280" };
    })
    .sort((a, b) => (catTotalMap.get(b.name) ?? 0) - (catTotalMap.get(a.name) ?? 0));

  return { data, categories: catMeta };
}

export async function getExpensePrediction(): Promise<ExpensePrediction> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const dateWhere: Prisma.TransactionWhereInput = {
    type: "expense",
    date: { gte: startOfMonth, lte: endOfMonth },
    mergedIntoId: null,
    amount: { not: null },
  };

  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);
  const spent = await getMyExpense(dateWhere, primaryCurrency, rates);
  const daysInMonth = endOfMonth.getDate();
  const daysElapsed = Math.max(now.getDate(), 1);
  const dailyAverage = spent / daysElapsed;
  const predicted = Math.round(dailyAverage * daysInMonth * 100) / 100;

  return { spent, predicted, daysElapsed, daysInMonth, dailyAverage };
}

export async function getDailySpendData(): Promise<DailySpend[]> {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: {
      ...NOT_MERGED,
      type: "expense",
      amount: { not: null },
      date: { gte: threeMonthsAgo },
    },
    select: {
      date: true,
      amount: true,
      currency: true,
      splits: { select: { amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const dayMap = new Map<string, number>();

  for (const t of transactions) {
    const day = t.date.toISOString().slice(0, 10);
    const current = dayMap.get(day) ?? 0;

    if (t.splits.length > 0) {
      for (const s of t.splits) {
        if (s.personId === null) {
          dayMap.set(day, current + convertAmount(Number(s.amount), t.currency, primaryCurrency, rates));
        }
      }
    } else {
      dayMap.set(day, current + convertAmount(Number(t.amount), t.currency, primaryCurrency, rates));
    }
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));
}
