"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";

export type NetWorthData = {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    accounts: number;
    reserves: number;
    installmentsOwed: number;
  };
};

async function getPrimaryCurrency(userId: string): Promise<string> {
  const settings = await prisma.appSettings.findFirst({ where: { userId } });
  return settings?.currency ?? "AED";
}

export async function getNetWorthData(): Promise<NetWorthData> {
  const userId = await requireAuth();

  const [primaryCurrency, rates] = await Promise.all([
    getPrimaryCurrency(userId),
    getCurrencyRates(),
  ]);

  // Compute net account balances from transactions (income - expense)
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      mergedIntoId: null,
      confirmed: true,
      amount: { not: null },
      type: { in: ["income", "expense"] },
    },
    select: { amount: true, currency: true, type: true },
  });

  let accountsTotal = 0;
  for (const t of transactions) {
    const amt = convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
    accountsTotal += t.type === "income" ? amt : -amt;
  }

  // Get all reserves (cash, gold, crypto, stocks, etc.)
  const reserves = await prisma.reserve.findMany({
    where: { userId },
    select: { amount: true, currency: true },
  });
  let reservesTotal = 0;
  for (const r of reserves) {
    reservesTotal += convertAmount(Number(r.amount ?? 0), r.currency, primaryCurrency, rates);
  }

  // Get remaining installment amounts (liabilities)
  // Installment has: amount (per installment), totalCount (nullable), paidCount
  // Remaining = amount * max(0, (totalCount - paidCount))
  const installments = await prisma.installment.findMany({
    where: { userId, isActive: true },
    select: { amount: true, currency: true, totalCount: true, paidCount: true },
  });
  let installmentsOwed = 0;
  for (const i of installments) {
    const remaining = Math.max(0, (i.totalCount ?? 0) - i.paidCount);
    installmentsOwed += convertAmount(
      Number(i.amount ?? 0) * remaining,
      i.currency,
      primaryCurrency,
      rates
    );
  }

  const totalAssets = accountsTotal + reservesTotal;
  const totalLiabilities = installmentsOwed;
  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets: Math.round(totalAssets * 100) / 100,
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,
    netWorth: Math.round(netWorth * 100) / 100,
    breakdown: {
      accounts: Math.round(accountsTotal * 100) / 100,
      reserves: Math.round(reservesTotal * 100) / 100,
      installmentsOwed: Math.round(installmentsOwed * 100) / 100,
    },
  };
}
