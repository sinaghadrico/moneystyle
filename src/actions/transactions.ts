"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import type {
  TransactionFilters,
  PaginatedResult,
  TransactionWithCategory,
  TransactionItemData,
} from "@/lib/types";
import {
  transactionUpdateSchema,
  transactionCreateSchema,
  saveTransactionItemsSchema,
} from "@/lib/validators";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSettings } from "@/actions/settings";
import {
  getNotificationTemplate,
  renderTemplate,
  NOTIFICATION_TEMPLATE_KEYS,
} from "@/lib/notification-templates";
import { storage } from "@/lib/storage";
import { basicNormalize } from "@/lib/item-normalization";

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
    confirmed,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = "date",
    sortOrder = "desc",
  } = filters;

  const userId = await requireAuth();

  const where: Prisma.TransactionWhereInput = { mergedIntoId: null, userId };

  if (confirmed !== undefined) {
    where.confirmed = confirmed;
  } else {
    where.confirmed = true;
  }

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
      { id: { equals: search } },
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
        installmentPayment: { include: { installment: { select: { id: true, name: true } } } },
        billPayment: { include: { bill: { select: { id: true, name: true } } } },
        incomeDeposit: { include: { incomeSource: { select: { id: true, name: true } } } },
        _count: { select: { lineItems: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: data.map((tx) => {
      let paymentLink = null;
      if (tx.installmentPayment) {
        paymentLink = {
          type: "installment" as const,
          paymentId: tx.installmentPayment.id,
          parentId: tx.installmentPayment.installment.id,
          parentName: tx.installmentPayment.installment.name,
        };
      } else if (tx.billPayment) {
        paymentLink = {
          type: "bill" as const,
          paymentId: tx.billPayment.id,
          parentId: tx.billPayment.bill.id,
          parentName: tx.billPayment.bill.name,
        };
      } else if (tx.incomeDeposit) {
        paymentLink = {
          type: "income" as const,
          paymentId: tx.incomeDeposit.id,
          parentId: tx.incomeDeposit.incomeSource.id,
          parentName: tx.incomeDeposit.incomeSource.name,
        };
      }
      return {
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
        lineItemCount: tx._count.lineItems,
        paymentLink,
      };
    }),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createTransaction(
  data: Record<string, unknown>,
): Promise<{ success: true } | { error: Record<string, string[]> }> {
  const userId = await requireAuth();

  const parsed = transactionCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  const tx = await prisma.transaction.create({
    data: {
      userId,
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
      spreadMonths: values.spreadMonths ?? null,
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
    if (chatId && settings.notifyWebTransaction) {
      const warning = await checkTransactionAnomaly(
        values.amount,
        values.categoryId ?? null,
        values.merchant ?? null,
      );
      if (warning) {
        const tpl = await getNotificationTemplate(
          NOTIFICATION_TEMPLATE_KEYS.webTransactionAlert,
        );
        const msg = renderTemplate(tpl, {
          amount: values.amount,
          merchant: values.merchant ? ` at ${values.merchant}` : "",
          warning,
        });
        await sendTelegramMessage(chatId, msg, undefined, botToken);
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
  const userId = await requireAuth();

  const parsed = transactionUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const updateData: Prisma.TransactionUpdateInput = {};
  const values = parsed.data;

  if (values.amount !== undefined) {
    updateData.amount = values.amount;
  }
  if (values.currency !== undefined) {
    updateData.currency = values.currency;
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
  if (values.spreadMonths !== undefined) {
    updateData.spreadMonths = values.spreadMonths;
  }

  await prisma.transaction.update({
    where: { id, userId },
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
  const userId = await requireAuth();

  if (!ids.length) return { error: "No IDs provided" };
  if (ids.length > 100) return { error: "Too many IDs (max 100)" };

  const { count } = await prisma.transaction.deleteMany({
    where: { id: { in: ids }, userId },
  });

  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true, count };
}

export async function splitTransaction(
  transactionId: string,
  data: { splits: { categoryId: string | null; personId?: string | null; amount: number; description: string | null }[] },
  overrideUserId?: string,
) {
  const userId = overrideUserId ?? await requireAuth();

  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
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
  const userId = await requireAuth();

  // Verify ownership before deleting splits
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
  if (!tx) return { error: "Transaction not found" };

  await prisma.transactionSplit.deleteMany({ where: { transactionId } });
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}

export async function getCategories() {
  const userId = await requireAuth();
  return prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function getAccountsList() {
  const userId = await requireAuth();
  return prisma.account.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function getTransactionItems(
  transactionId: string,
): Promise<TransactionItemData[]> {
  const userId = await requireAuth();

  // Verify ownership
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
  if (!tx) return [];

  const items = await prisma.transactionItem.findMany({
    where: { transactionId },
    orderBy: { sortOrder: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  }));
}

export async function saveTransactionItems(
  transactionId: string,
  items: { name: string; quantity: number; unitPrice?: number | null; totalPrice: number }[],
) {
  const userId = await requireAuth();

  const parsed = saveTransactionItemsSchema.safeParse({ transactionId, items });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
  if (!tx) return { error: "Transaction not found" };

  // Delete existing items then bulk create (same pattern as splitTransaction)
  await prisma.transactionItem.deleteMany({ where: { transactionId } });

  if (items.length > 0) {
    await prisma.transactionItem.createMany({
      data: items.map((item, idx) => ({
        transactionId,
        name: item.name,
        normalizedName: basicNormalize(item.name),
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? null,
        totalPrice: item.totalPrice,
        sortOrder: idx,
      })),
    });
  }

  revalidatePath("/transactions");
  return { success: true };
}

export async function addTransactionMedia(
  transactionId: string,
  filePath: string,
): Promise<{ success: true } | { error: string }> {
  const userId = await requireAuth();

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId, userId },
    select: { mediaFiles: true },
  });
  if (!tx) return { error: "Transaction not found" };

  await prisma.transaction.update({
    where: { id: transactionId, userId },
    data: {
      mediaFiles: { push: filePath },
      hasReceipt: true,
    },
  });

  revalidatePath("/transactions");
  return { success: true };
}

export async function removeTransactionMedia(
  transactionId: string,
  filePath: string,
): Promise<{ success: true } | { error: string }> {
  const userId = await requireAuth();

  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId, userId },
    select: { mediaFiles: true },
  });
  if (!tx) return { error: "Transaction not found" };

  const updated = tx.mediaFiles.filter((f) => f !== filePath);

  await prisma.transaction.update({
    where: { id: transactionId, userId },
    data: {
      mediaFiles: updated,
      hasReceipt: updated.length > 0,
    },
  });

  // Delete from storage (best-effort)
  try {
    await storage.delete(filePath);
  } catch {
    // File may not exist in storage (legacy files)
  }

  revalidatePath("/transactions");
  return { success: true };
}

export async function confirmTransactions(ids: string[]) {
  const userId = await requireAuth();
  if (!ids.length) return { count: 0 };

  const result = await prisma.transaction.updateMany({
    where: { id: { in: ids }, userId },
    data: { confirmed: true },
  });

  revalidatePath("/transactions");
  return { count: result.count };
}

export async function getUnconfirmedCount() {
  const userId = await requireAuth();
  return prisma.transaction.count({
    where: { userId, confirmed: false, mergedIntoId: null },
  });
}
