"use server";

import { prisma } from "@/lib/db";
import { basicNormalize, fuzzyNormalize, resolveItemName } from "@/lib/item-normalization";
import { itemGroupUpdateSchema } from "@/lib/validators";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import type {
  PriceAnalysisFilters,
  ItemPriceSummary,
  ItemDetail,
  ItemGroupData,
} from "@/lib/types";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEffectivePrice(unitPrice: number | null, totalPrice: number, quantity: number): number {
  if (unitPrice != null && unitPrice > 0) return unitPrice;
  return quantity > 0 ? totalPrice / quantity : totalPrice;
}

async function buildGroupMap(): Promise<{
  map: Map<string, string>;
  canonicalNames: Set<string>;
  groupMembers: Map<string, string[]>;
}> {
  const groups = await prisma.itemGroup.findMany();
  const map = new Map<string, string>();
  const canonicalNames = new Set<string>();
  const groupMembers = new Map<string, string[]>();
  for (const g of groups) {
    canonicalNames.add(g.canonicalName);
    groupMembers.set(g.canonicalName, g.rawNames);
    for (const raw of g.rawNames) {
      map.set(basicNormalize(raw), g.canonicalName);
    }
  }
  return { map, canonicalNames, groupMembers };
}

// ---------------------------------------------------------------------------
// Main list — getItemPriceSummaries
// ---------------------------------------------------------------------------

export async function getItemPriceSummaries(
  options: PriceAnalysisFilters = {},
): Promise<ItemPriceSummary[]> {
  const { search, fuzzy = false, sortBy = "totalPurchases", sortOrder = "desc" } = options;

  const items = await prisma.transactionItem.findMany({
    include: {
      transaction: {
        select: { merchant: true, date: true, id: true },
      },
    },
  });

  const { map: groupMap, canonicalNames, groupMembers } = await buildGroupMap();

  // Group items by resolved name
  const grouped = new Map<
    string,
    {
      displayNames: Map<string, number>;
      prices: number[];
      merchants: Map<string, { prices: number[]; lastDate: Date }>;
      dates: Date[];
    }
  >();

  for (const item of items) {
    const resolved = resolveItemName(item.name, groupMap, fuzzy);
    if (!resolved) continue;

    if (search && !resolved.includes(search.toLowerCase())) continue;

    let entry = grouped.get(resolved);
    if (!entry) {
      entry = {
        displayNames: new Map(),
        prices: [],
        merchants: new Map(),
        dates: [],
      };
      grouped.set(resolved, entry);
    }

    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);

    entry.displayNames.set(item.name, (entry.displayNames.get(item.name) || 0) + 1);
    entry.prices.push(price);
    entry.dates.push(item.transaction.date);

    const merchant = item.transaction.merchant || "Unknown";
    let mStats = entry.merchants.get(merchant);
    if (!mStats) {
      mStats = { prices: [], lastDate: item.transaction.date };
      entry.merchants.set(merchant, mStats);
    }
    mStats.prices.push(price);
    if (item.transaction.date > mStats.lastDate) {
      mStats.lastDate = item.transaction.date;
    }
  }

  // Build summaries
  const summaries: ItemPriceSummary[] = [];

  for (const [normalizedName, data] of grouped) {
    const avg = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    const min = Math.min(...data.prices);
    const max = Math.max(...data.prices);
    const lastDate = new Date(Math.max(...data.dates.map((d) => d.getTime())));

    // If this is a canonical group name from ItemGroup, use that as displayName
    const isGroup = canonicalNames.has(normalizedName);
    const displayName = isGroup ? normalizedName : normalizedName;

    // Cheapest merchant
    let cheapestMerchant: string | null = null;
    let cheapestAvg = Infinity;
    for (const [merchant, mStats] of data.merchants) {
      const mAvg = mStats.prices.reduce((a, b) => a + b, 0) / mStats.prices.length;
      if (mAvg < cheapestAvg) {
        cheapestAvg = mAvg;
        cheapestMerchant = merchant;
      }
    }

    // Price change: compare first half average to second half average
    let priceChangePercent: number | null = null;
    if (data.prices.length >= 4) {
      const sorted = [...data.dates]
        .map((d, i) => ({ date: d, price: data.prices[i] }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const mid = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, mid);
      const secondHalf = sorted.slice(mid);
      const firstAvg = firstHalf.reduce((s, p) => s + p.price, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, p) => s + p.price, 0) / secondHalf.length;
      if (firstAvg > 0) {
        priceChangePercent = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
      }
    }

    // For groups: use ALL members from group definition, not just ones with transactions
    const rawNames = isGroup
      ? groupMembers.get(normalizedName) ?? Array.from(data.displayNames.keys())
      : Array.from(data.displayNames.keys());

    summaries.push({
      normalizedName,
      displayName,
      isGroup,
      rawNames,
      merchantNames: Array.from(data.merchants.keys()),
      avgPrice: Math.round(avg * 100) / 100,
      minPrice: Math.round(min * 100) / 100,
      maxPrice: Math.round(max * 100) / 100,
      totalPurchases: data.prices.length,
      cheapestMerchant,
      lastDate: lastDate.toISOString(),
      priceChangePercent,
    });
  }

  // Sort
  summaries.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "name":
        cmp = a.normalizedName.localeCompare(b.normalizedName);
        break;
      case "avgPrice":
        cmp = a.avgPrice - b.avgPrice;
        break;
      case "totalPurchases":
        cmp = a.totalPurchases - b.totalPurchases;
        break;
      case "lastDate":
        cmp = new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime();
        break;
    }
    return sortOrder === "desc" ? -cmp : cmp;
  });

  return summaries;
}

