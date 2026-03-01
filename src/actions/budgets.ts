"use server";

import { prisma } from "@/lib/db";
import { budgetUpsertSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getBudgets() {
  return prisma.budget.findMany({
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });
}

export type BudgetProgress = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  monthlyLimit: number;
  alertThreshold: number;
  spent: number;
  percentage: number;
};

export async function getBudgetProgress(): Promise<BudgetProgress[]> {
  const budgets = await prisma.budget.findMany({
    include: { category: true },
  });

  if (budgets.length === 0) return [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const results: BudgetProgress[] = [];

  for (const budget of budgets) {
    const agg = await prisma.transaction.aggregate({
      where: {
        categoryId: budget.categoryId,
        type: "expense",
        date: { gte: startOfMonth, lte: endOfMonth },
        mergedIntoId: null,
        amount: { not: null },
      },
      _sum: { amount: true },
    });

    const spent = Number(agg._sum.amount ?? 0);
    const limit = Number(budget.monthlyLimit);
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    results.push({
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      categoryColor: budget.category.color,
      monthlyLimit: limit,
      alertThreshold: budget.alertThreshold,
      spent,
      percentage,
    });
  }

  return results.sort((a, b) => b.percentage - a.percentage);
}

export async function upsertBudget(data: Record<string, unknown>) {
  const parsed = budgetUpsertSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  await prisma.budget.upsert({
    where: { categoryId: values.categoryId },
    update: {
      monthlyLimit: values.monthlyLimit,
      alertThreshold: values.alertThreshold,
    },
    create: {
      categoryId: values.categoryId,
      monthlyLimit: values.monthlyLimit,
      alertThreshold: values.alertThreshold,
    },
  });

  revalidatePath("/");
  revalidatePath("/categories");
  return { success: true };
}

export async function deleteBudget(categoryId: string) {
  await prisma.budget.deleteMany({ where: { categoryId } });
  revalidatePath("/");
  revalidatePath("/categories");
  return { success: true };
}

export async function checkBudgetAlert(
  categoryId: string,
): Promise<string | null> {
  const budget = await prisma.budget.findUnique({
    where: { categoryId },
    include: { category: true },
  });

  if (!budget) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const agg = await prisma.transaction.aggregate({
    where: {
      categoryId,
      type: "expense",
      date: { gte: startOfMonth, lte: endOfMonth },
      mergedIntoId: null,
      amount: { not: null },
    },
    _sum: { amount: true },
  });

  const spent = Number(agg._sum.amount ?? 0);
  const limit = Number(budget.monthlyLimit);
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  if (percentage >= 100) {
    return `\n\n🚨 Budget exceeded for ${budget.category.name}! ${spent.toLocaleString()} / ${limit.toLocaleString()} AED (${percentage}%)`;
  }
  if (percentage >= budget.alertThreshold) {
    return `\n\n⚠️ Budget alert for ${budget.category.name}: ${spent.toLocaleString()} / ${limit.toLocaleString()} AED (${percentage}%)`;
  }

  return null;
}
