"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  incomeSourceSchema,
  incomeSourceUpdateSchema,
  recordIncomeDepositSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type {
  IncomeSourceData,
  IncomeDepositData,
  SuggestedTransaction,
} from "@/lib/types";

// ── Income Sources ──

export async function getIncomeSources(): Promise<IncomeSourceData[]> {
  const userId = await requireAuth();
  const rows = await prisma.incomeSource.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      deposits: {
        orderBy: { receivedAt: "desc" },
        take: 1,
        select: { receivedAt: true },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    depositDay: r.depositDay,
    currency: r.currency,
    isActive: r.isActive,
    lastReceivedAt: r.deposits[0]?.receivedAt?.toISOString() ?? null,
  }));
}

export async function createIncomeSource(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = incomeSourceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.incomeSource.create({ data: { ...parsed.data, userId } });
  } catch (err) {
    console.error("Failed to create income source:", err);
    return { error: "Failed to create income source. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function updateIncomeSource(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = incomeSourceUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.incomeSource.update({ where: { id, userId }, data: parsed.data });
  } catch (err) {
    console.error("Failed to update income source:", err);
    return { error: "Failed to update income source. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteIncomeSource(id: string) {
  const userId = await requireAuth();
  try {
    await prisma.incomeSource.delete({ where: { id, userId } });
  } catch (err) {
    console.error("Failed to delete income source:", err);
    return { error: "Failed to delete income source. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

// ── Income Deposits ──

export async function recordIncomeDeposit(
  incomeSourceId: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = recordIncomeDepositSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const source = await prisma.incomeSource.findUnique({ where: { id: incomeSourceId, userId } });
  if (!source) return { error: "Income source not found" };

  try {
    await prisma.incomeDeposit.create({
      data: {
        incomeSourceId,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
        transactionId: parsed.data.transactionId ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record income deposit:", err);
    return { error: "Failed to record deposit. Please try again." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function getIncomeDepositHistory(
  incomeSourceId: string
): Promise<IncomeDepositData[]> {
  const userId = await requireAuth();
  const source = await prisma.incomeSource.findUnique({ where: { id: incomeSourceId, userId } });
  if (!source) return [];
  const rows = await prisma.incomeDeposit.findMany({
    where: { incomeSourceId },
    orderBy: { receivedAt: "desc" },
    include: { transaction: { select: { id: true, merchant: true, date: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    receivedAt: r.receivedAt.toISOString(),
    transactionId: r.transactionId,
    transactionMerchant: r.transaction?.merchant ?? null,
    transactionDate: r.transaction?.date?.toISOString() ?? null,
  }));
}

export async function getSuggestedIncomeTransactions(
  incomeSourceId: string
): Promise<SuggestedTransaction[]> {
  const userId = await requireAuth();
  const source = await prisma.incomeSource.findUnique({ where: { id: incomeSourceId, userId } });
  if (!source) return [];

  const amount = Number(source.amount);
  const currency = source.currency;
  const depositDay = source.depositDay;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "income",
      currency,
      date: { gte: threeMonthsAgo },
      mergedIntoId: null,
      confirmed: true,
      installmentPayment: null,
      billPayment: null,
      incomeDeposit: null,
    },
    orderBy: { date: "desc" },
    take: 50,
    select: { id: true, date: true, amount: true, currency: true, merchant: true, description: true },
  });

  const lowerBound = amount * 0.9;
  const upperBound = amount * 1.1;

  return transactions.map((tx) => {
    const txAmount = Number(tx.amount ?? 0);
    const amountMatch = txAmount >= lowerBound && txAmount <= upperBound;
    const txDay = tx.date.getDate();
    const dateMatch = Math.abs(txDay - depositDay) <= 5 || Math.abs(txDay - depositDay) >= 26;

    return {
      id: tx.id,
      date: tx.date.toISOString(),
      amount: txAmount,
      currency: tx.currency,
      merchant: tx.merchant,
      description: tx.description,
      isSuggested: amountMatch && dateMatch,
    };
  });
}
