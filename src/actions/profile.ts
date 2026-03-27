"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import type {
  FinancialOverview,
  CashflowData,
  CashflowEvent,
  CashflowDayData,
  SuggestedTransaction,
  ActivePaymentTarget,
} from "@/lib/types";

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

// ── Cashflow Calendar ──

export async function getCashflowData(month: string): Promise<CashflowData> {
  const userId = await requireAuth();
  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const monthStart = new Date(year, mon - 1, 1);
  const monthEnd = new Date(year, mon, 0, 23, 59, 59, 999);

  const [incomeSources, installments, bills, transactions, settings, rates] = await Promise.all([
    prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
    prisma.bill.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      select: { id: true, merchant: true, description: true, amount: true, type: true, date: true, currency: true },
      orderBy: { date: "asc" },
    }),
    prisma.appSettings.findUnique({ where: { userId } }),
    getCurrencyRates(),
  ]);

  const primaryCurrency = settings?.currency ?? "AED";

  // Build events per day
  const dayEventsMap = new Map<number, CashflowEvent[]>();
  for (let d = 1; d <= daysInMonth; d++) dayEventsMap.set(d, []);

  // Recurring: income sources
  for (const src of incomeSources) {
    const day = Math.min(src.depositDay, daysInMonth);
    dayEventsMap.get(day)!.push({
      id: src.id,
      name: src.name,
      amount: convertAmount(Number(src.amount), src.currency, primaryCurrency, rates),
      currency: primaryCurrency,
      day,
      kind: "income",
    });
  }

  // Recurring: installments
  for (const inst of installments) {
    const day = Math.min(inst.dueDay, daysInMonth);
    dayEventsMap.get(day)!.push({
      id: inst.id,
      name: inst.name,
      amount: convertAmount(Number(inst.amount), inst.currency, primaryCurrency, rates),
      currency: primaryCurrency,
      day,
      kind: "installment",
    });
  }

  // Recurring: bills
  for (const bill of bills) {
    const day = Math.min(bill.dueDay, daysInMonth);
    dayEventsMap.get(day)!.push({
      id: bill.id,
      name: bill.name,
      amount: convertAmount(Number(bill.amount), bill.currency, primaryCurrency, rates),
      currency: primaryCurrency,
      day,
      kind: "bill",
    });
  }

  // Actual transactions
  for (const tx of transactions) {
    const day = new Date(tx.date).getDate();
    const amount = convertAmount(Math.abs(Number(tx.amount)), tx.currency, primaryCurrency, rates);
    const isIncome = tx.type === "income";
    dayEventsMap.get(day)!.push({
      id: tx.id,
      name: tx.merchant || tx.description || (isIncome ? "Income" : "Expense"),
      amount,
      currency: primaryCurrency,
      day,
      kind: isIncome ? "deposit" : "expense",
    });
  }

  // Calculate projected balance day by day
  let runningBalance = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  const days: CashflowDayData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const events = dayEventsMap.get(d)!;
    for (const ev of events) {
      if (ev.kind === "income" || ev.kind === "deposit") {
        runningBalance += ev.amount;
        totalIncome += ev.amount;
      } else {
        runningBalance -= ev.amount;
        totalExpenses += ev.amount;
      }
    }
    const dateStr = `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: dateStr,
      day: d,
      events,
      projectedBalance: Math.round(runningBalance * 100) / 100,
    });
  }

  return {
    month,
    primaryCurrency,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netCashflow: Math.round((totalIncome - totalExpenses) * 100) / 100,
    days,
  };
}
