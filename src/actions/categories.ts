"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getCategoriesWithStats() {
  const userId = await requireAuth();
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: { transactions: { where: { mergedIntoId: null, confirmed: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totals, monthlyTotals] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      where: { userId, amount: { not: null }, mergedIntoId: null, confirmed: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      where: {
        userId,
        amount: { not: null },
        mergedIntoId: null,
        confirmed: true,
        date: { gte: monthStart, lt: monthEnd },
      },
    }),
  ]);

  const totalMap = new Map(
    totals.map((t) => [t.categoryId, Number(t._sum.amount ?? 0)])
  );
  const monthlyMap = new Map(
    monthlyTotals.map((t) => [t.categoryId, Number(t._sum.amount ?? 0)])
  );

  return categories.map((cat) => ({
    ...cat,
    transactionCount: cat._count.transactions,
    totalAmount: Math.round((totalMap.get(cat.id) ?? 0) * 100) / 100,
    monthlyAmount: Math.round((monthlyMap.get(cat.id) ?? 0) * 100) / 100,
  }));
}

export async function createCategory(data: Record<string, unknown>) {
  const userId = await requireAuth();
  const parsed = categoryCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId, name: parsed.data.name } },
  });
  if (existing) {
    return { error: { name: ["Category already exists"] } };
  }

  await prisma.category.create({ data: { ...parsed.data, userId } });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: Record<string, unknown>
) {
  const userId = await requireAuth();
  const parsed = categoryUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.category.findFirst({
      where: { userId, name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Category already exists"] } };
    }
  }

  await prisma.category.update({
    where: { id, userId },
    data: parsed.data,
  });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string, reassignToId?: string) {
  const userId = await requireAuth();
  const category = await prisma.category.findUnique({
    where: { id, userId },
    include: { _count: { select: { transactions: true } } },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  if (category._count.transactions > 0 && reassignToId) {
    await prisma.transaction.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: reassignToId },
    });
  } else if (category._count.transactions > 0) {
    await prisma.transaction.updateMany({
      where: { categoryId: id, userId },
      data: { categoryId: null },
    });
  }

  await prisma.category.delete({ where: { id, userId } });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}
