"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { accountCreateSchema, accountUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";

export async function getAccounts() {
  const userId = await requireAuth();
  return prisma.account.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function getAccountsWithStats() {
  const userId = await requireAuth();
  const [accounts, settings, rates] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: { where: { mergedIntoId: null, confirmed: true } } },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.appSettings.findFirst({ where: { userId } }),
    getCurrencyRates(),
  ]);

  const primaryCurrency = settings?.currency ?? "AED";

  const transactions = await prisma.transaction.findMany({
    where: { userId, amount: { not: null }, mergedIntoId: null, confirmed: true },
    select: { accountId: true, amount: true, currency: true },
  });

  const totalMap = new Map<string, number>();
  for (const t of transactions) {
    const converted = convertAmount(Number(t.amount), t.currency, primaryCurrency, rates);
    totalMap.set(t.accountId, (totalMap.get(t.accountId) ?? 0) + converted);
  }

  return accounts.map((acc) => ({
    ...acc,
    transactionCount: acc._count.transactions,
    totalAmount: Math.round((totalMap.get(acc.id) ?? 0) * 100) / 100,
  }));
}

export async function createAccount(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = accountCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.account.findUnique({
    where: { userId_name: { userId, name: parsed.data.name } },
  });
  if (existing) {
    return { error: { name: ["Account already exists"] } };
  }

  await prisma.account.create({ data: { ...parsed.data, userId } });

  revalidatePath("/accounts");
  revalidatePath("/");
  return { success: true };
}

export async function updateAccount(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = accountUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.account.findFirst({
      where: { userId, name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Account already exists"] } };
    }
  }

  await prisma.account.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/accounts");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAccount(id: string, reassignToId: string) {
  const userId = await requireAuth();
  const account = await prisma.account.findUnique({
    where: { id, userId },
    include: { _count: { select: { transactions: true } } },
  });

  if (!account) {
    return { error: "Account not found" };
  }

  if (!reassignToId) {
    return { error: "Must reassign transactions to another account" };
  }

  const target = await prisma.account.findUnique({
    where: { id: reassignToId, userId },
  });
  if (!target) {
    return { error: "Target account not found" };
  }

  if (account._count.transactions > 0) {
    await prisma.transaction.updateMany({
      where: { accountId: id, userId },
      data: { accountId: reassignToId },
    });
  }

  await prisma.account.delete({ where: { id, userId } });

  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}
