"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export type LeaderboardEntry = {
  userId: string;
  userName: string;
  userImage: string | null;
  stats: {
    totalSaved: number;
    budgetAdherence: number;
    streak: number;
    noSpendDays: number;
    transactionCount: number;
  };
  score: number;
  rank: number;
};

async function getMemberStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const baseWhere = {
    userId,
    mergedIntoId: null as string | null,
    confirmed: true,
    amount: { not: null as null },
    date: { gte: startOfMonth, lte: endOfMonth },
  };

  // Get income and expenses for the month
  const [incomeRows, expenseRows, allTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: { ...baseWhere, type: "income" },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { ...baseWhere, type: "expense" },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { ...baseWhere },
      select: { date: true },
    }),
  ]);

  const totalIncome = incomeRows.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpense = expenseRows.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalSaved = totalIncome - totalExpense;
  const transactionCount = allTxs.length;

  // Budget adherence - percentage of budgets under limit
  const budgets = await prisma.budget.findMany({
    where: { category: { userId } },
    include: { category: true },
  });

  let budgetAdherence = 100;
  if (budgets.length > 0) {
    let underBudgetCount = 0;
    for (const budget of budgets) {
      const spent = await prisma.transaction.aggregate({
        where: {
          ...baseWhere,
          type: "expense",
          categoryId: budget.categoryId,
        },
        _sum: { amount: true },
      });
      const spentAmount = Number(spent._sum.amount ?? 0);
      if (spentAmount <= Number(budget.monthlyLimit)) {
        underBudgetCount++;
      }
    }
    budgetAdherence = Math.round((underBudgetCount / budgets.length) * 100);
  }

  // Logging streak - count consecutive days with at least one transaction
  // going backwards from today
  let streak = 0;
  const txDays = new Set(
    allTxs.map((tx) => tx.date.toISOString().slice(0, 10)),
  );

  // Also check past 60 days for streak
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const recentTxs = await prisma.transaction.findMany({
    where: {
      userId,
      mergedIntoId: null,
      confirmed: true,
      date: { gte: sixtyDaysAgo, lte: now },
    },
    select: { date: true },
  });
  const allDays = new Set(
    recentTxs.map((tx) => tx.date.toISOString().slice(0, 10)),
  );

  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    if (allDays.has(dayKey)) {
      streak++;
    } else {
      break;
    }
  }

  // No-spend days this month
  const daysInMonth = endOfMonth.getDate();
  const expenseDays = new Set<string>();
  const expenseTxsThisMonth = await prisma.transaction.findMany({
    where: { ...baseWhere, type: "expense" },
    select: { date: true },
  });
  for (const tx of expenseTxsThisMonth) {
    expenseDays.add(tx.date.toISOString().slice(0, 10));
  }
  const daysSoFar = Math.min(now.getDate(), daysInMonth);
  const noSpendDays = daysSoFar - expenseDays.size;

  // Composite score
  const savingsRate =
    totalIncome > 0 ? Math.min((totalSaved / totalIncome) * 100, 100) : 0;
  const score = Math.round(
    budgetAdherence * 0.3 +
      Math.max(savingsRate, 0) * 0.3 +
      Math.min(streak, 30) * (100 / 30) * 0.2 +
      Math.min(noSpendDays, daysSoFar) *
        (100 / Math.max(daysSoFar, 1)) *
        0.2,
  );

  return {
    totalSaved: Math.round(totalSaved * 100) / 100,
    budgetAdherence,
    streak,
    noSpendDays: Math.max(noSpendDays, 0),
    transactionCount,
    score: Math.max(score, 0),
  };
}

export async function getHouseholdLeaderboard(): Promise<LeaderboardEntry[]> {
  const userId = await requireAuth();

  // Find user's household
  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) return [];

  const members = membership.household.members;
  const entries: LeaderboardEntry[] = [];

  for (const member of members) {
    const stats = await getMemberStats(member.userId);
    entries.push({
      userId: member.userId,
      userName: member.user.name ?? "Unknown",
      userImage: member.user.image,
      stats: {
        totalSaved: stats.totalSaved,
        budgetAdherence: stats.budgetAdherence,
        streak: stats.streak,
        noSpendDays: stats.noSpendDays,
        transactionCount: stats.transactionCount,
      },
      score: stats.score,
      rank: 0,
    });
  }

  // Sort by score desc and assign ranks
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}

export async function getWeeklyWinner(): Promise<{
  name: string;
  achievement: string;
} | null> {
  const userId = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!membership || membership.household.members.length < 2) return null;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  let bestMember: { name: string; saved: number } | null = null;

  for (const member of membership.household.members) {
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: member.userId,
          type: "income",
          date: { gte: weekStart, lte: now },
          mergedIntoId: null,
          confirmed: true,
          amount: { not: null },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: member.userId,
          type: "expense",
          date: { gte: weekStart, lte: now },
          mergedIntoId: null,
          confirmed: true,
          amount: { not: null },
        },
        _sum: { amount: true },
      }),
    ]);

    const saved =
      Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0);
    const name = member.user.name ?? "Unknown";

    if (!bestMember || saved > bestMember.saved) {
      bestMember = { name, saved };
    }
  }

  if (!bestMember) return null;

  const achievement =
    bestMember.saved >= 0
      ? `saved the most this week!`
      : `spent the least this week!`;

  return { name: bestMember.name, achievement };
}
