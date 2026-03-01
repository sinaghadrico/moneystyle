"use server";

import { prisma } from "@/lib/db";
import { tagCreateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#0ea5e9",
];

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

export async function createTag(data: { name: string; color?: string }) {
  const parsed = tagCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.tag.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return existing;

  const count = await prisma.tag.count();
  const color = parsed.data.color || TAG_COLORS[count % TAG_COLORS.length];

  const tag = await prisma.tag.create({
    data: { name: parsed.data.name, color },
  });

  revalidatePath("/transactions");
  return tag;
}

export async function setTransactionTags(transactionId: string, tagIds: string[]) {
  await prisma.transactionTag.deleteMany({
    where: { transactionId },
  });

  if (tagIds.length > 0) {
    await prisma.transactionTag.createMany({
      data: tagIds.map((tagId) => ({ transactionId, tagId })),
    });
  }
}
