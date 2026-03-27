"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  billSchema,
  billUpdateSchema,
  recordBillPaymentSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type {
  BillData,
  BillPaymentData,
} from "@/lib/types";

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
  try {
    await prisma.bill.create({ data: { ...parsed.data, userId } });
  } catch (err) {
    console.error("Failed to create bill:", err);
    return { error: "Failed to create bill. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function updateBill(id: string, data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = billUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  try {
    await prisma.bill.update({ where: { id, userId }, data: parsed.data });
  } catch (err) {
    console.error("Failed to update bill:", err);
    return { error: "Failed to update bill. Please try again." };
  }
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteBill(id: string) {
  const userId = await requireAuth();
  try {
    await prisma.bill.delete({ where: { id, userId } });
  } catch (err) {
    console.error("Failed to delete bill:", err);
    return { error: "Failed to delete bill. Please try again." };
  }
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
  try {
    await prisma.billPayment.create({
      data: {
        billId,
        amount: parsed.data.amount,
        note: parsed.data.note ?? null,
        transactionId: parsed.data.transactionId ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record bill payment:", err);
    return { error: "Failed to record payment. Please try again." };
  }
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
