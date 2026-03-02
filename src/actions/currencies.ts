"use server";

import { prisma } from "@/lib/db";
import { currencyCreateSchema, currencyUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { CurrencyData } from "@/lib/types";

export async function getActiveCurrencies(): Promise<CurrencyData[]> {
  const rows = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    symbol: r.symbol,
    rateToUsd: r.rateToUsd,
    isActive: r.isActive,
  }));
}

export async function getAllCurrencies(): Promise<CurrencyData[]> {
  const rows = await prisma.currency.findMany({
    orderBy: { code: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    symbol: r.symbol,
    rateToUsd: r.rateToUsd,
    isActive: r.isActive,
  }));
}

export async function createCurrency(data: Record<string, unknown>) {
  const parsed = currencyCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.currency.create({ data: parsed.data });
  revalidatePath("/settings");
  return { success: true };
}

export async function updateCurrency(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = currencyUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.currency.update({ where: { id }, data: parsed.data });
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteCurrency(id: string) {
  await prisma.currency.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}

export async function getCurrencyRates(): Promise<Map<string, number>> {
  const currencies = await prisma.currency.findMany({
    where: { isActive: true },
    select: { code: true, rateToUsd: true },
  });
  return new Map(currencies.map((c) => [c.code, c.rateToUsd]));
}
