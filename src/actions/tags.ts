"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { tagCreateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#0ea5e9",
];

export async function getTags() {
  const userId = await requireAuth();
  return prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function createTag(data: { name: string; color?: string }) {
  const userId = await requireAuth();
  const parsed = tagCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId, name: parsed.data.name } },
  });
  if (existing) return existing;

  const count = await prisma.tag.count({ where: { userId } });
  const color = parsed.data.color || TAG_COLORS[count % TAG_COLORS.length];

  const tag = await prisma.tag.create({
    data: { name: parsed.data.name, color, userId },
  });

  revalidatePath("/transactions");
  return tag;
}

export async function setTransactionTags(transactionId: string, tagIds: string[]) {
  const userId = await requireAuth();
  await prisma.transactionTag.deleteMany({
    where: { transactionId, tag: { userId } },
  });

  if (tagIds.length > 0) {
    await prisma.transactionTag.createMany({
      data: tagIds.map((tagId) => ({ transactionId, tagId })),
    });
  }
}
