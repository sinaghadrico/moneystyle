"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { basicNormalize, resolveItemName } from "@/lib/item-normalization";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PriceAlert = {
  itemName: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  merchant: string;
  lastSeen: string;
};

export type WatchedItemPrice = {
  date: string;
  price: number;
  merchant: string;
};

export type WatchedItem = {
  itemName: string;
  currentPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  purchaseCount: number;
  priceHistory: WatchedItemPrice[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEffectivePrice(
  unitPrice: number | null,
  totalPrice: number,
  quantity: number,
): number {
  if (unitPrice != null && unitPrice > 0) return unitPrice;
  return quantity > 0 ? totalPrice / quantity : totalPrice;
}

async function buildGroupMap(userId: string) {
  const groups = await prisma.itemGroup.findMany({ where: { userId } });
  const map = new Map<string, string>();
  for (const g of groups) {
    for (const raw of g.rawNames) {
      map.set(basicNormalize(raw), g.canonicalName);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Price Alerts — items with >10% price change vs average
// ---------------------------------------------------------------------------

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const userId = await requireAuth();

  const items = await prisma.transactionItem.findMany({
    where: { transaction: { userId, confirmed: true, mergedIntoId: null } },
    include: {
      transaction: {
        select: { merchant: true, date: true },
      },
    },
    orderBy: { transaction: { date: "desc" } },
  });

  const groupMap = await buildGroupMap(userId);

  // Group by resolved name
  const grouped = new Map<
    string,
    {
      displayName: string;
      entries: {
        price: number;
        merchant: string;
        date: Date;
      }[];
    }
  >();

  for (const item of items) {
    const resolved = resolveItemName(item.name, groupMap, false);
    if (!resolved) continue;

    let entry = grouped.get(resolved);
    if (!entry) {
      entry = { displayName: item.name, entries: [] };
      grouped.set(resolved, entry);
    }

    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);
    entry.entries.push({
      price,
      merchant: item.transaction.merchant || "Unknown",
      date: item.transaction.date,
    });
  }

  const alerts: PriceAlert[] = [];

  for (const [, data] of grouped) {
    if (data.entries.length < 2) continue;

    // Sort by date descending
    data.entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    const latestPrice = data.entries[0].price;
    const latestMerchant = data.entries[0].merchant;
    const latestDate = data.entries[0].date;

    // Calculate average of all except the latest
    const olderPrices = data.entries.slice(1).map((e) => e.price);
    const avgOlder =
      olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;

    if (avgOlder === 0) continue;

    const changePercent = Math.round(
      ((latestPrice - avgOlder) / avgOlder) * 100,
    );

    // Only alert if change > 10% or < -10%
    if (Math.abs(changePercent) > 10) {
      alerts.push({
        itemName: data.displayName,
        currentPrice: Math.round(latestPrice * 100) / 100,
        previousPrice: Math.round(avgOlder * 100) / 100,
        changePercent,
        merchant: latestMerchant,
        lastSeen: latestDate.toISOString(),
      });
    }
  }

  // Sort by absolute change descending
  alerts.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  return alerts.slice(0, 20);
}

// ---------------------------------------------------------------------------
// Watched Items — frequently purchased items (3+ times)
// ---------------------------------------------------------------------------

export async function getWatchedItems(): Promise<WatchedItem[]> {
  const userId = await requireAuth();

  const items = await prisma.transactionItem.findMany({
    where: { transaction: { userId, confirmed: true, mergedIntoId: null } },
    include: {
      transaction: {
        select: { merchant: true, date: true },
      },
    },
  });

  const groupMap = await buildGroupMap(userId);

  const grouped = new Map<
    string,
    {
      displayName: string;
      entries: { price: number; merchant: string; date: Date }[];
    }
  >();

  for (const item of items) {
    const resolved = resolveItemName(item.name, groupMap, false);
    if (!resolved) continue;

    let entry = grouped.get(resolved);
    if (!entry) {
      entry = { displayName: item.name, entries: [] };
      grouped.set(resolved, entry);
    }

    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);
    entry.entries.push({
      price,
      merchant: item.transaction.merchant || "Unknown",
      date: item.transaction.date,
    });
  }

  const watchedItems: WatchedItem[] = [];

  for (const [, data] of grouped) {
    if (data.entries.length < 3) continue;

    data.entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    const prices = data.entries.map((e) => e.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    watchedItems.push({
      itemName: data.displayName,
      currentPrice: Math.round(data.entries[data.entries.length - 1].price * 100) / 100,
      avgPrice: Math.round(avg * 100) / 100,
      minPrice: Math.round(Math.min(...prices) * 100) / 100,
      maxPrice: Math.round(Math.max(...prices) * 100) / 100,
      purchaseCount: data.entries.length,
      priceHistory: data.entries.map((e) => ({
        date: e.date.toISOString(),
        price: Math.round(e.price * 100) / 100,
        merchant: e.merchant,
      })),
    });
  }

  watchedItems.sort((a, b) => b.purchaseCount - a.purchaseCount);
  return watchedItems;
}
