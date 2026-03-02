"use server";

import { prisma } from "@/lib/db";
import {
  incomeSourceSchema,
  incomeSourceUpdateSchema,
  reserveSchema,
  reserveUpdateSchema,
  recordReserveValueSchema,
  installmentSchema,
  installmentUpdateSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import type {
  IncomeSourceData,
  ReserveData,
  ReserveSnapshotData,
  InstallmentData,
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

export async function incrementPaidCount(id: string) {
  const inst = await prisma.installment.findUnique({ where: { id } });
  if (!inst) return { error: "Not found" };

  const newPaidCount = inst.paidCount + 1;
  const shouldDeactivate =
    inst.totalCount !== null && newPaidCount >= inst.totalCount;

  await prisma.installment.update({
    where: { id },
    data: {
      paidCount: newPaidCount,
      isActive: shouldDeactivate ? false : inst.isActive,
    },
  });

  revalidatePath("/profile");
  return { success: true, completed: shouldDeactivate };
}

// ── Financial Overview ──

export async function getFinancialOverview(): Promise<FinancialOverview> {
  const [incomeSources, installments, reserves, settings, rates] = await Promise.all([
    prisma.incomeSource.findMany({ where: { isActive: true } }),
    prisma.installment.findMany({ where: { isActive: true } }),
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

  // Upcoming installments (due within 7 days)
  const today = new Date();
  const currentDay = today.getDate();
  const upcomingInstallments = installments
    .map((inst) => {
      let daysUntilDue = inst.dueDay - currentDay;
      if (daysUntilDue < 0) {
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        daysUntilDue += daysInMonth;
      }
      return {
        id: inst.id,
        name: inst.name,
        amount: Math.round(convertAmount(Number(inst.amount), inst.currency, primaryCurrency, rates) * 100) / 100,
        dueDay: inst.dueDay,
        daysUntilDue,
      };
    })
    .filter((i) => i.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return {
    totalMonthlyIncome: Math.round(totalMonthlyIncome * 100) / 100,
    totalMonthlyInstallments: Math.round(totalMonthlyInstallments * 100) / 100,
    netMonthlyCashflow: Math.round((totalMonthlyIncome - totalMonthlyInstallments) * 100) / 100,
    totalReserves: Math.round(totalReserves * 100) / 100,
    reservesByType,
    upcomingInstallments,
  };
}
