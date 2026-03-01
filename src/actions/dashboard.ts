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
} from "@/lib/types";
import { getDateRange } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const NOT_MERGED: Prisma.TransactionWhereInput = { mergedIntoId: null };

function getDateFilter(period: string, accountId?: string): Prisma.TransactionWhereInput {
  const fromDate = getDateRange(period);
  const where: Prisma.TransactionWhereInput = { ...NOT_MERGED };
  if (fromDate) where.date = { gte: fromDate };
  if (accountId) where.accountId = accountId;
  return where;
}

/**
 * Split-aware expense calculation helper.
 * Returns total expense = unsplit txs amount + my splits (personId IS NULL) from split txs.
 */
async function getMyExpense(baseWhere: Prisma.TransactionWhereInput): Promise<number> {
  const expenseWhere = { ...baseWhere, type: "expense" as const, amount: { not: null } };

  const [unsplitAgg, mySplitsAgg] = await Promise.all([
    // Unsplit transactions: full amount counts
    prisma.transaction.aggregate({
      where: { ...expenseWhere, splits: { none: {} } },
      _sum: { amount: true },
    }),
    // Split transactions: only my splits (personId IS NULL)
    prisma.transactionSplit.aggregate({
      where: {
        personId: null,
        transaction: { ...expenseWhere, splits: { some: {} } },
      },
      _sum: { amount: true },
    }),
  ]);

  return Number(unsplitAgg._sum.amount ?? 0) + Number(mySplitsAgg._sum.amount ?? 0);
}

export async function getDashboardStats(
  period: string = "all",
  accountId?: string
): Promise<DashboardStats> {
  const where = getDateFilter(period, accountId);

  const [income, myExpense, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: "income", amount: { not: null } },
      _sum: { amount: true },
    }),
    getMyExpense(where),
    prisma.transaction.count({ where }),
  ]);

  const totalIncome = Number(income._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense: myExpense,
    balance: totalIncome - myExpense,
    transactionCount: count,
  };
}

export async function getMonthlyData(
  period: string = "all",
  accountId?: string
): Promise<MonthlyData[]> {
  const where = getDateFilter(period, accountId);

  // Fetch all transactions with splits to calculate per-month split-aware totals
  const transactions = await prisma.transaction.findMany({
    where: { ...where, amount: { not: null } },
    select: {
      date: true,
      amount: true,
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
      current.income += Number(t.amount);
    } else if (t.type === "expense") {
      if (t.splits.length > 0) {
        // Only count my splits (personId IS NULL)
        for (const s of t.splits) {
          if (s.personId === null) {
            current.expense += Number(s.amount);
          }
        }
      } else {
        current.expense += Number(t.amount);
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

  const transactions = await prisma.transaction.findMany({
    where: { ...where, type: "expense", amount: { not: null } },
    select: {
      categoryId: true,
      amount: true,
      splits: { select: { categoryId: true, amount: true, personId: true } },
    },
  });

  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const catTotals = new Map<string | null, { total: number; count: number }>();

  for (const tx of transactions) {
    if (tx.splits.length > 0) {
      // Only count my splits (personId IS NULL)
      for (const s of tx.splits) {
        if (s.personId !== null) continue;
        const key = s.categoryId;
        const entry = catTotals.get(key) ?? { total: 0, count: 0 };
        entry.total += Number(s.amount);
        entry.count += 1;
        catTotals.set(key, entry);
      }
    } else {
      const key = tx.categoryId;
      const entry = catTotals.get(key) ?? { total: 0, count: 0 };
      entry.total += Number(tx.amount ?? 0);
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

  const results = await prisma.transaction.groupBy({
    by: ["merchant"],
    where: {
      ...where,
      type: "expense",
      amount: { not: null },
      merchant: { not: null },
    },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  return results.map((r) => ({
    merchant: r.merchant ?? "Unknown",
    total: Math.round(Number(r._sum.amount ?? 0) * 100) / 100,
    count: r._count,
  }));
}

export async function getMonthlyCategoryBreakdown(
  period: string = "all",
  accountId?: string
): Promise<{ data: MonthlyCategoryData[]; categories: CategoryMeta[] }> {
  const where = getDateFilter(period, accountId);

  const transactions = await prisma.transaction.findMany({
    where: { ...where, type: "expense", amount: { not: null } },
    select: {
      date: true,
      amount: true,
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
      // Only my splits
      for (const s of t.splits) {
        if (s.personId !== null) continue;
        const cat = s.categoryId ? categoryLookup.get(s.categoryId) : null;
        const catName = cat?.name ?? "Uncategorized";
        allCatNames.add(catName);
        if (!monthCatMap.has(month)) monthCatMap.set(month, new Map());
        const catTotals = monthCatMap.get(month)!;
        catTotals.set(catName, (catTotals.get(catName) ?? 0) + Number(s.amount));
      }
    } else {
      const cat = t.categoryId ? categoryLookup.get(t.categoryId) : null;
      const catName = cat?.name ?? "Uncategorized";
      allCatNames.add(catName);
      if (!monthCatMap.has(month)) monthCatMap.set(month, new Map());
      const catTotals = monthCatMap.get(month)!;
      catTotals.set(catName, (catTotals.get(catName) ?? 0) + Number(t.amount));
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

  const spent = await getMyExpense(dateWhere);
  const daysInMonth = endOfMonth.getDate();
  const daysElapsed = Math.max(now.getDate(), 1);
  const dailyAverage = spent / daysElapsed;
  const predicted = Math.round(dailyAverage * daysInMonth * 100) / 100;

  return { spent, predicted, daysElapsed, daysInMonth, dailyAverage };
}
