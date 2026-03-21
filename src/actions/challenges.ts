"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { CHALLENGE_TEMPLATES, BADGE_DEFINITIONS } from "@/lib/challenges-data";

export type ChallengeData = {
  id: string;
  type: string;
  title: string;
  description: string;
  targetValue: number | null;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  createdAt: string;
};

export type BadgeData = {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  totalDaysLogged: number;
};

export async function getChallenges(): Promise<ChallengeData[]> {
  const userId = await requireAuth();

  const challenges = await prisma.challenge.findMany({
    where: {
      userId,
      OR: [
        { status: "active" },
        {
          status: { in: ["completed", "failed"] },
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      ],
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return challenges.map((c) => ({
    id: c.id,
    type: c.type,
    title: c.title,
    description: c.description,
    targetValue: c.targetValue ? Number(c.targetValue) : null,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    status: c.status,
    progress: c.progress,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createChallenge(type: string) {
  const userId = await requireAuth();

  const template = CHALLENGE_TEMPLATES.find((t) => t.type === type);
  if (!template) return { error: "Invalid challenge type" };

  // Check if user already has an active challenge of this type
  const existing = await prisma.challenge.findFirst({
    where: { userId, type, status: "active" },
  });
  if (existing) return { error: "You already have an active challenge of this type" };

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + template.days);

  await prisma.challenge.create({
    data: {
      userId,
      type: template.type,
      title: template.title,
      description: template.description,
      targetValue: template.type === "save-target" ? 500 : null,
      startDate: now,
      endDate,
      status: "active",
      progress: 0,
    },
  });

  revalidatePath("/challenges");
  return { success: true };
}

export async function getBadges(): Promise<BadgeData[]> {
  const userId = await requireAuth();

  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
  });

  return badges.map((b) => ({
    id: b.id,
    type: b.type,
    name: b.name,
    description: b.description,
    icon: b.icon,
    earnedAt: b.earnedAt.toISOString(),
  }));
}

export async function getStreakData(): Promise<StreakData> {
  const userId = await requireAuth();

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);

  // Get all transactions in last 60 days, grouped by date
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: sixtyDaysAgo },
      mergedIntoId: null,
    },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  // Build a set of unique dates (YYYY-MM-DD)
  const datesWithTransactions = new Set<string>();
  for (const tx of transactions) {
    const dateStr = tx.date.toISOString().split("T")[0];
    datesWithTransactions.add(dateStr);
  }

  const totalDaysLogged = datesWithTransactions.size;

  // Calculate current streak (consecutive days from today going backwards)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (datesWithTransactions.has(dateStr)) {
      currentStreak++;
    } else {
      // If it's today and no transactions yet, skip today and check from yesterday
      if (i === 0) {
        continue;
      }
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  // Sort dates ascending
  const sortedDates = Array.from(datesWithTransactions).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { currentStreak, longestStreak, totalDaysLogged };
}

export async function checkAndAwardBadges(): Promise<BadgeData[]> {
  const userId = await requireAuth();

  const newBadges: BadgeData[] = [];

  // Get existing badges
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { type: true },
  });
  const earnedTypes = new Set(existingBadges.map((b) => b.type));

  // 1. Check first-transaction badge
  if (!earnedTypes.has("first-transaction")) {
    const txCount = await prisma.transaction.count({
      where: { userId, mergedIntoId: null },
    });
    if (txCount > 0) {
      const def = BADGE_DEFINITIONS.find((b) => b.type === "first-transaction")!;
      const badge = await prisma.badge.create({
        data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
      });
      newBadges.push({
        id: badge.id,
        type: badge.type,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: badge.earnedAt.toISOString(),
      });
    }
  }

  // 2. Check streak badges
  const streakData = await getStreakData();

  if (!earnedTypes.has("week-streak") && streakData.currentStreak >= 7) {
    const def = BADGE_DEFINITIONS.find((b) => b.type === "week-streak")!;
    const badge = await prisma.badge.create({
      data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
    });
    newBadges.push({
      id: badge.id, type: badge.type, name: badge.name,
      description: badge.description, icon: badge.icon, earnedAt: badge.earnedAt.toISOString(),
    });
  }

  if (!earnedTypes.has("month-streak") && streakData.currentStreak >= 30) {
    const def = BADGE_DEFINITIONS.find((b) => b.type === "month-streak")!;
    const badge = await prisma.badge.create({
      data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
    });
    newBadges.push({
      id: badge.id, type: badge.type, name: badge.name,
      description: badge.description, icon: badge.icon, earnedAt: badge.earnedAt.toISOString(),
    });
  }

  // 3. Check budget-master badge (all budgets under limit for current month)
  if (!earnedTypes.has("budget-master")) {
    const now = new Date();
    // Only check if we're past the 28th (near end of month)
    if (now.getDate() >= 28) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const budgets = await prisma.budget.findMany({
        where: { category: { userId } },
        include: { category: true },
      });

      if (budgets.length > 0) {
        let allUnderBudget = true;
        for (const budget of budgets) {
          const spent = await prisma.transaction.aggregate({
            where: {
              userId,
              type: "expense",
              categoryId: budget.categoryId,
              date: { gte: startOfMonth, lte: endOfMonth },
              mergedIntoId: null,
              confirmed: true,
            },
            _sum: { amount: true },
          });
          if (Number(spent._sum.amount ?? 0) > Number(budget.monthlyLimit)) {
            allUnderBudget = false;
            break;
          }
        }

        if (allUnderBudget) {
          const def = BADGE_DEFINITIONS.find((b) => b.type === "budget-master")!;
          const badge = await prisma.badge.create({
            data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
          });
          newBadges.push({
            id: badge.id, type: badge.type, name: badge.name,
            description: badge.description, icon: badge.icon, earnedAt: badge.earnedAt.toISOString(),
          });
        }
      }
    }
  }

  // 4. Check saver badge (saved more than spent in current month)
  if (!earnedTypes.has("saver")) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId, type: "income",
          date: { gte: startOfMonth, lte: endOfMonth },
          mergedIntoId: null, confirmed: true,
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId, type: "expense",
          date: { gte: startOfMonth, lte: endOfMonth },
          mergedIntoId: null, confirmed: true,
        },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);

    // Saved more than spent means expense < income/2 (savings > spending)
    if (income > 0 && expense > 0 && (income - expense) > expense) {
      const def = BADGE_DEFINITIONS.find((b) => b.type === "saver")!;
      const badge = await prisma.badge.create({
        data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
      });
      newBadges.push({
        id: badge.id, type: badge.type, name: badge.name,
        description: badge.description, icon: badge.icon, earnedAt: badge.earnedAt.toISOString(),
      });
    }
  }

  // 5. Check no-spend-hero badge (completed 3 no-spend challenges)
  if (!earnedTypes.has("no-spend-hero")) {
    const completedNoSpend = await prisma.challenge.count({
      where: {
        userId,
        type: { in: ["no-spend-day", "no-spend-weekend"] },
        status: "completed",
      },
    });

    if (completedNoSpend >= 3) {
      const def = BADGE_DEFINITIONS.find((b) => b.type === "no-spend-hero")!;
      const badge = await prisma.badge.create({
        data: { userId, type: def.type, name: def.name, description: def.description, icon: def.icon },
      });
      newBadges.push({
        id: badge.id, type: badge.type, name: badge.name,
        description: badge.description, icon: badge.icon, earnedAt: badge.earnedAt.toISOString(),
      });
    }
  }

  if (newBadges.length > 0) {
    revalidatePath("/challenges");
  }

  return newBadges;
}
