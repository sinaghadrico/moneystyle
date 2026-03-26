"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { parseFeatureFlags } from "@/lib/feature-flags";
import { revalidatePath } from "next/cache";

async function isOnboardingEnabled(): Promise<boolean> {
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });
  if (!admin) return true;
  const settings = await prisma.appSettings.findUnique({
    where: { userId: admin.id },
    select: { featureFlags: true },
  });
  if (!settings) return true;
  return parseFeatureFlags(settings.featureFlags).onboarding;
}

export async function completeOnboarding() {
  const userId = await requireAuth();
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function setupOnboardingBudgets(
  items: { name: string; color: string; amount: number }[]
) {
  const userId = await requireAuth();

  for (const item of items) {
    if (item.amount <= 0) continue;

    // Find or create the category
    let category = await prisma.category.findFirst({
      where: { userId, name: item.name },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { userId, name: item.name, color: item.color },
      });
    }

    // Upsert the budget
    await prisma.budget.upsert({
      where: { categoryId: category.id },
      update: { monthlyLimit: item.amount, alertThreshold: 80 },
      create: {
        categoryId: category.id,
        monthlyLimit: item.amount,
        alertThreshold: 80,
        rolloverEnabled: false,
      },
    });
  }

  return { success: true };
}

export async function getOnboardingStatus() {
  const enabled = await isOnboardingEnabled();
  if (!enabled) return true; // skip onboarding when feature is disabled

  const userId = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });
  return user?.onboardingCompleted ?? false;
}
