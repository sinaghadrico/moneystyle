"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export async function completeOnboarding() {
  const userId = await requireAuth();
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });
  return { success: true };
}

export async function getOnboardingStatus() {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });
  return user?.onboardingCompleted ?? false;
}
