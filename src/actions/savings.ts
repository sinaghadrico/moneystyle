"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { savingsGoalSchema } from "@/lib/validators";
import type { SavingsProgress } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  const userId = await requireAuth();
  return prisma.savingsGoal.findMany({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavingsProgress(includeAll = false): Promise<SavingsProgress[]> {
  const userId = await requireAuth();
  const goals = await prisma.savingsGoal.findMany({
    where: includeAll ? { userId } : { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      targetAmount: target,
      currentAmount: current,
      currency: g.currency,
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
  const userId = await requireAuth();
  const parsed = savingsGoalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const values = parsed.data;

  try {
    if (id) {
      await prisma.savingsGoal.update({
        where: { id, userId },
        data: {
          name: values.name,
          description: values.description ?? null,
          targetAmount: values.targetAmount,
          currency: values.currency,
          deadline: values.deadline ?? null,
          color: values.color,
        },
      });
    } else {
      await prisma.savingsGoal.create({
        data: {
          userId,
          name: values.name,
          description: values.description ?? null,
          targetAmount: values.targetAmount,
          currency: values.currency,
          deadline: values.deadline ?? null,
          color: values.color,
        },
      });
    }
  } catch (err) {
    console.error("Failed to save savings goal:", err);
    return { error: "Failed to save goal. Please try again." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function addToSavings(id: string, amount: number) {
  const userId = await requireAuth();
  if (amount <= 0) return { error: "Amount must be positive" };

  const goal = await prisma.savingsGoal.findUnique({ where: { id, userId } });
  if (!goal) return { error: "Goal not found" };

  const newAmount = Number(goal.currentAmount) + amount;
  const target = Number(goal.targetAmount);
  const isCompleted = newAmount >= target;

  try {
    await prisma.savingsGoal.update({
      where: { id, userId },
      data: {
        currentAmount: newAmount,
        status: isCompleted ? "completed" : "active",
      },
    });
  } catch (err) {
    console.error("Failed to add to savings:", err);
    return { error: "Failed to update savings. Please try again." };
  }

  revalidatePath("/");
  return { success: true, completed: isCompleted };
}

export async function deleteSavingsGoal(id: string) {
  const userId = await requireAuth();
  try {
    await prisma.savingsGoal.delete({ where: { id, userId } });
  } catch (err) {
    console.error("Failed to delete savings goal:", err);
    return { error: "Failed to delete goal. Please try again." };
  }
  revalidatePath("/");
  return { success: true };
}
