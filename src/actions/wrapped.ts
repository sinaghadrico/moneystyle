"use server";

import { prisma } from "@/lib/db";
import type { WrappedData } from "@/lib/types";
import { Prisma } from "@prisma/client";

const NOT_MERGED: Prisma.TransactionWhereInput = { mergedIntoId: null };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getWrappedData(month: string): Promise<WrappedData> {
  const [year, mon] = month.split("-").map(Number);
  const startOfMonth = new Date(year, mon - 1, 1);
  const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);
  const daysInMonth = endOfMonth.getDate();

  const prevStart = new Date(year, mon - 2, 1);
  const prevEnd = new Date(year, mon - 1, 0, 23, 59, 59, 999);

  const monthLabel = startOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const baseWhere: Prisma.TransactionWhereInput = {
    ...NOT_MERGED,
    date: { gte: startOfMonth, lte: endOfMonth },
    amount: { not: null },
  };

  const [expenses, incomeAgg, prevExpenses, biggestTx, allCategories] =
    await Promise.all([
      prisma.transaction.findMany({
        where: { ...baseWhere, type: "expense" },
        select: {
          id: true,
          date: true,
          amount: true,
          merchant: true,
          categoryId: true,
          splits: {
            select: {
              amount: true,
              personId: true,
              categoryId: true,
            },
          },
        },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "income" },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: {
          ...NOT_MERGED,
          type: "expense",
          date: { gte: prevStart, lte: prevEnd },
          amount: { not: null },
        },
        select: {
          amount: true,
          splits: { select: { amount: true, personId: true } },
        },
      }),
      prisma.transaction.findFirst({
        where: { ...baseWhere, type: "expense", splits: { none: {} } },
        orderBy: { amount: "desc" },
        select: {
          merchant: true,
          amount: true,
          date: true,
          category: { select: { name: true } },
        },
      }),
      prisma.category.findMany(),
    ]);

  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  // Split-aware expense calculation
  function getMyAmount(tx: {
    amount: Prisma.Decimal | null;
    splits: { amount: Prisma.Decimal; personId: string | null }[];
  }): number {
    if (tx.splits.length > 0) {
      return tx.splits
        .filter((s) => s.personId === null)
        .reduce((sum, s) => sum + Number(s.amount), 0);
    }
    return Number(tx.amount ?? 0);
  }

  // Total spent
  const totalSpent = expenses.reduce((sum, tx) => sum + getMyAmount(tx), 0);
  const totalIncome = Number(incomeAgg._sum.amount ?? 0);

  // Previous month for comparison
  const prevTotal = prevExpenses.reduce(
    (sum, tx) => sum + getMyAmount(tx),
    0
  );
  const vsLastMonthPercent =
    prevTotal > 0
      ? Math.round(((totalSpent - prevTotal) / prevTotal) * 100)
      : null;

  // Category breakdown (split-aware)
  const catTotals = new Map<
    string | null,
    { total: number; count: number }
  >();
  for (const tx of expenses) {
    if (tx.splits.length > 0) {
      for (const s of tx.splits) {
        if (s.personId !== null) continue;
        const entry = catTotals.get(s.categoryId) ?? { total: 0, count: 0 };
        entry.total += Number(s.amount);
        entry.count += 1;
        catTotals.set(s.categoryId, entry);
      }
    } else {
      const entry = catTotals.get(tx.categoryId) ?? { total: 0, count: 0 };
      entry.total += Number(tx.amount ?? 0);
      entry.count += 1;
      catTotals.set(tx.categoryId, entry);
    }
  }

  const categoryBreakdown = Array.from(catTotals.entries())
    .map(([catId, data]) => {
      const cat = catId ? categoryMap.get(catId) : null;
      return {
        name: cat?.name ?? "Uncategorized",
        color: cat?.color ?? "#6b7280",
        amount: Math.round(data.total * 100) / 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Top category
  let topCategory: WrappedData["topCategory"] = null;
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    const catEntry = catTotals.get(
      Array.from(catTotals.entries()).find(
        ([catId]) =>
          (catId ? categoryMap.get(catId)?.name : "Uncategorized") === top.name
      )?.[0] ?? null
    );
    topCategory = {
      name: top.name,
      color: top.color,
      amount: top.amount,
      percentOfTotal: totalSpent > 0 ? Math.round((top.amount / totalSpent) * 100) : 0,
      count: catEntry?.count ?? 0,
    };
  }

  // Biggest expense
  let biggestExpense: WrappedData["biggestExpense"] = null;
  if (biggestTx) {
    biggestExpense = {
      merchant: biggestTx.merchant ?? "Unknown",
      amount: Number(biggestTx.amount),
      date: biggestTx.date.toISOString().slice(0, 10),
      category: biggestTx.category?.name ?? "Uncategorized",
    };
  }

  // Favorite merchant (most visits)
  const merchantVisits = new Map<string, { count: number; total: number }>();
  for (const tx of expenses) {
    const name = tx.merchant ?? "Unknown";
    const entry = merchantVisits.get(name) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += getMyAmount(tx);
    merchantVisits.set(name, entry);
  }

  let favoriteMerchant: WrappedData["favoriteMerchant"] = null;
  if (merchantVisits.size > 0) {
    const [merchant, data] = Array.from(merchantVisits.entries()).sort(
      (a, b) => b[1].count - a[1].count
    )[0];
    favoriteMerchant = {
      merchant,
      visitCount: data.count,
      totalSpent: Math.round(data.total * 100) / 100,
    };
  }

  // Day-of-week spending pattern
  const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  for (const tx of expenses) {
    const dow = tx.date.getDay();
    dayTotals[dow] += getMyAmount(tx);
  }

  const maxDay = dayTotals.indexOf(Math.max(...dayTotals));
  const minDay = dayTotals.indexOf(Math.min(...dayTotals));

  // No-spend days & streak
  const spendDays = new Set<number>();
  for (const tx of expenses) {
    if (getMyAmount(tx) > 0) {
      spendDays.add(tx.date.getDate());
    }
  }

  const noSpendDays = daysInMonth - spendDays.size;
  let longestNoSpendStreak = 0;
  let currentStreak = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (!spendDays.has(d)) {
      currentStreak++;
      longestNoSpendStreak = Math.max(longestNoSpendStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const avgDailySpend =
    daysInMonth > 0
      ? Math.round((totalSpent / daysInMonth) * 100) / 100
      : 0;

  return {
    month,
    monthLabel,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    netBalance: Math.round((totalIncome - totalSpent) * 100) / 100,
    transactionCount: expenses.length,
    vsLastMonthPercent,
    topCategory,
    biggestExpense,
    favoriteMerchant,
    spendingPattern: {
      busiestDay: DAY_NAMES[maxDay],
      lightestDay: DAY_NAMES[minDay],
      dailyAmounts: dayTotals.map((v) => Math.round(v * 100) / 100),
    },
    funFacts: {
      noSpendDays,
      totalDaysInMonth: daysInMonth,
      avgDailySpend,
      longestNoSpendStreak,
    },
    categoryBreakdown,
  };
}
