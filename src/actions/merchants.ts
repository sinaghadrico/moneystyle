"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export type MerchantProfile = {
  merchant: string;
  totalSpent: number;
  transactionCount: number;
  avgTransaction: number;
  firstVisit: string;
  lastVisit: string;
  topCategory: string;
  monthlyTrend: { month: string; amount: number }[];
  visitFrequency: string;
};

export async function getMerchantProfiles(): Promise<MerchantProfile[]> {
  const userId = await requireAuth();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      mergedIntoId: null,
      confirmed: true,
      type: "expense",
      merchant: { not: null },
      amount: { not: null },
    },
    select: {
      merchant: true,
      amount: true,
      date: true,
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  const merchantMap = new Map<
    string,
    {
      totalSpent: number;
      count: number;
      dates: Date[];
      categories: Map<string, number>;
      monthlyAmounts: Map<string, number>;
    }
  >();

  for (const tx of transactions) {
    const name = tx.merchant!;
    if (!merchantMap.has(name)) {
      merchantMap.set(name, {
        totalSpent: 0,
        count: 0,
        dates: [],
        categories: new Map(),
        monthlyAmounts: new Map(),
      });
    }
    const entry = merchantMap.get(name)!;
    const amt = Number(tx.amount);
    entry.totalSpent += amt;
    entry.count += 1;
    entry.dates.push(tx.date);

    const catName = tx.category?.name ?? "Uncategorized";
    entry.categories.set(catName, (entry.categories.get(catName) ?? 0) + amt);

    const monthKey = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    entry.monthlyAmounts.set(monthKey, (entry.monthlyAmounts.get(monthKey) ?? 0) + amt);
  }

  // Get last 6 month keys
  const now = new Date();
  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const profiles: MerchantProfile[] = [];

  for (const [merchant, data] of merchantMap) {
    const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
    const firstVisit = sortedDates[0];
    const lastVisit = sortedDates[sortedDates.length - 1];

    // Calculate visit frequency
    let visitFrequency = "Occasional";
    if (data.count > 1) {
      const daySpan = (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24);
      const avgDaysBetween = daySpan / (data.count - 1);
      if (avgDaysBetween <= 10) visitFrequency = "Weekly";
      else if (avgDaysBetween <= 35) visitFrequency = "Monthly";
    }

    // Top category
    let topCategory = "Uncategorized";
    let topCatAmount = 0;
    for (const [cat, amt] of data.categories) {
      if (amt > topCatAmount) {
        topCategory = cat;
        topCatAmount = amt;
      }
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = last6Months.map((month) => ({
      month,
      amount: Math.round((data.monthlyAmounts.get(month) ?? 0) * 100) / 100,
    }));

    profiles.push({
      merchant,
      totalSpent: Math.round(data.totalSpent * 100) / 100,
      transactionCount: data.count,
      avgTransaction: Math.round((data.totalSpent / data.count) * 100) / 100,
      firstVisit: firstVisit.toISOString(),
      lastVisit: lastVisit.toISOString(),
      topCategory,
      monthlyTrend,
      visitFrequency,
    });
  }

  return profiles.sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getMerchantProfile(
  merchant: string,
): Promise<MerchantProfile | null> {
  const userId = await requireAuth();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      mergedIntoId: null,
      confirmed: true,
      type: "expense",
      merchant,
      amount: { not: null },
    },
    select: {
      amount: true,
      date: true,
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  if (transactions.length === 0) return null;

  let totalSpent = 0;
  const dates: Date[] = [];
  const categories = new Map<string, number>();
  const monthlyAmounts = new Map<string, number>();

  for (const tx of transactions) {
    const amt = Number(tx.amount);
    totalSpent += amt;
    dates.push(tx.date);

    const catName = tx.category?.name ?? "Uncategorized";
    categories.set(catName, (categories.get(catName) ?? 0) + amt);

    const monthKey = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyAmounts.set(monthKey, (monthlyAmounts.get(monthKey) ?? 0) + amt);
  }

  const now = new Date();
  const last6Months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const firstVisit = dates[0];
  const lastVisit = dates[dates.length - 1];

  let visitFrequency = "Occasional";
  if (transactions.length > 1) {
    const daySpan = (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24);
    const avgDaysBetween = daySpan / (transactions.length - 1);
    if (avgDaysBetween <= 10) visitFrequency = "Weekly";
    else if (avgDaysBetween <= 35) visitFrequency = "Monthly";
  }

  let topCategory = "Uncategorized";
  let topCatAmount = 0;
  for (const [cat, amt] of categories) {
    if (amt > topCatAmount) {
      topCategory = cat;
      topCatAmount = amt;
    }
  }

  const monthlyTrend = last6Months.map((month) => ({
    month,
    amount: Math.round((monthlyAmounts.get(month) ?? 0) * 100) / 100,
  }));

  return {
    merchant,
    totalSpent: Math.round(totalSpent * 100) / 100,
    transactionCount: transactions.length,
    avgTransaction: Math.round((totalSpent / transactions.length) * 100) / 100,
    firstVisit: firstVisit.toISOString(),
    lastVisit: lastVisit.toISOString(),
    topCategory,
    monthlyTrend,
    visitFrequency,
  };
}

export async function getMerchantTransactions(
  merchant: string,
  limit: number = 10,
) {
  const userId = await requireAuth();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      mergedIntoId: null,
      confirmed: true,
      merchant,
      amount: { not: null },
    },
    select: {
      id: true,
      date: true,
      amount: true,
      currency: true,
      type: true,
      description: true,
      category: { select: { name: true, color: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return transactions.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    amount: Number(tx.amount),
    currency: tx.currency,
    type: tx.type,
    description: tx.description,
    categoryName: tx.category?.name ?? null,
    categoryColor: tx.category?.color ?? null,
  }));
}

export async function getTopMerchantInsights(): Promise<string[]> {
  const userId = await requireAuth();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [thisMonthTxs, lastMonthTxs, allTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        mergedIntoId: null,
        confirmed: true,
        type: "expense",
        merchant: { not: null },
        amount: { not: null },
        date: { gte: thisMonthStart },
      },
      select: { merchant: true, amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        mergedIntoId: null,
        confirmed: true,
        type: "expense",
        merchant: { not: null },
        amount: { not: null },
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      select: { merchant: true, amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        mergedIntoId: null,
        confirmed: true,
        type: "expense",
        merchant: { not: null },
        amount: { not: null },
      },
      select: { merchant: true, amount: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const insights: string[] = [];

  // Visit frequency insights
  const merchantDates = new Map<string, Date[]>();
  for (const tx of allTxs) {
    const name = tx.merchant!;
    if (!merchantDates.has(name)) merchantDates.set(name, []);
    merchantDates.get(name)!.push(tx.date);
  }

  for (const [merchant, dates] of merchantDates) {
    if (dates.length < 3) continue;
    const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
    const daySpan = (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / (1000 * 60 * 60 * 24);
    const avgDays = Math.round(daySpan / (sorted.length - 1));
    if (avgDays > 0 && avgDays <= 14) {
      insights.push(`You visit ${merchant} every ${avgDays} days on average`);
    }
  }

  // Month-over-month change insights
  const thisMonthByMerchant = new Map<string, number>();
  const lastMonthByMerchant = new Map<string, number>();

  for (const tx of thisMonthTxs) {
    const name = tx.merchant!;
    thisMonthByMerchant.set(name, (thisMonthByMerchant.get(name) ?? 0) + Number(tx.amount));
  }
  for (const tx of lastMonthTxs) {
    const name = tx.merchant!;
    lastMonthByMerchant.set(name, (lastMonthByMerchant.get(name) ?? 0) + Number(tx.amount));
  }

  for (const [merchant, thisAmt] of thisMonthByMerchant) {
    const lastAmt = lastMonthByMerchant.get(merchant);
    if (lastAmt && lastAmt > 0) {
      const change = Math.round(((thisAmt - lastAmt) / lastAmt) * 100);
      if (change >= 30) {
        insights.push(
          `Your ${merchant} spending increased ${change}% this month`,
        );
      } else if (change <= -30) {
        insights.push(
          `Your ${merchant} spending decreased ${Math.abs(change)}% this month`,
        );
      }
    }
  }

  // Top spender insight
  const totalByMerchant = new Map<string, number>();
  for (const tx of allTxs) {
    const name = tx.merchant!;
    totalByMerchant.set(name, (totalByMerchant.get(name) ?? 0) + Number(tx.amount));
  }
  const sorted = [...totalByMerchant.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    insights.push(
      `${sorted[0][0]} is your top merchant with ${sorted[0][1].toLocaleString("en-US", { maximumFractionDigits: 0 })} total spent`,
    );
  }

  return insights.slice(0, 5);
}
