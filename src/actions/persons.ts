"use server";

import { prisma } from "@/lib/db";
import type { DebtSummary } from "@/lib/types";
import {
  personCreateSchema,
  personUpdateSchema,
  settlementCreateSchema,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getPersons() {
  return prisma.person.findMany({ orderBy: { name: "asc" } });
}

export async function getPersonsWithDebt() {
  const persons = await prisma.person.findMany({
    include: {
      splits: { select: { amount: true } },
      settlements: { select: { amount: true } },
    },
    orderBy: { name: "asc" },
  });

  return persons.map((p) => {
    const totalSplits = p.splits.reduce((s, sp) => s + Number(sp.amount), 0);
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

export async function getOrCreatePerson(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = await prisma.person.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
  });
  if (existing) return existing;

  const PERSON_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#0ea5e9",
  ];
  const count = await prisma.person.count();

  return prisma.person.create({
    data: {
      name: trimmed,
      color: PERSON_COLORS[count % PERSON_COLORS.length],
    },
  });
}

export async function createPerson(data: Record<string, unknown>) {
  const parsed = personCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.person.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: { name: ["Person already exists"] } };
  }

  const person = await prisma.person.create({ data: parsed.data });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true, person };
}

export async function updatePerson(
  id: string,
  data: Record<string, unknown>,
) {
  const parsed = personUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.person.findFirst({
      where: { name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Person already exists"] } };
    }
  }

  await prisma.person.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true };
}

export async function deletePerson(id: string) {
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) {
    return { error: "Person not found" };
  }

  // TransactionSplit.personId has onDelete: SetNull, so splits stay
  // Settlement has onDelete: Cascade, so settlements get deleted
  await prisma.person.delete({ where: { id } });

  revalidatePath("/persons");
  revalidatePath("/");
  return { success: true };
}

export async function getDebtSummary(): Promise<DebtSummary[]> {
  const persons = await prisma.person.findMany({
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

export async function createSettlement(data: Record<string, unknown>) {
  const parsed = settlementCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

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
