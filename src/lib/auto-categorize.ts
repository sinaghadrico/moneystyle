import { prisma } from "./db";

/**
 * Resolve a category for a merchant name using:
 * 1. MerchantCategoryRule table (case-insensitive substring match)
 * 2. Historical transactions (most-used category for this merchant, min 2 past txs)
 * 3. Auto-create rule if learned from history
 */
export async function resolveCategory(
  merchant: string | null | undefined,
): Promise<string | null> {
  if (!merchant) return null;

  const lower = merchant.toLowerCase();

  // 1. Check merchant category rules
  const rules = await prisma.merchantCategoryRule.findMany();
  for (const rule of rules) {
    if (lower.includes(rule.pattern) || rule.pattern.includes(lower)) {
      return rule.categoryId;
    }
  }

  // 2. Learn from historical transactions
  const historicalTxs = await prisma.transaction.findMany({
    where: {
      merchant: { equals: merchant, mode: "insensitive" },
      categoryId: { not: null },
      mergedIntoId: null,
    },
    select: { categoryId: true },
  });

  if (historicalTxs.length >= 2) {
    // Count categories
    const catCounts = new Map<string, number>();
    for (const tx of historicalTxs) {
      if (tx.categoryId) {
        catCounts.set(tx.categoryId, (catCounts.get(tx.categoryId) ?? 0) + 1);
      }
    }

    // Find most-used category
    let bestCatId: string | null = null;
    let bestCount = 0;
    for (const [catId, count] of catCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestCatId = catId;
      }
    }

    if (bestCatId) {
      // Auto-create rule for next time
      try {
        await prisma.merchantCategoryRule.create({
          data: { pattern: lower, categoryId: bestCatId },
        });
      } catch {
        // Rule might already exist (race condition) — ignore
      }
      return bestCatId;
    }
  }

  return null;
}
