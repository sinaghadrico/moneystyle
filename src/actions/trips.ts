"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export type TripData = {
  id: string;
  name: string;
  currency: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  totalSpent: number;
  transactionCount: number;
};

export type TripSummary = {
  id: string;
  name: string;
  currency: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  totalSpent: number;
  transactionCount: number;
  dailyAverage: number;
  daysCount: number;
  categoryBreakdown: { name: string; color: string; total: number; count: number }[];
  dailySpending: { date: string; amount: number }[];
};

export async function getTrips(): Promise<TripData[]> {
  const userId = await requireAuth();

  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      transactions: {
        where: { type: "expense" },
        select: { amount: true },
      },
    },
  });

  return trips.map((t) => {
    const totalSpent = t.transactions.reduce(
      (sum, tx) => sum + (tx.amount ? Math.abs(Number(tx.amount)) : 0),
      0,
    );
    return {
      id: t.id,
      name: t.name,
      currency: t.currency,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate?.toISOString() ?? null,
      isActive: t.isActive,
      createdAt: t.createdAt.toISOString(),
      totalSpent,
      transactionCount: t.transactions.length,
    };
  });
}

export async function getActiveTrip(): Promise<TripData | null> {
  const userId = await requireAuth();

  const trip = await prisma.trip.findFirst({
    where: { userId, isActive: true },
    include: {
      transactions: {
        where: { type: "expense" },
        select: { amount: true },
      },
    },
  });

  if (!trip) return null;

  const totalSpent = trip.transactions.reduce(
    (sum, tx) => sum + (tx.amount ? Math.abs(Number(tx.amount)) : 0),
    0,
  );

  return {
    id: trip.id,
    name: trip.name,
    currency: trip.currency,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate?.toISOString() ?? null,
    isActive: trip.isActive,
    createdAt: trip.createdAt.toISOString(),
    totalSpent,
    transactionCount: trip.transactions.length,
  };
}

export async function createTrip(data: {
  name: string;
  currency: string;
  startDate: string;
}) {
  const userId = await requireAuth();

  if (!data.name.trim()) return { error: "Trip name is required" };
  if (!data.currency) return { error: "Currency is required" };
  if (!data.startDate) return { error: "Start date is required" };

  // Deactivate any existing active trip
  await prisma.trip.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endDate: new Date() },
  });

  await prisma.trip.create({
    data: {
      userId,
      name: data.name.trim(),
      currency: data.currency,
      startDate: new Date(data.startDate),
      isActive: true,
    },
  });

  revalidatePath("/travel");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function endTrip(tripId: string) {
  const userId = await requireAuth();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });

  if (!trip) return { error: "Trip not found" };
  if (!trip.isActive) return { error: "Trip is already ended" };

  await prisma.trip.update({
    where: { id: tripId, userId },
    data: { isActive: false, endDate: new Date() },
  });

  revalidatePath("/travel");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTripSummary(
  tripId: string,
): Promise<TripSummary | { error: string }> {
  const userId = await requireAuth();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
    include: {
      transactions: {
        where: { type: "expense" },
        include: { category: true },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!trip) return { error: "Trip not found" };

  const endDate = trip.endDate ?? new Date();
  const daysCount = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const totalSpent = trip.transactions.reduce(
    (sum, tx) => sum + (tx.amount ? Math.abs(Number(tx.amount)) : 0),
    0,
  );

  // Category breakdown
  const catMap = new Map<
    string,
    { name: string; color: string; total: number; count: number }
  >();
  for (const tx of trip.transactions) {
    const catName = tx.category?.name ?? "Uncategorized";
    const catColor = tx.category?.color ?? "#6b7280";
    const existing = catMap.get(catName) ?? {
      name: catName,
      color: catColor,
      total: 0,
      count: 0,
    };
    existing.total += tx.amount ? Math.abs(Number(tx.amount)) : 0;
    existing.count += 1;
    catMap.set(catName, existing);
  }
  const categoryBreakdown = Array.from(catMap.values()).sort(
    (a, b) => b.total - a.total,
  );

  // Daily spending
  const dailyMap = new Map<string, number>();
  for (const tx of trip.transactions) {
    const dateKey = tx.date.toISOString().split("T")[0];
    dailyMap.set(
      dateKey,
      (dailyMap.get(dateKey) ?? 0) +
        (tx.amount ? Math.abs(Number(tx.amount)) : 0),
    );
  }
  const dailySpending = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    id: trip.id,
    name: trip.name,
    currency: trip.currency,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate?.toISOString() ?? null,
    isActive: trip.isActive,
    totalSpent,
    transactionCount: trip.transactions.length,
    dailyAverage: Math.round((totalSpent / daysCount) * 100) / 100,
    daysCount,
    categoryBreakdown,
    dailySpending,
  };
}
