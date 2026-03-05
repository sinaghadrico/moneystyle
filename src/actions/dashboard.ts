"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
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
import { getSpreadEntries, getSpreadFraction } from "@/lib/spread-utils";

const NOT_MERGED: Prisma.TransactionWhereInput = { mergedIntoId: null };

async function getPrimaryCurrency(): Promise<string> {
  const settings = await prisma.appSettings.findFirst();
  return settings?.currency ?? "AED";
}

function getDateFilter(period: string, userId: string, accountId?: string): Prisma.TransactionWhereInput {
  const fromDate = getDateRange(period);
  const where: Prisma.TransactionWhereInput = { ...NOT_MERGED, userId };
  if (fromDate) where.date = { gte: fromDate };
  if (accountId) where.accountId = accountId;
  return where;
}

/** Extend a date filter's gte by 12 months to catch spread transactions from earlier months. */
function extendForSpread(dateFilter: { gte?: Date; lte?: Date }): { gte?: Date; lte?: Date } {
  if (!dateFilter?.gte) return dateFilter;
  const lookback = new Date(dateFilter.gte);
  lookback.setMonth(lookback.getMonth() - 12);
  return { ...dateFilter, gte: lookback };
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
  // Extend date range to catch spread transactions from earlier months
  const extendedWhere = { ...baseWhere };
  if (extendedWhere.date && typeof extendedWhere.date === "object") {
    extendedWhere.date = extendForSpread(extendedWhere.date as { gte?: Date; lte?: Date });
  }
  const expenseWhere = { ...extendedWhere, type: "expense" as const, amount: { not: null } };

  const transactions = await prisma.transaction.findMany({
    where: expenseWhere,
    select: {
      date: true,
      amount: true,
      currency: true,
      spreadMonths: true,
      splits: { select: { amount: true, personId: true } },
    },
  });

  // Determine the target period from the original (non-extended) filter
  const origDate = baseWhere.date as { gte?: Date; lte?: Date } | undefined;
  const periodStart = origDate?.gte;
  const periodEnd = origDate?.lte;

  let total = 0;
  for (const t of transactions) {
    const sm = t.spreadMonths;
    let amount: number;

    if (t.splits.length > 0) {
      amount = 0;
      for (const s of t.splits) {
        if (s.personId === null) {
          amount += convertAmount(Number(s.amount), t.currency, targetCurrency, rates);
        }
      }
    } else {
      amount = convertAmount(Number(t.amount), t.currency, targetCurrency, rates);
    }

    if (sm && sm > 1) {
      // Spread: only count fractions whose months fall within the original period
      const entries = getSpreadEntries(t.date, sm);
      for (const entry of entries) {
        const entryDate = new Date(entry.month + "-15");
        if (periodStart && entryDate < periodStart) continue;
        if (periodEnd && entryDate > periodEnd) continue;
        total += amount * entry.fraction;
      }
    } else {
      total += amount;
    }
  }

  return total;
}

