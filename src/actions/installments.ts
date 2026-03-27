"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  installmentSchema,
  installmentUpdateSchema,
  recordInstallmentPaymentSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type {
  InstallmentData,
  InstallmentPaymentData,
} from "@/lib/types";

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
  try {
    await prisma.installment.create({ data: { ...parsed.data, userId } });
  } catch (err) {
    console.error("Failed to create installment:", err);
    return { error: "Failed to create installment. Please try again." };
  }
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
  try {
    await prisma.installment.update({ where: { id, userId }, data: parsed.data });
  } catch (err) {
    console.error("Failed to update installment:", err);
    return { error: "Failed to update installment. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteInstallment(id: string) {
  const userId = await requireAuth();
  try {
    await prisma.installment.delete({ where: { id, userId } });
  } catch (err) {
    console.error("Failed to delete installment:", err);
    return { error: "Failed to delete installment. Please try again." };
  }
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

  try {
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
  } catch (err) {
    console.error("Failed to record installment payment:", err);
    return { error: "Failed to record payment. Please try again." };
  }

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
