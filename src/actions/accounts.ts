"use server";

import { prisma } from "@/lib/db";
import { accountCreateSchema, accountUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  return prisma.account.findMany({ orderBy: { name: "asc" } });
}

export async function getAccountsWithStats() {
  const accounts = await prisma.account.findMany({
    include: {
      _count: {
        select: { transactions: { where: { mergedIntoId: null } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const totals = await prisma.transaction.groupBy({
    by: ["accountId"],
    _sum: { amount: true },
    where: { amount: { not: null }, mergedIntoId: null },
  });

  const totalMap = new Map(
    totals.map((t) => [t.accountId, Number(t._sum.amount ?? 0)])
  );

  return accounts.map((acc) => ({
    ...acc,
    transactionCount: acc._count.transactions,
    totalAmount: Math.round((totalMap.get(acc.id) ?? 0) * 100) / 100,
  }));
}

export async function createAccount(data: Record<string, unknown>) {
  const parsed = accountCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.account.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: { name: ["Account already exists"] } };
  }

  await prisma.account.create({ data: parsed.data });

  revalidatePath("/accounts");
  revalidatePath("/");
  return { success: true };
}

export async function updateAccount(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = accountUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.account.findFirst({
      where: { name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Account already exists"] } };
    }
  }

  await prisma.account.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/accounts");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAccount(id: string, reassignToId: string) {
  const account = await prisma.account.findUnique({
    where: { id },
    include: { _count: { select: { transactions: true } } },
  });

  if (!account) {
    return { error: "Account not found" };
  }

  if (!reassignToId) {
    return { error: "Must reassign transactions to another account" };
  }

  const target = await prisma.account.findUnique({
    where: { id: reassignToId },
  });
  if (!target) {
    return { error: "Target account not found" };
  }

  if (account._count.transactions > 0) {
    await prisma.transaction.updateMany({
      where: { accountId: id },
      data: { accountId: reassignToId },
    });
  }

  await prisma.account.delete({ where: { id } });

  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}