// ---------------------------------------------------------------------------
// Group Detail — aggregated across all items in a group
// ---------------------------------------------------------------------------

export async function getGroupDetail(
  normalizedName: string,
  fuzzy = false,
): Promise<ItemDetail | null> {
  const items = await prisma.transactionItem.findMany({
    include: {
      transaction: {
        select: { merchant: true, date: true, id: true },
      },
    },
  });

  const { map: groupMap } = await buildGroupMap();

  const matchingItems = items.filter((item) => {
    const resolved = resolveItemName(item.name, groupMap, fuzzy);
    return resolved === normalizedName;
  });

  if (matchingItems.length === 0) return null;

  // Display name: use the canonical group name (normalizedName IS the canonical name)
  const displayName = normalizedName;

  // Merchant stats
  const merchantMap = new Map<
    string,
    { prices: number[]; lastDate: Date }
  >();

  const priceHistory: ItemDetail["priceHistory"] = [];

  for (const item of matchingItems) {
    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);
    const merchant = item.transaction.merchant || "Unknown";

    let mStats = merchantMap.get(merchant);
    if (!mStats) {
      mStats = { prices: [], lastDate: item.transaction.date };
      merchantMap.set(merchant, mStats);
    }
    mStats.prices.push(price);
    if (item.transaction.date > mStats.lastDate) {
      mStats.lastDate = item.transaction.date;
    }

    priceHistory.push({
      date: item.transaction.date.toISOString(),
      price: Math.round(price * 100) / 100,
      merchant,
      transactionId: item.transaction.id,
    });
  }

  // Sort price history by date
  priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const merchantStats = Array.from(merchantMap.entries()).map(([merchant, stats]) => ({
    merchant,
    avgPrice: Math.round((stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length) * 100) / 100,
    minPrice: Math.round(Math.min(...stats.prices) * 100) / 100,
    maxPrice: Math.round(Math.max(...stats.prices) * 100) / 100,
    count: stats.prices.length,
    lastDate: stats.lastDate.toISOString(),
  }));

  merchantStats.sort((a, b) => a.avgPrice - b.avgPrice);

  return {
    normalizedName,
    displayName,
    merchantStats,
    priceHistory,
  };
}

// ---------------------------------------------------------------------------
// Individual Items — per raw item name, no grouping
// ---------------------------------------------------------------------------

