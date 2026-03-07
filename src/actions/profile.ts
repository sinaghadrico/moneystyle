"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  incomeSourceSchema,
  incomeSourceUpdateSchema,
  reserveSchema,
  reserveUpdateSchema,
  recordReserveValueSchema,
  recordInstallmentPaymentSchema,
  installmentSchema,
  installmentUpdateSchema,
  billSchema,
  billUpdateSchema,
  recordBillPaymentSchema,
  recordIncomeDepositSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import type {
  IncomeSourceData,
  ReserveData,
  ReserveSnapshotData,
  InstallmentData,
  InstallmentPaymentData,
  BillData,
  BillPaymentData,
  IncomeDepositData,
  FinancialOverview,
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
  await prisma.incomeSource.create({ data: { ...parsed.data, userId } });
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
  await prisma.incomeSource.update({ where: { id, userId }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteIncomeSource(id: string) {
  const userId = await requireAuth();
  await prisma.incomeSource.delete({ where: { id, userId } });
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

  await prisma.incomeDeposit.create({
    data: {
      incomeSourceId,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
      transactionId: parsed.data.transactionId ?? null,
    },
  });

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

// ── Reserves ──

export async function getReserves(): Promise<ReserveData[]> {
  const userId = await requireAuth();
  const rows = await prisma.reserve.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: {
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { recordedAt: true },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency,
    type: r.type,
    location: r.location,
    note: r.note,
    lastRecordedAt: r.snapshots[0]?.recordedAt?.toISOString() ?? null,
  }));
}

export async function createReserve(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = reserveSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const reserve = await prisma.reserve.create({ data: { ...parsed.data, userId } });
  await prisma.reserveSnapshot.create({
    data: {
      reserveId: reserve.id,
      amount: reserve.amount,
      note: "Initial value",
    },
  });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateReserve(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = reserveUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const existing = await prisma.reserve.findUnique({ where: { id, userId } });
  const updated = await prisma.reserve.update({
    where: { id, userId },
    data: parsed.data,
  });
  if (
    existing &&
    parsed.data.amount !== undefined &&
    Number(existing.amount) !== Number(updated.amount)
  ) {
    await prisma.reserveSnapshot.create({
      data: {
        reserveId: id,
        amount: updated.amount,
        note: "Updated via edit",
      },
    });
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteReserve(id: string) {
  const userId = await requireAuth();
  await prisma.reserve.delete({ where: { id, userId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function recordReserveValue(
  reserveId: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = recordReserveValueSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.$transaction([
    prisma.reserveSnapshot.create({
      data: {
        reserveId,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
      },
    }),
    prisma.reserve.update({
      where: { id: reserveId, userId },
      data: { amount: parsed.data.amount },
    }),
  ]);
  revalidatePath("/profile");
  return { success: true };
}

export async function getReserveHistory(
  reserveId: string
): Promise<ReserveSnapshotData[]> {
  const userId = await requireAuth();
  // Verify the reserve belongs to the user
  const reserve = await prisma.reserve.findUnique({ where: { id: reserveId, userId } });
  if (!reserve) return [];
  const rows = await prisma.reserveSnapshot.findMany({
    where: { reserveId },
    orderBy: { recordedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    recordedAt: r.recordedAt.toISOString(),
  }));
}

// ── Installments ──

export async function getInstallments(): Promise<InstallmentData[]> {
  const userId = await requireAuth();
  const rows = await prisma.installment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        orderBy: { paidAt: "desc" },
        take: 1,
        select: { paidAt: true },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency,
    dueDay: r.dueDay,
    totalCount: r.totalCount,
    paidCount: r.paidCount,
    isActive: r.isActive,
    reminderDays: r.reminderDays,
    paymentInstructions: r.paymentInstructions,
    lastPaidAt: r.payments[0]?.paidAt?.toISOString() ?? null,
  }));
}

export async function createInstallment(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = installmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.installment.create({ data: { ...parsed.data, userId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateInstallment(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = installmentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.installment.update({ where: { id, userId }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteInstallment(id: string) {
  const userId = await requireAuth();
  await prisma.installment.delete({ where: { id, userId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function incrementPaidCount(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = recordInstallmentPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const inst = await prisma.installment.findUnique({ where: { id, userId } });
  if (!inst) return { error: "Not found" };

  const newPaidCount = inst.paidCount + 1;
  const shouldDeactivate =
    inst.totalCount !== null && newPaidCount >= inst.totalCount;

  await prisma.$transaction([
    prisma.installmentPayment.create({
      data: {
        installmentId: id,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
        transactionId: parsed.data.transactionId ?? null,
      },
    }),
    prisma.installment.update({
      where: { id, userId },
      data: {
        paidCount: newPaidCount,
        isActive: shouldDeactivate ? false : inst.isActive,
      },
    }),
  ]);

  revalidatePath("/profile");
  return { success: true, completed: shouldDeactivate };
}

export async function getInstallmentHistory(
  installmentId: string
): Promise<InstallmentPaymentData[]> {
  const userId = await requireAuth();
  // Verify the installment belongs to the user
  const installment = await prisma.installment.findUnique({ where: { id: installmentId, userId } });
  if (!installment) return [];
  const rows = await prisma.installmentPayment.findMany({
    where: { installmentId },
    orderBy: { paidAt: "desc" },
    include: { transaction: { select: { id: true, merchant: true, date: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    paidAt: r.paidAt.toISOString(),
    transactionId: r.transactionId,
    transactionMerchant: r.transaction?.merchant ?? null,
    transactionDate: r.transaction?.date?.toISOString() ?? null,
  }));
}

// ── Bills ──

export async function getBills(): Promise<BillData[]> {
  const userId = await requireAuth();
  const rows = await prisma.bill.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        orderBy: { paidAt: "desc" },
        take: 1,
        select: { paidAt: true, amount: true },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    currency: r.currency,
    dueDay: r.dueDay,
    isActive: r.isActive,
    reminderDays: r.reminderDays,
    paymentInstructions: r.paymentInstructions,
    lastPaidAt: r.payments[0]?.paidAt?.toISOString() ?? null,
    lastPaidAmount: r.payments[0] ? Number(r.payments[0].amount) : null,
  }));
}

export async function createBill(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = billSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.bill.create({ data: { ...parsed.data, userId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateBill(id: string, data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = billUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.bill.update({ where: { id, userId }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteBill(id: string) {
  const userId = await requireAuth();
  await prisma.bill.delete({ where: { id, userId } });
  revalidatePath("/profile");
  return { success: true };
}

export async function recordBillPayment(
  billId: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = recordBillPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  // Verify the bill belongs to the user
  const bill = await prisma.bill.findUnique({ where: { id: billId, userId } });
  if (!bill) return { error: "Bill not found" };
  await prisma.billPayment.create({
    data: {
      billId,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
      transactionId: parsed.data.transactionId ?? null,
    },
  });
  revalidatePath("/profile");
  return { success: true };
}

export async function getBillHistory(
  billId: string
): Promise<BillPaymentData[]> {
  const userId = await requireAuth();
  // Verify the bill belongs to the user
  const bill = await prisma.bill.findUnique({ where: { id: billId, userId } });
  if (!bill) return [];
  const rows = await prisma.billPayment.findMany({
    where: { billId },
    orderBy: { paidAt: "desc" },
    include: { transaction: { select: { id: true, merchant: true, date: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    paidAt: r.paidAt.toISOString(),
    transactionId: r.transactionId,
    transactionMerchant: r.transaction?.merchant ?? null,
    transactionDate: r.transaction?.date?.toISOString() ?? null,
  }));
}

// ── Link/Unlink Transactions to Payments ──

export async function linkTransactionToPayment(
  paymentId: string,
  paymentType: "installment" | "bill" | "income",
  transactionId: string
) {
  const userId = await requireAuth();
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
  if (!tx) return { error: "Transaction not found" };

  if (paymentType === "installment") {
    const payment = await prisma.installmentPayment.findUnique({
      where: { id: paymentId },
      include: { installment: { select: { userId: true } } },
    });
    if (!payment || payment.installment.userId !== userId) return { error: "Payment not found" };
    await prisma.installmentPayment.update({
      where: { id: paymentId },
      data: { transactionId },
    });
  } else if (paymentType === "bill") {
    const payment = await prisma.billPayment.findUnique({
      where: { id: paymentId },
      include: { bill: { select: { userId: true } } },
    });
    if (!payment || payment.bill.userId !== userId) return { error: "Payment not found" };
    await prisma.billPayment.update({
      where: { id: paymentId },
      data: { transactionId },
    });
  } else {
    const deposit = await prisma.incomeDeposit.findUnique({
      where: { id: paymentId },
      include: { incomeSource: { select: { userId: true } } },
    });
    if (!deposit || deposit.incomeSource.userId !== userId) return { error: "Deposit not found" };
    await prisma.incomeDeposit.update({
      where: { id: paymentId },
      data: { transactionId },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/transactions");
  return { success: true };
}

export async function unlinkTransactionFromPayment(
  paymentId: string,
  paymentType: "installment" | "bill" | "income"
) {
  const userId = await requireAuth();

  if (paymentType === "installment") {
    const payment = await prisma.installmentPayment.findUnique({
      where: { id: paymentId },
      include: { installment: { select: { userId: true } } },
    });
    if (!payment || payment.installment.userId !== userId) return { error: "Payment not found" };
    await prisma.installmentPayment.update({
      where: { id: paymentId },
      data: { transactionId: null },
    });
  } else if (paymentType === "bill") {
    const payment = await prisma.billPayment.findUnique({
      where: { id: paymentId },
      include: { bill: { select: { userId: true } } },
    });
    if (!payment || payment.bill.userId !== userId) return { error: "Payment not found" };
    await prisma.billPayment.update({
      where: { id: paymentId },
      data: { transactionId: null },
    });
  } else {
    const deposit = await prisma.incomeDeposit.findUnique({
      where: { id: paymentId },
      include: { incomeSource: { select: { userId: true } } },
    });
    if (!deposit || deposit.incomeSource.userId !== userId) return { error: "Deposit not found" };
    await prisma.incomeDeposit.update({
      where: { id: paymentId },
      data: { transactionId: null },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/transactions");
  return { success: true };
}

export type SuggestedTransaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: string | null;
  description: string | null;
  isSuggested: boolean;
};

export async function getSuggestedTransactions(
  parentId: string,
  parentType: "installment" | "bill"
): Promise<SuggestedTransaction[]> {
  const userId = await requireAuth();

  let amount: number;
  let currency: string;
  let dueDay: number;

  if (parentType === "installment") {
    const inst = await prisma.installment.findUnique({ where: { id: parentId, userId } });
    if (!inst) return [];
    amount = Number(inst.amount);
    currency = inst.currency;
    dueDay = inst.dueDay;
  } else {
    const bill = await prisma.bill.findUnique({ where: { id: parentId, userId } });
    if (!bill) return [];
    amount = Number(bill.amount);
    currency = bill.currency;
    dueDay = bill.dueDay;
  }

  // Fetch recent expense transactions not already linked to any payment
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "expense",
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
    const dateMatch = Math.abs(txDay - dueDay) <= 5 || Math.abs(txDay - dueDay) >= 26; // wrap around month end

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

export type ActivePaymentTarget = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: "installment" | "bill" | "income";
};

export async function getActiveInstallmentsAndBills(): Promise<ActivePaymentTarget[]> {
  const userId = await requireAuth();
  const [installments, bills, incomeSources] = await Promise.all([
    prisma.installment.findMany({ where: { userId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.bill.findMany({ where: { userId, isActive: true }, orderBy: { name: "asc" } }),
    prisma.incomeSource.findMany({ where: { userId, isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return [
    ...incomeSources.map((s) => ({
      id: s.id,
      name: s.name,
      amount: Number(s.amount),
      currency: s.currency,
      type: "income" as const,
    })),
    ...installments.map((i) => ({
      id: i.id,
      name: i.name,
      amount: Number(i.amount),
      currency: i.currency,
      type: "installment" as const,
    })),
    ...bills.map((b) => ({
      id: b.id,
      name: b.name,
      amount: Number(b.amount),
      currency: b.currency,
      type: "bill" as const,
    })),
  ];
}

export async function linkTransactionToNewPayment(
  transactionId: string,
  parentId: string,
  parentType: "installment" | "bill" | "income"
) {
  const userId = await requireAuth();
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId, userId } });
  if (!tx) return { error: "Transaction not found" };
  const txAmount = Number(tx.amount ?? 0);

  if (parentType === "installment") {
    const inst = await prisma.installment.findUnique({ where: { id: parentId, userId } });
    if (!inst) return { error: "Installment not found" };

    const newPaidCount = inst.paidCount + 1;
    const shouldDeactivate = inst.totalCount !== null && newPaidCount >= inst.totalCount;

    await prisma.$transaction([
      prisma.installmentPayment.create({
        data: {
          installmentId: parentId,
          amount: txAmount,
          transactionId,
          note: `Linked from transaction`,
        },
      }),
      prisma.installment.update({
        where: { id: parentId, userId },
        data: {
          paidCount: newPaidCount,
          isActive: shouldDeactivate ? false : inst.isActive,
        },
      }),
    ]);
  } else if (parentType === "bill") {
    const bill = await prisma.bill.findUnique({ where: { id: parentId, userId } });
    if (!bill) return { error: "Bill not found" };

    await prisma.billPayment.create({
      data: {
        billId: parentId,
        amount: txAmount,
        transactionId,
        note: `Linked from transaction`,
      },
    });
  } else {
    const source = await prisma.incomeSource.findUnique({ where: { id: parentId, userId } });
    if (!source) return { error: "Income source not found" };

    await prisma.incomeDeposit.create({
      data: {
        incomeSourceId: parentId,
        amount: txAmount,
        transactionId,
        note: `Linked from transaction`,
      },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/transactions");
  return { success: true };
}

// ── Financial Overview ──

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const userId = await requireAuth();
  const [incomeSources, installments, bills, reserves, settings, rates] = await Promise.all([
    prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
    prisma.bill.findMany({ where: { userId, isActive: true } }),
    prisma.reserve.findMany({ where: { userId } }),
    prisma.appSettings.findUnique({ where: { userId } }),
    getCurrencyRates(),
  ]);

  const primaryCurrency = settings?.currency ?? "AED";

  const totalMonthlyIncome = incomeSources.reduce(
    (sum, s) => sum + convertAmount(Number(s.amount), s.currency, primaryCurrency, rates),
    0
  );
  const totalMonthlyInstallments = installments.reduce(
    (sum, i) => sum + convertAmount(Number(i.amount), i.currency, primaryCurrency, rates),
    0
  );
  const totalMonthlyBills = bills.reduce(
    (sum, b) => sum + convertAmount(Number(b.amount), b.currency, primaryCurrency, rates),
    0
  );
  const totalReserves = reserves.reduce(
    (sum, r) => sum + convertAmount(Number(r.amount), r.currency, primaryCurrency, rates),
    0
  );

  // Group reserves by type+currency
  const typeMap = new Map<string, { type: string; currency: string; total: number }>();
  for (const r of reserves) {
    const key = `${r.type}:${r.currency}`;
    const entry = typeMap.get(key) ?? { type: r.type, currency: r.currency, total: 0 };
    entry.total += Number(r.amount);
    typeMap.set(key, entry);
  }
  const reservesByType = [...typeMap.values()]
    .map((e) => ({ type: e.type, currency: e.currency, total: Math.round(e.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  // Upcoming payments (due within 7 days) — both installments and bills
  const today = new Date();
  const currentDay = today.getDate();

  const calcDaysUntilDue = (dueDay: number) => {
    let days = dueDay - currentDay;
    if (days < 0) {
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      days += daysInMonth;
    }
    return days;
  };

  const upcomingFromInstallments = installments.map((inst) => ({
    id: inst.id,
    name: inst.name,
    amount: Number(inst.amount),
    currency: inst.currency,
    dueDay: inst.dueDay,
    daysUntilDue: calcDaysUntilDue(inst.dueDay),
    kind: "installment" as const,
  }));

  const upcomingFromBills = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: Number(bill.amount),
    currency: bill.currency,
    dueDay: bill.dueDay,
    daysUntilDue: calcDaysUntilDue(bill.dueDay),
    kind: "bill" as const,
  }));

  const upcomingPayments = [...upcomingFromInstallments, ...upcomingFromBills]
    .filter((i) => i.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const totalOutgoing = totalMonthlyInstallments + totalMonthlyBills;

  return {
    totalMonthlyIncome: Math.round(totalMonthlyIncome * 100) / 100,
    totalMonthlyInstallments: Math.round(totalMonthlyInstallments * 100) / 100,
    totalMonthlyBills: Math.round(totalMonthlyBills * 100) / 100,
    netMonthlyCashflow: Math.round((totalMonthlyIncome - totalOutgoing) * 100) / 100,
    totalReserves: Math.round(totalReserves * 100) / 100,
    reservesByType,
    upcomingPayments,
  };
}

// ── Money Advice (AI) ──

export type MoneyAdviceSuggestion = {
  title: string;
  description: string;
  potentialMonthly: number | null;
  potentialYearly: number | null;
  risk: "low" | "medium" | "high";
  relatedReserve: string | null;
};

export type MoneyAdviceResult = {
  summary: string;
  emergencyFundNeeded: number;
  emergencyFundCurrent: number;
  investableAmount: number;
  suggestions: MoneyAdviceSuggestion[];
};

export type MoneyAdviceHistoryItem = MoneyAdviceResult & {
  id: string;
  createdAt: string;
};

export async function getMoneyAdvice(): Promise<
  { data: MoneyAdviceResult } | { error: string }
> {
  const userId = await requireAuth();
  const settings = await prisma.appSettings.findUnique({
    where: { userId },
  });

  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  const primaryCurrency = settings.currency ?? "AED";
  const rates = await getCurrencyRates();

  // Gather all financial data
  const [incomeSources, reserves, installments, bills] = await Promise.all([
    prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
    prisma.reserve.findMany({
      where: { userId },
      include: {
        snapshots: { orderBy: { recordedAt: "desc" }, take: 3 },
      },
    }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
    prisma.bill.findMany({ where: { userId, isActive: true } }),
  ]);

  const totalMonthlyIncome = incomeSources.reduce(
    (sum, s) =>
      sum + convertAmount(Number(s.amount), s.currency, primaryCurrency, rates),
    0
  );
  const totalMonthlyInstallments = installments.reduce(
    (sum, i) =>
      sum + convertAmount(Number(i.amount), i.currency, primaryCurrency, rates),
    0
  );
  const totalMonthlyBills = bills.reduce(
    (sum, b) =>
      sum + convertAmount(Number(b.amount), b.currency, primaryCurrency, rates),
    0
  );
  const totalMonthlyExpenses = totalMonthlyInstallments + totalMonthlyBills;
  const netCashflow = totalMonthlyIncome - totalMonthlyExpenses;

  // Build context for AI
  const reserveLines = reserves.map((r) => {
    const amt = convertAmount(Number(r.amount), r.currency, primaryCurrency, rates);
    const trend =
      r.snapshots.length >= 2
        ? Number(r.snapshots[0].amount) >= Number(r.snapshots[1].amount)
          ? "stable/growing"
          : "declining"
        : "no history";
    return `- "${r.name}": ${Math.round(amt)} ${primaryCurrency} (type: ${r.type}, location: ${r.location}, trend: ${trend}${r.note ? `, note: ${r.note}` : ""})`;
  });

  const incomeLines = incomeSources.map(
    (s) =>
      `- "${s.name}": ${Math.round(convertAmount(Number(s.amount), s.currency, primaryCurrency, rates))} ${primaryCurrency}/month (day ${s.depositDay})`
  );

  const obligationLines = [
    ...installments.map((i) => {
      const remaining =
        i.totalCount !== null ? `${i.totalCount - i.paidCount} payments left` : "ongoing";
      return `- Installment "${i.name}": ${Math.round(convertAmount(Number(i.amount), i.currency, primaryCurrency, rates))} ${primaryCurrency}/month (${remaining})`;
    }),
    ...bills.map(
      (b) =>
        `- Bill "${b.name}": ~${Math.round(convertAmount(Number(b.amount), b.currency, primaryCurrency, rates))} ${primaryCurrency}/month`
    ),
  ];

  const userContext = `
FINANCIAL PROFILE (all amounts in ${primaryCurrency}):

INCOME SOURCES:
${incomeLines.length > 0 ? incomeLines.join("\n") : "- None"}
Total monthly income: ${Math.round(totalMonthlyIncome)} ${primaryCurrency}

MONTHLY OBLIGATIONS:
${obligationLines.length > 0 ? obligationLines.join("\n") : "- None"}
Total monthly obligations: ${Math.round(totalMonthlyExpenses)} ${primaryCurrency}

NET MONTHLY CASHFLOW: ${Math.round(netCashflow)} ${primaryCurrency}

RESERVES & SAVINGS:
${reserveLines.length > 0 ? reserveLines.join("\n") : "- None"}
Total reserves: ${Math.round(reserves.reduce((s, r) => s + convertAmount(Number(r.amount), r.currency, primaryCurrency, rates), 0))} ${primaryCurrency}
`.trim();

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.moneyAdvice);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContext,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { error: "No response from AI" };
    }

    const jsonStr = content
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");

    const parsed = JSON.parse(jsonStr) as MoneyAdviceResult;

    if (!parsed.summary || !Array.isArray(parsed.suggestions)) {
      return { error: "AI returned an unexpected format" };
    }

    // Save to history
    await prisma.moneyAdvice.create({
      data: {
        userId,
        summary: parsed.summary,
        emergencyFundNeeded: parsed.emergencyFundNeeded,
        emergencyFundCurrent: parsed.emergencyFundCurrent,
        investableAmount: parsed.investableAmount,
        suggestions: JSON.parse(JSON.stringify(parsed.suggestions)),
      },
    });

    return { data: parsed };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI analysis failed: ${msg}` };
  }
}

export async function getMoneyAdviceHistory(): Promise<MoneyAdviceHistoryItem[]> {
  const userId = await requireAuth();
  const rows = await prisma.moneyAdvice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    summary: r.summary,
    emergencyFundNeeded: r.emergencyFundNeeded,
    emergencyFundCurrent: r.emergencyFundCurrent,
    investableAmount: r.investableAmount,
    suggestions: r.suggestions as unknown as MoneyAdviceSuggestion[],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function deleteMoneyAdvice(id: string) {
  const userId = await requireAuth();
  await prisma.moneyAdvice.delete({ where: { id, userId } });
  return { success: true };
}
