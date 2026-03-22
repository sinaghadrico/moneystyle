"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  onboardingCompleted: boolean;
  createdAt: string;
  lastActive: string | null;
  transactionCount: number;
  accountCount: number;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const userId = await requireAuth();
  const admin = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (admin?.role !== "admin") return [];

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      onboardingCompleted: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true,
          bankAccounts: true,
        },
      },
    },
  });

  // Get last transaction date for each user
  const lastActiveDates = await prisma.transaction.groupBy({
    by: ["userId"],
    _max: { createdAt: true },
  });
  const lastActiveMap = new Map(lastActiveDates.map((d) => [d.userId, d._max.createdAt]));

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    onboardingCompleted: u.onboardingCompleted,
    createdAt: u.createdAt.toISOString(),
    lastActive: lastActiveMap.get(u.id)?.toISOString() ?? null,
    transactionCount: u._count.transactions,
    accountCount: u._count.bankAccounts,
  }));
}

export async function getAdminStats() {
  const userId = await requireAuth();
  const admin = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (admin?.role !== "admin") return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, todayUsers, weekUsers, monthUsers, totalTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.transaction.count(),
  ]);

  return { totalUsers, todayUsers, weekUsers, monthUsers, totalTransactions };
}
