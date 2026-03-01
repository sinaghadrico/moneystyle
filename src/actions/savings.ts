"use server";

import { prisma } from "@/lib/db";
import { savingsGoalSchema } from "@/lib/validators";
import type { SavingsProgress } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  return prisma.savingsGoal.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavingsProgress(): Promise<SavingsProgress[]> {
  const goals = await prisma.savingsGoal.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      deadline: g.deadline,
      color: g.color,
      status: g.status,
      percentage: target > 0 ? Math.round((current / target) * 100) : 0,
    };
  });
}

export async function upsertSavingsGoal(
  data: Record<string, unknown>,
  id?: string,
) {
  const parsed = savingsGoalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  if (id) {
    await prisma.savingsGoal.update({
      where: { id },
      data: {
        name: values.name,
        targetAmount: values.targetAmount,
        deadline: values.deadline ?? null,
        color: values.color,
      },
    });
  } else {
    await prisma.savingsGoal.create({
      data: {
        name: values.name,
        targetAmount: values.targetAmount,
        deadline: values.deadline ?? null,
        color: values.color,
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function addToSavings(id: string, amount: number) {
  if (amount <= 0) return { error: "Amount must be positive" };

  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  if (!goal) return { error: "Goal not found" };

  const newAmount = Number(goal.currentAmount) + amount;
  const target = Number(goal.targetAmount);
  const isCompleted = newAmount >= target;

  await prisma.savingsGoal.update({
    where: { id },
    data: {
      currentAmount: newAmount,
      status: isCompleted ? "completed" : "active",
    },
  });

  revalidatePath("/");
  return { success: true, completed: isCompleted };
}

export async function deleteSavingsGoal(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}
