"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import type { DebtSummary } from "@/lib/types";
import {
  personCreateSchema,
  personUpdateSchema,
  settlementCreateSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";

async function getPrimaryCurrency(userId: string): Promise<string> {
  const settings = await prisma.appSettings.findFirst({ where: { userId } });
  return settings?.currency ?? "AED";
}

export async function getPersons() {
  const userId = await requireAuth();
  return prisma.person.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function getPersonsWithDebt() {
  const userId = await requireAuth();
  const [persons, primaryCurrency, rates] = await Promise.all([
    prisma.person.findMany({
      where: { userId },
      include: {
        splits: {
          select: { amount: true, transaction: { select: { currency: true } } },
        },
        settlements: { select: { amount: true } },
      },
      orderBy: { name: "asc" },
    }),
    getPrimaryCurrency(userId),
    getCurrencyRates(),
  ]);

  return persons.map((p) => {
    const totalSplits = p.splits.reduce(
      (s, sp) => s + convertAmount(Number(sp.amount), sp.transaction.currency, primaryCurrency, rates),
      0,
    );
    const totalSettled = p.settlements.reduce(
      (s, st) => s + Number(st.amount),
      0,
    );
    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      color: p.color,
      balance: Math.round((totalSplits - totalSettled) * 100) / 100,
    };
  });
}

export async function getOrCreatePerson(name: string, overrideUserId?: string) {
  const userId = overrideUserId ?? await requireAuth();
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await prisma.person.findFirst({
    where: { userId, name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing;

  const PERSON_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#0ea5e9",
  ];
  const count = await prisma.person.count({ where: { userId } });

  return prisma.person.create({
    data: {
      name: trimmed,
      color: PERSON_COLORS[count % PERSON_COLORS.length],
      userId,
    },
  });
}

export async function createPerson(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = personCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.person.findUnique({
    where: { userId_name: { userId, name: parsed.data.name } },
  });
  if (existing) {
    return { error: { name: ["Person already exists"] } };
  }

  const person = await prisma.person.create({ data: { ...parsed.data, userId } });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true, person };
}

export async function updatePerson(
  id: string,
  data: Record<string, unknown>,
) {
  const userId = await requireAuth();
  const parsed = personUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.person.findFirst({
      where: { userId, name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Person already exists"] } };
    }
  }

  await prisma.person.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true };
}

export async function deletePerson(id: string) {
  const userId = await requireAuth();
  const person = await prisma.person.findUnique({ where: { id, userId } });
  if (!person) {
    return { error: "Person not found" };
  }

  // TransactionSplit.personId has onDelete: SetNull, so splits stay
  // Settlement has onDelete: Cascade, so settlements get deleted
  await prisma.person.delete({ where: { id, userId } });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true };
}

export async function getDebtSummary(): Promise<DebtSummary[]> {
  const userId = await requireAuth();
  const persons = await prisma.person.findMany({
    where: { userId },
    include: {
      splits: { select: { amount: true } },
      settlements: { select: { amount: true } },
    },
  });

  return persons
    .map((p) => {
      const totalSplits = p.splits.reduce((s, sp) => s + Number(sp.amount), 0);
      const totalSettled = p.settlements.reduce((s, st) => s + Number(st.amount), 0);
      return {
        personId: p.id,
        personName: p.name,
        personColor: p.color,
        totalSplits,
        totalSettled,
        balance: totalSplits - totalSettled,
      };
    })
    .filter((d) => Math.abs(d.balance) >= 0.01)
    .sort((a, b) => b.balance - a.balance);
}

export async function getPersonSummary(personId: string) {
  const userId = await requireAuth();
  const person = await prisma.person.findUnique({
    where: { id: personId, userId },
    include: {
      splits: {
        include: {
          transaction: {
            select: { date: true, merchant: true, amount: true },
          },
        },
        orderBy: { transaction: { date: "desc" } },
        take: 20,
      },
      settlements: {
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!person) return null;

  const totalSplits = person.splits.reduce(
    (s, sp) => s + Number(sp.amount),
    0,
  );
  const totalSettled = person.settlements.reduce(
    (s, st) => s + Number(st.amount),
    0,
  );
  const balance = Math.round((totalSplits - totalSettled) * 100) / 100;

  return {
    id: person.id,
    name: person.name,
    phone: person.phone,
    color: person.color,
    totalSplits,
    totalSettled,
    balance,
    recentSplits: person.splits.map((s) => ({
      id: s.id,
      amount: Number(s.amount),
      description: s.description,
      date: s.transaction.date.toISOString().slice(0, 10),
      merchant: s.transaction.merchant,
    })),
    recentSettlements: person.settlements.map((s) => ({
      id: s.id,
      amount: Number(s.amount),
      note: s.note,
      date: s.date.toISOString().slice(0, 10),
    })),
  };
}

export async function createSettlement(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = settlementCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  // Verify user owns this person
  const person = await prisma.person.findFirst({ where: { id: values.personId, userId } });
  if (!person) return { error: { personId: ["Person not found"] } };

  await prisma.settlement.create({
    data: {
      personId: values.personId,
      amount: values.amount,
      note: values.note ?? null,
      source: values.source ?? null,
    },
  });

  revalidatePath("/");
  return { success: true };
}