export async function getDashboardStats(
  period: string = "all",
  accountId?: string
): Promise<DashboardStats> {
  const userId = await requireAuth();
  const where = getDateFilter(period, userId, accountId);
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
  const userId = await requireAuth();
  const where = getDateFilter(period, userId, accountId);
  // Extend date range for spread transactions
  const extendedWhere = { ...where };
  if (extendedWhere.date && typeof extendedWhere.date === "object") {
    extendedWhere.date = extendForSpread(extendedWhere.date as { gte?: Date; lte?: Date });
  }
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...extendedWhere, amount: { not: null } },
    select: {
      date: true,
      amount: true,
      currency: true,
      type: true,
      spreadMonths: true,
      splits: { select: { amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    let amount: number;

    if (t.type === "income") {
      amount = convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
      // Spread income across months too
      const entries = getSpreadEntries(t.date, t.spreadMonths);
      for (const entry of entries) {
        const current = monthMap.get(entry.month) || { income: 0, expense: 0 };
        current.income += amount * entry.fraction;
        monthMap.set(entry.month, current);
      }
    } else if (t.type === "expense") {
      if (t.splits.length > 0) {
        amount = 0;
        for (const s of t.splits) {
          if (s.personId === null) {
            amount += convertAmount(Number(s.amount), t.currency, primaryCurrency, rates);
          }
        }
      } else {
        amount = convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
      }

      const entries = getSpreadEntries(t.date, t.spreadMonths);
      for (const entry of entries) {
        const current = monthMap.get(entry.month) || { income: 0, expense: 0 };
        current.expense += amount * entry.fraction;
        monthMap.set(entry.month, current);
      }
    }
  }

  // Filter to only include months within the original period
  const origDate = where.date as { gte?: Date } | undefined;
  const periodStart = origDate?.gte;

  return Array.from(monthMap.entries())
    .filter(([month]) => {
      if (!periodStart) return true;
      return month >= `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}`;
    })
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
  const userId = await requireAuth();
  const where = getDateFilter(period, userId, accountId);
  const extendedWhere = { ...where };
  if (extendedWhere.date && typeof extendedWhere.date === "object") {
    extendedWhere.date = extendForSpread(extendedWhere.date as { gte?: Date; lte?: Date });
  }
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...extendedWhere, type: "expense", amount: { not: null } },
    select: {
      date: true,
      categoryId: true,
      amount: true,
      currency: true,
      spreadMonths: true,
      splits: { select: { categoryId: true, amount: true, personId: true } },
    },
  });

  const allCategories = await prisma.category.findMany({ where: { userId } });
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const origDate = where.date as { gte?: Date; lte?: Date } | undefined;
  const periodStart = origDate?.gte;
  const periodEnd = origDate?.lte;

  const catTotals = new Map<string | null, { total: number; count: number }>();

  for (const tx of transactions) {
    const sm = tx.spreadMonths;

    // Calculate the fraction of this transaction that falls within the target period
    let periodFraction = 1;
    if (sm && sm > 1) {
      const entries = getSpreadEntries(tx.date, sm);
      periodFraction = 0;
      for (const entry of entries) {
        const entryDate = new Date(entry.month + "-15");
        if (periodStart && entryDate < periodStart) continue;
        if (periodEnd && entryDate > periodEnd) continue;
        periodFraction += entry.fraction;
      }
      if (periodFraction === 0) continue;
    }

    if (tx.splits.length > 0) {
      for (const s of tx.splits) {
        if (s.personId !== null) continue;
        const key = s.categoryId;
        const entry = catTotals.get(key) ?? { total: 0, count: 0 };
        entry.total += convertAmount(Number(s.amount), tx.currency, primaryCurrency, rates) * periodFraction;
        entry.count += 1;
        catTotals.set(key, entry);
      }
    } else {
      const key = tx.categoryId;
      const entry = catTotals.get(key) ?? { total: 0, count: 0 };
      entry.total += convertAmount(Number(tx.amount ?? 0), tx.currency, primaryCurrency, rates) * periodFraction;
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
  const userId = await requireAuth();
  const where = getDateFilter(period, userId, accountId);
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
  const userId = await requireAuth();
  const where = getDateFilter(period, userId, accountId);
  const extendedWhere = { ...where };
  if (extendedWhere.date && typeof extendedWhere.date === "object") {
    extendedWhere.date = extendForSpread(extendedWhere.date as { gte?: Date; lte?: Date });
  }
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: { ...extendedWhere, type: "expense", amount: { not: null } },
    select: {
      date: true,
      amount: true,
      currency: true,
      categoryId: true,
      spreadMonths: true,
      splits: { select: { categoryId: true, amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const categories = await prisma.category.findMany({ where: { userId } });
  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  const origDate = where.date as { gte?: Date } | undefined;
  const periodStart = origDate?.gte;

  const monthCatMap = new Map<string, Map<string, number>>();
  const allCatNames = new Set<string>();

  function addToMonth(month: string, catName: string, amount: number) {
    allCatNames.add(catName);
    if (!monthCatMap.has(month)) monthCatMap.set(month, new Map());
    const catTotals = monthCatMap.get(month)!;
    catTotals.set(catName, (catTotals.get(catName) ?? 0) + amount);
  }

  for (const t of transactions) {
    const entries = getSpreadEntries(t.date, t.spreadMonths);

    if (t.splits.length > 0) {
      for (const s of t.splits) {
        if (s.personId !== null) continue;
        const cat = s.categoryId ? categoryLookup.get(s.categoryId) : null;
        const catName = cat?.name ?? "Uncategorized";
        const converted = convertAmount(Number(s.amount), t.currency, primaryCurrency, rates);
        for (const entry of entries) {
          addToMonth(entry.month, catName, converted * entry.fraction);
        }
      }
    } else {
      const cat = t.categoryId ? categoryLookup.get(t.categoryId) : null;
      const catName = cat?.name ?? "Uncategorized";
      const converted = convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
      for (const entry of entries) {
        addToMonth(entry.month, catName, converted * entry.fraction);
      }
    }
  }

  const data: MonthlyCategoryData[] = Array.from(monthCatMap.entries())
    .filter(([month]) => {
      if (!periodStart) return true;
      return month >= `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}`;
    })
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
  const userId = await requireAuth();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const dateWhere: Prisma.TransactionWhereInput = {
    userId,
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
  const userId = await requireAuth();

  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(),
    getCurrencyRates(),
  ]);

  const transactions = await prisma.transaction.findMany({
    where: {
      ...NOT_MERGED,
      userId,
      type: "expense",
      amount: { not: null },
      date: { gte: threeMonthsAgo },
    },
    select: {
      date: true,
      amount: true,
      currency: true,
      spreadMonths: true,
      splits: { select: { amount: true, personId: true } },
    },
    orderBy: { date: "asc" },
  });

  const dayMap = new Map<string, number>();

  for (const t of transactions) {
    const day = t.date.toISOString().slice(0, 10);
    const current = dayMap.get(day) ?? 0;
    // For spread transactions, divide the daily amount by spreadMonths
    const divisor = t.spreadMonths && t.spreadMonths > 1 ? t.spreadMonths : 1;

    if (t.splits.length > 0) {
      let splitTotal = current;
      for (const s of t.splits) {
        if (s.personId === null) {
          splitTotal += convertAmount(Number(s.amount), t.currency, primaryCurrency, rates) / divisor;
        }
      }
      dayMap.set(day, splitTotal);
    } else {
      dayMap.set(day, current + convertAmount(Number(t.amount), t.currency, primaryCurrency, rates) / divisor);
    }
  }

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));
}
