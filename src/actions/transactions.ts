"use server";

import { prisma } from "@/lib/db";
import type {
  TransactionFilters,
  PaginatedResult,
  TransactionWithCategory,
} from "@/lib/types";
import {
  transactionUpdateSchema,
  transactionCreateSchema,
} from "@/lib/validators";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSettings } from "@/actions/settings";

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<PaginatedResult<TransactionWithCategory>> {
  const {
    dateFrom,
    dateTo,
    categoryId,
    accountId,
    type,
    merchant,
    tagIds,
    amountMin,
    amountMax,
    search,
    source,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const where: Prisma.TransactionWhereInput = { mergedIntoId: null };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (type) where.type = type;
  if (merchant) {
    where.merchant = { contains: merchant, mode: "insensitive" };
  }
  if (tagIds && tagIds.length > 0) {
    where.tags = { some: { tagId: { in: tagIds } } };
  }
  if (amountMin !== undefined || amountMax !== undefined) {
    where.amount = {};
    if (amountMin !== undefined) where.amount.gte = amountMin;
    if (amountMax !== undefined) where.amount.lte = amountMax;
  }
  if (search) {
    where.OR = [
      { merchant: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (source) {
    where.source = source;
  }

  const validSortFields = ["date", "amount", "type", "merchant"];
  const primarySort: Prisma.TransactionOrderByWithRelationInput = {};
  if (validSortFields.includes(sortBy)) {
    (primarySort as Record<string, string>)[sortBy] = sortOrder;
  } else {
    primarySort.date = "desc";
  }

  // Always sort by date+time together for consistent ordering
  const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
    sortBy === "date"
      ? [{ date: sortOrder }, { time: sortOrder }]
      : [primarySort, { date: "desc" }, { time: "desc" }];

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        tags: { include: { tag: true } },
        splits: { include: { category: true, person: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: data.map((tx) => ({
      ...tx,
      amount: tx.amount != null ? Number(tx.amount) : null,
      tags: tx.tags.map((tt) => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: tt.tag.color,
      })),
      splits: tx.splits.map((s) => ({
        id: s.id,
        categoryId: s.categoryId,
        categoryName: s.category?.name ?? null,
        categoryColor: s.category?.color ?? null,
        personId: s.personId,
        personName: s.person?.name ?? null,
        personColor: s.person?.color ?? null,
        amount: Number(s.amount),
        description: s.description,
      })),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createTransaction(
  data: Record<string, unknown>,
): Promise<{ success: true } | { error: Record<string, string[]> }> {
  const parsed = transactionCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  const tx = await prisma.transaction.create({
    data: {
      date: values.date,
      time: values.time ?? null,
      amount: values.amount ?? null,
      currency: values.currency,
      type: values.type,
      categoryId: values.categoryId ?? null,
      accountId: values.accountId,
      merchant: values.merchant ?? null,
      description: values.description ?? null,
      source: "manual",
    },
  });

  if (values.tagIds && values.tagIds.length > 0) {
    await prisma.transactionTag.createMany({
      data: values.tagIds.map((tagId) => ({ transactionId: tx.id, tagId })),
    });
  }

  // Check anomaly and send Telegram alert for web-created transactions
  if (values.type === "expense" && values.amount && values.amount > 0) {
    const settings = await getSettings();
    const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
    const botToken = settings.telegramBotToken || undefined;
    if (chatId) {
      const warning = await checkTransactionAnomaly(
        values.amount,
        values.categoryId ?? null,
        values.merchant ?? null,
      );
      if (warning) {
        const merchant = values.merchant ? ` at ${values.merchant}` : "";
        await sendTelegramMessage(
          chatId,
          `🔍 Web transaction alert: ${values.amount} AED${merchant}${warning}`,
          undefined,
          botToken,
        );
      }
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(
  id: string,
  data: Record<string, unknown>,
) {
  const parsed = transactionUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const updateData: Prisma.TransactionUpdateInput = {};
  const values = parsed.data;

  if (values.amount !== undefined) {
    updateData.amount = values.amount;
  }
  if (values.type !== undefined) {
    updateData.type = values.type;
  }
  if (values.categoryId !== undefined) {
    if (values.categoryId === null) {
      updateData.category = { disconnect: true };
    } else {
      updateData.category = { connect: { id: values.categoryId } };
    }
  }
  if (values.accountId !== undefined) {
    updateData.account = { connect: { id: values.accountId } };
  }
  if (values.merchant !== undefined) {
    updateData.merchant = values.merchant;
  }
  if (values.description !== undefined) {
    updateData.description = values.description;
  }

  await prisma.transaction.update({
    where: { id },
    data: updateData,
  });

  if (values.tagIds !== undefined) {
    await prisma.transactionTag.deleteMany({ where: { transactionId: id } });
    if (values.tagIds.length > 0) {
      await prisma.transactionTag.createMany({
        data: values.tagIds.map((tagId) => ({ transactionId: id, tagId })),
      });
    }
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransactions(
  ids: string[],
): Promise<{ success: true; count: number } | { error: string }> {
  if (!ids.length) return { error: "No IDs provided" };
  if (ids.length > 100) return { error: "Too many IDs (max 100)" };

  const { count } = await prisma.transaction.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true, count };
}

export async function splitTransaction(
  transactionId: string,
  data: { splits: { categoryId: string | null; personId?: string | null; amount: number; description: string | null }[] },
) {
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx) return { error: "Transaction not found" };

  const txAmount = Number(tx.amount ?? 0);
  const splitTotal = data.splits.reduce((sum, s) => sum + s.amount, 0);

  // Allow small floating-point difference
  if (Math.abs(txAmount - splitTotal) > 0.01) {
    return { error: `Split total (${splitTotal}) does not match transaction amount (${txAmount})` };
  }

  if (data.splits.length < 2) {
    return { error: "Need at least 2 splits" };
  }

  // Delete existing splits
  await prisma.transactionSplit.deleteMany({ where: { transactionId } });

  // Create new splits
  await prisma.transactionSplit.createMany({
    data: data.splits.map((s) => ({
      transactionId,
      categoryId: s.categoryId,
      personId: s.personId ?? null,
      amount: s.amount,
      description: s.description,
    })),
  });

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function unsplitTransaction(transactionId: string) {
  await prisma.transactionSplit.deleteMany({ where: { transactionId } });
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getAccountsList() {
  return prisma.account.findMany({ orderBy: { name: "asc" } });
}
