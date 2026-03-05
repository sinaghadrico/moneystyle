"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export type MergeSuggestion = {
  key: string;
  date: Date;
  amount: number | null;
  merchant: string | null;
  transactions: {
    id: string;
    date: Date;
    time: string | null;
    amount: number | null;
    type: string;
    merchant: string | null;
    description: string | null;
    source: string | null;
    mediaFiles: string[];
    categoryName: string | null;
    categoryColor: string | null;
  }[];
};

export async function getMergeSuggestions(): Promise<MergeSuggestion[]> {
  const userId = await requireAuth();

  // Find groups with same date + same amount + same merchant (strongest signal)
  const groups = await prisma.$queryRaw<
    { date: Date; amount: string | null; merchant: string | null; cnt: bigint }[]
  >`
    SELECT date, amount::text, merchant, COUNT(*) as cnt
    FROM transactions
    WHERE "mergedIntoId" IS NULL
      AND amount IS NOT NULL
      AND merchant IS NOT NULL
      AND "userId" = ${userId}
    GROUP BY date, amount, merchant
    HAVING COUNT(*) > 1
    ORDER BY date DESC
  `;

  const suggestions: MergeSuggestion[] = [];

  for (const g of groups) {
    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        date: g.date,
        amount: g.amount ? parseFloat(g.amount) : undefined,
        merchant: g.merchant,
        mergedIntoId: null,
      },
      include: { category: true, account: true },
      orderBy: { time: "asc" },
    });

    if (txs.length < 2) continue;

    suggestions.push({
      key: `${g.date.toISOString().slice(0, 10)}_${g.amount}_${g.merchant}`,
      date: g.date,
      amount: g.amount ? parseFloat(g.amount) : null,
      merchant: g.merchant,
      transactions: txs.map((t) => ({
        id: t.id,
        date: t.date,
        time: t.time,
        amount: t.amount ? Number(t.amount) : null,
        type: t.type,
        merchant: t.merchant,
        description: t.description,
        source: t.source,
        mediaFiles: t.mediaFiles,
        categoryName: t.category?.name ?? null,
        categoryColor: t.category?.color ?? null,
      })),
    });
  }

  return suggestions;
}

export async function mergeTransactions(
  primaryId: string,
  mergeIds: string[]
) {
  if (mergeIds.length === 0) {
    return { error: "No transactions to merge" };
  }

  const userId = await requireAuth();

  if (mergeIds.includes(primaryId)) {
    return { error: "Primary cannot be in merge list" };
  }

  const primary = await prisma.transaction.findUnique({
    where: { id: primaryId, userId },
  });
  if (!primary) {
    return { error: "Primary transaction not found" };
  }

  const toMerge = await prisma.transaction.findMany({
    where: { id: { in: mergeIds }, userId, mergedIntoId: null },
  });

  if (toMerge.length === 0) {
    return { error: "No valid transactions to merge" };
  }

  // Collect all media files (deduplicated)
  const allMedia = new Set(primary.mediaFiles);
  for (const t of toMerge) {
    for (const f of t.mediaFiles) {
      allMedia.add(f);
    }
  }

  // Combine descriptions (unique, non-empty)
  const descriptions = new Set<string>();
  if (primary.description) descriptions.add(primary.description);
  for (const t of toMerge) {
    if (t.description && !descriptions.has(t.description)) {
      descriptions.add(t.description);
    }
  }
  const mergedDescription =
    descriptions.size > 0 ? Array.from(descriptions).join(" | ") : null;

  // Combine items (unique, non-empty)
  const itemsSet = new Set<string>();
  if (primary.items) itemsSet.add(primary.items);
  for (const t of toMerge) {
    if (t.items && !itemsSet.has(t.items)) {
      itemsSet.add(t.items);
    }
  }
  const mergedItems =
    itemsSet.size > 0 ? Array.from(itemsSet).join(" | ") : null;

  // Merge: combine everything into primary, mark others as merged
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: primaryId, userId },
      data: {
        mediaFiles: Array.from(allMedia),
        description: mergedDescription,
        items: mergedItems,
        hasReceipt: primary.hasReceipt || toMerge.some((t) => t.hasReceipt),
      },
    }),
    // Mark all others as merged into primary
    prisma.transaction.updateMany({
      where: { id: { in: mergeIds }, userId },
      data: { mergedIntoId: primaryId },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/merge-suggestions");
  return { success: true, mergedCount: toMerge.length };
}

export async function skipSuggestion(ids: string[]) {
  await requireAuth();
  // No-op for now — just used to advance the UI.
  // Could persist skipped groups in the future.
  return { success: true };
}