export async function getIndividualItemSummaries(
  options: PriceAnalysisFilters = {},
): Promise<ItemPriceSummary[]> {
  const { search, sortBy = "totalPurchases", sortOrder = "desc" } = options;

  const items = await prisma.transactionItem.findMany({
    include: {
      transaction: {
        select: { merchant: true, date: true, id: true },
      },
    },
  });

  // Group by exact basicNormalize(name) — no group resolution
  const grouped = new Map<
    string,
    {
      rawName: string;
      prices: number[];
      merchants: Map<string, { prices: number[]; lastDate: Date }>;
      dates: Date[];
    }
  >();

  for (const item of items) {
    const key = basicNormalize(item.name);
    if (!key) continue;
    if (search && !key.includes(search.toLowerCase()) && !item.name.toLowerCase().includes(search.toLowerCase())) continue;

    let entry = grouped.get(key);
    if (!entry) {
      entry = {
        rawName: item.name,
        prices: [],
        merchants: new Map(),
        dates: [],
      };
      grouped.set(key, entry);
    }

    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);
    entry.prices.push(price);
    entry.dates.push(item.transaction.date);

    const merchant = item.transaction.merchant || "Unknown";
    let mStats = entry.merchants.get(merchant);
    if (!mStats) {
      mStats = { prices: [], lastDate: item.transaction.date };
      entry.merchants.set(merchant, mStats);
    }
    mStats.prices.push(price);
    if (item.transaction.date > mStats.lastDate) {
      mStats.lastDate = item.transaction.date;
    }
  }

  const summaries: ItemPriceSummary[] = [];

  for (const [normalizedName, data] of grouped) {
    const avg = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    const min = Math.min(...data.prices);
    const max = Math.max(...data.prices);
    const lastDate = new Date(Math.max(...data.dates.map((d) => d.getTime())));

    let cheapestMerchant: string | null = null;
    let cheapestAvg = Infinity;
    for (const [merchant, mStats] of data.merchants) {
      const mAvg = mStats.prices.reduce((a, b) => a + b, 0) / mStats.prices.length;
      if (mAvg < cheapestAvg) {
        cheapestAvg = mAvg;
        cheapestMerchant = merchant;
      }
    }

    let priceChangePercent: number | null = null;
    if (data.prices.length >= 4) {
      const sorted = [...data.dates]
        .map((d, i) => ({ date: d, price: data.prices[i] }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const mid = Math.floor(sorted.length / 2);
      const firstAvg = sorted.slice(0, mid).reduce((s, p) => s + p.price, 0) / mid;
      const secondAvg = sorted.slice(mid).reduce((s, p) => s + p.price, 0) / (sorted.length - mid);
      if (firstAvg > 0) {
        priceChangePercent = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
      }
    }

    summaries.push({
      normalizedName,
      displayName: data.rawName,
      isGroup: false,
      rawNames: [data.rawName],
      merchantNames: Array.from(data.merchants.keys()),
      avgPrice: Math.round(avg * 100) / 100,
      minPrice: Math.round(min * 100) / 100,
      maxPrice: Math.round(max * 100) / 100,
      totalPurchases: data.prices.length,
      cheapestMerchant,
      lastDate: lastDate.toISOString(),
      priceChangePercent,
    });
  }

  summaries.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "name": cmp = a.normalizedName.localeCompare(b.normalizedName); break;
      case "avgPrice": cmp = a.avgPrice - b.avgPrice; break;
      case "totalPurchases": cmp = a.totalPurchases - b.totalPurchases; break;
      case "lastDate": cmp = new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime(); break;
    }
    return sortOrder === "desc" ? -cmp : cmp;
  });

  return summaries;
}

// ---------------------------------------------------------------------------
// Individual Item Detail — price history for one specific raw item name
// ---------------------------------------------------------------------------

export async function getIndividualItemDetail(
  rawName: string,
): Promise<ItemDetail | null> {
  const key = basicNormalize(rawName);

  const items = await prisma.transactionItem.findMany({
    where: { normalizedName: key },
    include: {
      transaction: {
        select: { merchant: true, date: true, id: true },
      },
    },
  });

  if (items.length === 0) return null;

  const merchantMap = new Map<string, { prices: number[]; lastDate: Date }>();
  const priceHistory: ItemDetail["priceHistory"] = [];

  for (const item of items) {
    const price = getEffectivePrice(item.unitPrice, item.totalPrice, item.quantity);
    const merchant = item.transaction.merchant || "Unknown";

    let mStats = merchantMap.get(merchant);
    if (!mStats) {
      mStats = { prices: [], lastDate: item.transaction.date };
      merchantMap.set(merchant, mStats);
    }
    mStats.prices.push(price);
    if (item.transaction.date > mStats.lastDate) {
      mStats.lastDate = item.transaction.date;
    }

    priceHistory.push({
      date: item.transaction.date.toISOString(),
      price: Math.round(price * 100) / 100,
      merchant,
      transactionId: item.transaction.id,
    });
  }

  priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const merchantStats = Array.from(merchantMap.entries()).map(([merchant, stats]) => ({
    merchant,
    avgPrice: Math.round((stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length) * 100) / 100,
    minPrice: Math.round(Math.min(...stats.prices) * 100) / 100,
    maxPrice: Math.round(Math.max(...stats.prices) * 100) / 100,
    count: stats.prices.length,
    lastDate: stats.lastDate.toISOString(),
  }));

  merchantStats.sort((a, b) => a.avgPrice - b.avgPrice);

  return {
    normalizedName: key,
    displayName: items[0].name,
    merchantStats,
    priceHistory,
  };
}

