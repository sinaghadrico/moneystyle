"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  reserveSchema,
  reserveUpdateSchema,
  recordReserveValueSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import type {
  ReserveData,
  ReserveSnapshotData,
  DetectedSubscription,
} from "@/lib/types";

// ── Reserves ──

export async function getReserves(): Promise<ReserveData[]> {
  const userId = await requireAuth();
  const rows = await prisma.reserve.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: {
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { recordedAt: true },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency,
    type: r.type,
    location: r.location,
    note: r.note,
    ticker: r.ticker,
    quantity: r.quantity ? Number(r.quantity) : null,
    purchasePrice: r.purchasePrice ? Number(r.purchasePrice) : null,
    lastRecordedAt: r.snapshots[0]?.recordedAt?.toISOString() ?? null,
  }));
}

export async function createReserve(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = reserveSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    const reserve = await prisma.reserve.create({ data: { ...parsed.data, userId } });
    await prisma.reserveSnapshot.create({
      data: {
        reserveId: reserve.id,
        amount: reserve.amount,
        note: "Initial value",
      },
    });
  } catch (err) {
    console.error("Failed to create reserve:", err);
    return { error: "Failed to create reserve. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function updateReserve(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = reserveUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    const existing = await prisma.reserve.findUnique({ where: { id, userId } });
    const updated = await prisma.reserve.update({
      where: { id, userId },
      data: parsed.data,
    });
    if (
      existing &&
      parsed.data.amount !== undefined &&
      Number(existing.amount) !== Number(updated.amount)
    ) {
      await prisma.reserveSnapshot.create({
        data: {
          reserveId: id,
          amount: updated.amount,
          note: "Updated via edit",
        },
      });
    }
  } catch (err) {
    console.error("Failed to update reserve:", err);
    return { error: "Failed to update reserve. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteReserve(id: string) {
  const userId = await requireAuth();
  try {
    await prisma.reserve.delete({ where: { id, userId } });
  } catch (err) {
    console.error("Failed to delete reserve:", err);
    return { error: "Failed to delete reserve. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function recordReserveValue(
  reserveId: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = recordReserveValueSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.$transaction([
      prisma.reserveSnapshot.create({
        data: {
          reserveId,
          amount: parsed.data.amount,
          note: parsed.data.note ?? null,
        },
      }),
      prisma.reserve.update({
        where: { id: reserveId, userId },
        data: { amount: parsed.data.amount },
      }),
    ]);
  } catch (err) {
    console.error("Failed to record reserve value:", err);
    return { error: "Failed to record value. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function getReserveHistory(
  reserveId: string
): Promise<ReserveSnapshotData[]> {
  const userId = await requireAuth();
  // Verify the reserve belongs to the user
  const reserve = await prisma.reserve.findUnique({ where: { id: reserveId, userId } });
  if (!reserve) return [];
  const rows = await prisma.reserveSnapshot.findMany({
    where: { reserveId },
    orderBy: { recordedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    recordedAt: r.recordedAt.toISOString(),
  }));
}

export async function fetchStockPrice(ticker: string): Promise<{ price: number; currency: string } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: meta.regularMarketPrice,
      currency: (meta.currency ?? "USD").toUpperCase(),
    };
  } catch {
    return null;
  }
}

export async function refreshInvestmentPrices() {
  const userId = await requireAuth();
  const investments = await prisma.reserve.findMany({
    where: { userId, type: { in: ["stock", "etf", "bond"] }, ticker: { not: null } },
  });

  const results: { id: string; name: string; oldAmount: number; newAmount: number }[] = [];

  try {
    for (const inv of investments) {
      if (!inv.ticker || !inv.quantity) continue;
      const quote = await fetchStockPrice(inv.ticker);
      if (!quote) continue;

      const newAmount = quote.price * Number(inv.quantity);
      const oldAmount = Number(inv.amount);

      if (Math.abs(newAmount - oldAmount) < 0.01) continue;

      await prisma.$transaction([
        prisma.reserve.update({
          where: { id: inv.id, userId },
          data: { amount: newAmount, currency: quote.currency },
        }),
        prisma.reserveSnapshot.create({
          data: {
            reserveId: inv.id,
            amount: newAmount,
            note: `Price update: ${inv.ticker} @ ${quote.price}`,
          },
        }),
      ]);

      results.push({ id: inv.id, name: inv.name, oldAmount, newAmount });
    }
  } catch (err) {
    console.error("Failed to refresh investment prices:", err);
    return { success: false, error: "Failed to refresh prices. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true, updated: results.length, results };
}

// ── Subscription Detection ──

export async function detectSubscriptions(): Promise<DetectedSubscription[]> {
  const userId = await requireAuth();
  const [settings, rates] = await Promise.all([
    prisma.appSettings.findFirst({ where: { userId } }),
    getCurrencyRates(),
  ]);
  const primaryCurrency = settings?.currency ?? "AED";

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: sixMonthsAgo },
      type: "expense",
      merchant: { not: null },
      mergedIntoId: null,
      confirmed: true,
    },
    select: {
      merchant: true,
      amount: true,
      currency: true,
      date: true,
      category: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  // Group by merchant
  const merchantMap = new Map<
    string,
    { amounts: number[]; dates: Date[]; currency: string; categoryName: string | null }
  >();

  for (const tx of transactions) {
    const name = tx.merchant?.trim().toLowerCase();
    if (!name || !tx.amount) continue;

    const entry = merchantMap.get(name) ?? {
      amounts: [],
      dates: [],
      currency: tx.currency,
      categoryName: tx.category?.name ?? null,
    };
    entry.amounts.push(
      convertAmount(Math.abs(Number(tx.amount)), tx.currency, primaryCurrency, rates)
    );
    entry.dates.push(tx.date);
    merchantMap.set(name, entry);
  }

  const subscriptions: DetectedSubscription[] = [];

  for (const [merchant, data] of merchantMap.entries()) {
    if (data.amounts.length < 2) continue;

    // Check amount consistency (std deviation / mean < 30%)
    const mean = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
    const variance =
      data.amounts.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.amounts.length;
    const stdDev = Math.sqrt(variance);
    const amountConsistency = mean > 0 ? 1 - stdDev / mean : 0;

    if (amountConsistency < 0.7) continue; // Too variable

    // Check interval consistency
    const intervals: number[] = [];
    for (let i = 1; i < data.dates.length; i++) {
      const days = Math.round(
        (data.dates[i].getTime() - data.dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }

    if (intervals.length === 0) continue;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Determine frequency
    let frequency: "weekly" | "monthly" | "yearly";
    let intervalConsistency: number;

    if (avgInterval <= 10) {
      frequency = "weekly";
      const idealInterval = 7;
      intervalConsistency =
        1 -
        intervals.reduce((sum, i) => sum + Math.abs(i - idealInterval), 0) /
          (intervals.length * idealInterval);
    } else if (avgInterval <= 45) {
      frequency = "monthly";
      const idealInterval = 30;
      intervalConsistency =
        1 -
        intervals.reduce((sum, i) => sum + Math.abs(i - idealInterval), 0) /
          (intervals.length * idealInterval);
    } else if (avgInterval <= 400) {
      frequency = "yearly";
      const idealInterval = 365;
      intervalConsistency =
        1 -
        intervals.reduce((sum, i) => sum + Math.abs(i - idealInterval), 0) /
          (intervals.length * idealInterval);
    } else {
      continue; // Too irregular
    }

    if (intervalConsistency < 0.5) continue;

    // Calculate confidence score (0-100)
    const confidence = Math.round(
      Math.max(0, Math.min(100, (amountConsistency * 50 + intervalConsistency * 50)))
    );

    if (confidence < 50) continue;

    // Use original merchant casing from first transaction
    const originalName =
      transactions.find((t) => t.merchant?.trim().toLowerCase() === merchant)?.merchant ?? merchant;

    subscriptions.push({
      merchant: originalName,
      amount: Math.round(mean * 100) / 100,
      currency: primaryCurrency,
      frequency,
      confidence,
      occurrences: data.amounts.length,
      lastDate: data.dates[data.dates.length - 1].toISOString(),
      firstDate: data.dates[0].toISOString(),
      categoryName: data.categoryName,
    });
  }

  return subscriptions.sort((a, b) => b.amount - a.amount);
}
