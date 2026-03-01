import { prisma } from "./db";

const ANOMALY_MULTIPLIER = 2.5;
const MIN_HISTORICAL_TXS = 3;

export async function checkTransactionAnomaly(
  amount: number,
  categoryId: string | null,
  merchant: string | null,
): Promise<string | null> {
  if (amount <= 0) return null;

  // Check by merchant first (more specific)
  if (merchant) {
    const merchantTxs = await prisma.transaction.findMany({
      where: {
        merchant: { equals: merchant, mode: "insensitive" },
        type: "expense",
        amount: { not: null },
        mergedIntoId: null,
      },
      select: { amount: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    if (merchantTxs.length >= MIN_HISTORICAL_TXS) {
      const avg =
        merchantTxs.reduce((s, t) => s + Number(t.amount ?? 0), 0) /
        merchantTxs.length;
      if (avg > 0 && amount > avg * ANOMALY_MULTIPLIER) {
        return `\n\n🔍 Unusual amount! ${amount.toLocaleString()} AED is ${(amount / avg).toFixed(1)}x your average of ${Math.round(avg).toLocaleString()} AED at ${merchant}.`;
      }
    }
  }

  // Check by category
  if (categoryId) {
    const catTxs = await prisma.transaction.findMany({
      where: {
        categoryId,
        type: "expense",
        amount: { not: null },
        mergedIntoId: null,
      },
      select: { amount: true },
      orderBy: { date: "desc" },
      take: 50,
    });

    if (catTxs.length >= MIN_HISTORICAL_TXS) {
      const avg =
        catTxs.reduce((s, t) => s + Number(t.amount ?? 0), 0) / catTxs.length;
      if (avg > 0 && amount > avg * ANOMALY_MULTIPLIER) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        return `\n\n🔍 Unusual amount! ${amount.toLocaleString()} AED is ${(amount / avg).toFixed(1)}x your average of ${Math.round(avg).toLocaleString()} AED in ${category?.name ?? "this category"}.`;
      }
    }
  }

  return null;
}
