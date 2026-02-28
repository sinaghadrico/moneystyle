"use server";

import { prisma } from "@/lib/db";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getCategoriesWithStats() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { transactions: { where: { mergedIntoId: null } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const totals = await prisma.transaction.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
    where: { amount: { not: null }, mergedIntoId: null },
  });

  const totalMap = new Map(
    totals.map((t) => [t.categoryId, Number(t._sum.amount ?? 0)])
  );

  return categories.map((cat) => ({
    ...cat,
    transactionCount: cat._count.transactions,
    totalAmount: Math.round((totalMap.get(cat.id) ?? 0) * 100) / 100,
  }));
}

export async function createCategory(data: Record<string, unknown>) {
  const parsed = categoryCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.category.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: { name: ["Category already exists"] } };
  }

  await prisma.category.create({ data: parsed.data });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: Record<string, unknown>
) {
  const parsed = categoryUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.name) {
    const existing = await prisma.category.findFirst({
      where: { name: parsed.data.name, id: { not: id } },
    });
    if (existing) {
      return { error: { name: ["Category already exists"] } };
    }
  }

  await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string, reassignToId?: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { transactions: true } } },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  if (category._count.transactions > 0 && reassignToId) {
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignToId },
    });
  } else if (category._count.transactions > 0) {
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/");
  return { success: true };
}
