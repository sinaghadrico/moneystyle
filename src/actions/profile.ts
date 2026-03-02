"use server";

import { prisma } from "@/lib/db";
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
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import type {
  IncomeSourceData,
  ReserveData,
  ReserveSnapshotData,
  InstallmentData,
  InstallmentPaymentData,
  BillData,
  BillPaymentData,
  FinancialOverview,
} from "@/lib/types";

// ── Income Sources ──

export async function getIncomeSources(): Promise<IncomeSourceData[]> {
  const rows = await prisma.incomeSource.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    depositDay: r.depositDay,
    currency: r.currency,
    isActive: r.isActive,
  }));
}

export async function createIncomeSource(data: Record<string, unknown>) {
  const parsed = incomeSourceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.incomeSource.create({ data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateIncomeSource(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = incomeSourceUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.incomeSource.update({ where: { id }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteIncomeSource(id: string) {
  await prisma.incomeSource.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}

// ── Reserves ──

export async function getReserves(): Promise<ReserveData[]> {
  const rows = await prisma.reserve.findMany({
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
  const parsed = reserveSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const reserve = await prisma.reserve.create({ data: parsed.data });
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
  const parsed = reserveUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const existing = await prisma.reserve.findUnique({ where: { id } });
  const updated = await prisma.reserve.update({
    where: { id },
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
  await prisma.reserve.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}

export async function recordReserveValue(
  reserveId: string,
  data: Record<string, unknown>
) {
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
      where: { id: reserveId },
      data: { amount: parsed.data.amount },
    }),
  ]);
  revalidatePath("/profile");
  return { success: true };
}

export async function getReserveHistory(
  reserveId: string
): Promise<ReserveSnapshotData[]> {
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
  const rows = await prisma.installment.findMany({
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
    lastPaidAt: r.payments[0]?.paidAt?.toISOString() ?? null,
  }));
}

export async function createInstallment(data: Record<string, unknown>) {
  const parsed = installmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.installment.create({ data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateInstallment(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = installmentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.installment.update({ where: { id }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteInstallment(id: string) {
  await prisma.installment.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}

export async function incrementPaidCount(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = recordInstallmentPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const inst = await prisma.installment.findUnique({ where: { id } });
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
      },
    }),
    prisma.installment.update({
      where: { id },
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
  const rows = await prisma.installmentPayment.findMany({
    where: { installmentId },
    orderBy: { paidAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    paidAt: r.paidAt.toISOString(),
  }));
}

// ── Bills ──

export async function getBills(): Promise<BillData[]> {
  const rows = await prisma.bill.findMany({
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
    lastPaidAt: r.payments[0]?.paidAt?.toISOString() ?? null,
    lastPaidAmount: r.payments[0] ? Number(r.payments[0].amount) : null,
  }));
}

export async function createBill(data: Record<string, unknown>) {
  const parsed = billSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.bill.create({ data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function updateBill(id: string, data: Record<string, unknown>) {
  const parsed = billUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.bill.update({ where: { id }, data: parsed.data });
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteBill(id: string) {
  await prisma.bill.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}

export async function recordBillPayment(
  billId: string,
  data: Record<string, unknown>
) {
  const parsed = recordBillPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.billPayment.create({
    data: {
      billId,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
    },
  });
  revalidatePath("/profile");
  return { success: true };
}

export async function getBillHistory(
  billId: string
): Promise<BillPaymentData[]> {
  const rows = await prisma.billPayment.findMany({
    where: { billId },
    orderBy: { paidAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    paidAt: r.paidAt.toISOString(),
  }));
}

// ── Financial Overview ──

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const [incomeSources, installments, bills, reserves, settings, rates] = await Promise.all([
    prisma.incomeSource.findMany({ where: { isActive: true } }),
    prisma.installment.findMany({ where: { isActive: true } }),
    prisma.bill.findMany({ where: { isActive: true } }),
    prisma.reserve.findMany(),
    prisma.appSettings.findFirst(),
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

  // Group reserves by type
  const typeMap = new Map<string, number>();
  for (const r of reserves) {
    const current = typeMap.get(r.type) ?? 0;
    typeMap.set(r.type, current + convertAmount(Number(r.amount), r.currency, primaryCurrency, rates));
  }
  const reservesByType = [...typeMap.entries()]
    .map(([type, total]) => ({ type, total: Math.round(total * 100) / 100 }))
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
    amount: Math.round(convertAmount(Number(inst.amount), inst.currency, primaryCurrency, rates) * 100) / 100,
    dueDay: inst.dueDay,
    daysUntilDue: calcDaysUntilDue(inst.dueDay),
    kind: "installment" as const,
  }));

  const upcomingFromBills = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: Math.round(convertAmount(Number(bill.amount), bill.currency, primaryCurrency, rates) * 100) / 100,
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
  const settings = await prisma.appSettings.findFirst({
    where: { id: "default" },
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
    prisma.incomeSource.findMany({ where: { isActive: true } }),
    prisma.reserve.findMany({
      include: {
        snapshots: { orderBy: { recordedAt: "desc" }, take: 3 },
      },
    }),
    prisma.installment.findMany({ where: { isActive: true } }),
    prisma.bill.findMany({ where: { isActive: true } }),
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a personal finance advisor. Analyze the user's financial data and suggest how they can generate income from their reserves and savings.

Rules:
- Be specific: use the actual amounts, types, and locations from their data
- Calculate emergency fund needed (3 months of expenses)
- Calculate how much is actually investable (total reserves minus emergency fund)
- Give 3-5 concrete suggestions based on their reserve types and locations
- For each suggestion, estimate potential monthly and yearly returns
- Consider the reserve type: cash → savings accounts/deposits, gold → hold or diversify, crypto → staking/yield, family loans → N/A
- Risk levels: low (savings accounts, deposits), medium (bonds, funds), high (stocks, crypto yield)
- Be practical for someone in the UAE/Middle East region
- Respond in the user's currency
- Be concise and actionable

Return ONLY a JSON object in this exact format:
{"summary":"Brief 1-2 sentence overview","emergencyFundNeeded":NUMBER,"emergencyFundCurrent":NUMBER,"investableAmount":NUMBER,"suggestions":[{"title":"Short title","description":"2-3 sentence explanation with specific numbers","potentialMonthly":NUMBER_OR_NULL,"potentialYearly":NUMBER_OR_NULL,"risk":"low|medium|high","relatedReserve":"name of reserve or null"}]}

Return ONLY the JSON, no markdown, no explanation.`,
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
  const rows = await prisma.moneyAdvice.findMany({
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
  await prisma.moneyAdvice.delete({ where: { id } });
  return { success: true };
}