// ---------------------------------------------------------------------------
// Backfill normalizedNames
// ---------------------------------------------------------------------------

export async function backfillNormalizedNames(): Promise<{ success: true; count: number }> {
  const items = await prisma.transactionItem.findMany({
    select: { id: true, name: true },
  });

  const { map: groupMap } = await buildGroupMap();

  let count = 0;
  // Batch update in chunks of 50
  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(
      batch.map((item) =>
        prisma.transactionItem.update({
          where: { id: item.id },
          data: { normalizedName: resolveItemName(item.name, groupMap, false) },
        }),
      ),
    );
    count += batch.length;
  }

  revalidatePath("/price-analysis");
  return { success: true, count };
}

// ---------------------------------------------------------------------------
// AI Normalize
// ---------------------------------------------------------------------------

export async function normalizeItemNamesWithAI(): Promise<
  { success: true; groupsCreated: number } | { error: string }
> {
  const settings = await prisma.appSettings.findFirst({ where: { id: "default" } });
  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  // Get distinct item names
  const items = await prisma.transactionItem.findMany({
    select: { name: true },
    distinct: ["name"],
  });

  const names = items.map((i) => i.name);
  if (names.length === 0) {
    return { error: "No items found to normalize." };
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.itemNormalizer);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Group these product names:\n${names.map((n) => `- ${n}`).join("\n")}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { error: "No response from AI" };

    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as {
      groups: { canonical: string; members: string[] }[];
    };

    if (!Array.isArray(parsed.groups)) {
      return { error: "AI returned an unexpected format" };
    }

    let groupsCreated = 0;

    for (const group of parsed.groups) {
      if (!group.canonical || !Array.isArray(group.members) || group.members.length === 0) continue;

      await prisma.itemGroup.upsert({
        where: { canonicalName: group.canonical },
        create: {
          canonicalName: group.canonical,
          rawNames: group.members,
          source: "ai",
        },
        update: {
          rawNames: group.members,
          source: "ai",
        },
      });
      groupsCreated++;
    }

    // Backfill normalizedNames with new groups
    await backfillNormalizedNames();

    revalidatePath("/price-analysis");
    return { success: true, groupsCreated };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI normalization failed: ${msg}` };
  }
}

// ---------------------------------------------------------------------------
// ItemGroup CRUD
// ---------------------------------------------------------------------------

export async function getItemGroups(): Promise<ItemGroupData[]> {
  const groups = await prisma.itemGroup.findMany({
    orderBy: { canonicalName: "asc" },
  });
  return groups.map((g) => ({
    id: g.id,
    canonicalName: g.canonicalName,
    rawNames: g.rawNames,
    source: g.source,
  }));
}

export async function updateItemGroup(
  id: string,
  data: Record<string, unknown>,
): Promise<{ success: true } | { error: string }> {
  const parsed = itemGroupUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
  }

  await prisma.itemGroup.update({
    where: { id },
    data: {
      canonicalName: parsed.data.canonicalName,
      rawNames: parsed.data.rawNames,
      source: "manual",
    },
  });

  await backfillNormalizedNames();
  revalidatePath("/price-analysis");
  return { success: true };
}

export async function createItemGroup(
  data: Record<string, unknown>,
): Promise<{ success: true } | { error: string }> {
  const parsed = itemGroupUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
  }

  const existing = await prisma.itemGroup.findUnique({
    where: { canonicalName: parsed.data.canonicalName },
  });
  if (existing) {
    return { error: "A group with this name already exists." };
  }

  await prisma.itemGroup.create({
    data: {
      canonicalName: parsed.data.canonicalName,
      rawNames: parsed.data.rawNames,
      source: "manual",
    },
  });

  await backfillNormalizedNames();
  revalidatePath("/price-analysis");
  return { success: true };
}

export async function deleteItemGroup(id: string): Promise<{ success: true } | { error: string }> {
  await prisma.itemGroup.delete({ where: { id } });
  await backfillNormalizedNames();
  revalidatePath("/price-analysis");
  return { success: true };
}
