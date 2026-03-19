"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import type {
  HouseholdData,
  HouseholdTransactionData,
} from "@/lib/types";

// ── Get household for current user ──

export async function getHousehold(): Promise<HouseholdData | null> {
  const userId = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { joinedAt: "asc" },
          },
          invites: {
            where: { status: "pending" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!membership) return null;

  const h = membership.household;
  return {
    id: h.id,
    name: h.name,
    members: h.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name ?? "Unknown",
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
    pendingInvites: h.invites.map((inv) => ({
      id: inv.id,
      email: inv.email,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    })),
  };
}

// ── Create household ──

export async function createHousehold(name: string) {
  const userId = await requireAuth();

  // Check if user already belongs to a household
  const existing = await prisma.householdMember.findFirst({ where: { userId } });
  if (existing) {
    return { error: "You already belong to a household" };
  }

  const household = await prisma.household.create({
    data: {
      name: name.trim(),
      members: {
        create: { userId, role: "owner" },
      },
    },
  });

  revalidatePath("/profile");
  return { success: true, householdId: household.id };
}

// ── Rename household ──

export async function renameHousehold(name: string) {
  const userId = await requireAuth();
  const membership = await prisma.householdMember.findFirst({
    where: { userId, role: "owner" },
  });
  if (!membership) return { error: "Only the owner can rename the household" };

  await prisma.household.update({
    where: { id: membership.householdId },
    data: { name: name.trim() },
  });
  revalidatePath("/profile");
  return { success: true };
}

// ── Invite member ──

export async function inviteToHousehold(email: string) {
  const userId = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId, role: "owner" },
  });
  if (!membership) {
    return { error: "Only the household owner can invite members" };
  }

  // Check if already a member
  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (targetUser) {
    const alreadyMember = await prisma.householdMember.findFirst({
      where: { householdId: membership.householdId, userId: targetUser.id },
    });
    if (alreadyMember) {
      return { error: "This user is already a member" };
    }
  }

  // Check existing pending invite
  const existingInvite = await prisma.householdInvite.findFirst({
    where: { householdId: membership.householdId, email, status: "pending" },
  });
  if (existingInvite) {
    return { error: "An invite is already pending for this email" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.householdInvite.create({
    data: {
      householdId: membership.householdId,
      email,
      invitedById: userId,
      expiresAt,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

// ── Accept invite ──

export async function acceptInvite(token: string) {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return { error: "User not found" };

  const invite = await prisma.householdInvite.findUnique({ where: { token } });
  if (!invite) return { error: "Invite not found" };
  if (invite.status !== "pending") return { error: "Invite already used" };
  if (invite.expiresAt < new Date()) return { error: "Invite expired" };
  if (invite.email !== user.email) return { error: "This invite is not for your email" };

  // Check if user already in a household
  const existing = await prisma.householdMember.findFirst({ where: { userId } });
  if (existing) return { error: "You already belong to a household" };

  await prisma.$transaction([
    prisma.householdMember.create({
      data: { householdId: invite.householdId, userId, role: "member" },
    }),
    prisma.householdInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    }),
  ]);

  revalidatePath("/profile");
  return { success: true };
}

// ── Cancel invite ──

export async function cancelInvite(inviteId: string) {
  const userId = await requireAuth();

  const invite = await prisma.householdInvite.findUnique({
    where: { id: inviteId },
    include: { household: { include: { members: true } } },
  });
  if (!invite) return { error: "Invite not found" };

  const isOwner = invite.household.members.some(
    (m) => m.userId === userId && m.role === "owner"
  );
  if (!isOwner) return { error: "Only the owner can cancel invites" };

  await prisma.householdInvite.delete({ where: { id: inviteId } });
  revalidatePath("/profile");
  return { success: true };
}

// ── Remove member ──

export async function removeMember(memberId: string) {
  const userId = await requireAuth();

  const member = await prisma.householdMember.findUnique({
    where: { id: memberId },
    include: { household: { include: { members: true } } },
  });
  if (!member) return { error: "Member not found" };
  if (member.role === "owner") return { error: "Cannot remove the owner" };

  const isOwner = member.household.members.some(
    (m) => m.userId === userId && m.role === "owner"
  );
  if (!isOwner) return { error: "Only the owner can remove members" };

  await prisma.householdMember.delete({ where: { id: memberId } });
  revalidatePath("/profile");
  return { success: true };
}

// ── Leave household ──

export async function leaveHousehold() {
  const userId = await requireAuth();

  const membership = await prisma.householdMember.findFirst({ where: { userId } });
  if (!membership) return { error: "You are not in a household" };
  if (membership.role === "owner") return { error: "Owner cannot leave. Delete the household instead." };

  await prisma.householdMember.delete({ where: { id: membership.id } });
  revalidatePath("/profile");
  return { success: true };
}

// ── Delete household ──

export async function deleteHousehold() {
  const userId = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId, role: "owner" },
  });
  if (!membership) return { error: "Only the owner can delete the household" };

  await prisma.household.delete({ where: { id: membership.householdId } });
  revalidatePath("/profile");
  return { success: true };
}

// ── Get household transactions (shared view) ──

export async function getHouseholdTransactions(opts?: {
  limit?: number;
  offset?: number;
}): Promise<{ transactions: HouseholdTransactionData[]; total: number }> {
  const userId = await requireAuth();
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: { household: { include: { members: { select: { userId: true } } } } },
  });

  if (!membership) return { transactions: [], total: 0 };

  const memberIds = membership.household.members.map((m) => m.userId);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: { in: memberIds },
        mergedIntoId: null,
        confirmed: true,
      },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.transaction.count({
      where: {
        userId: { in: memberIds },
        mergedIntoId: null,
        confirmed: true,
      },
    }),
  ]);

  return {
    transactions: transactions.map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      amount: Number(tx.amount),
      currency: tx.currency,
      type: tx.type,
      merchant: tx.merchant,
      description: tx.description,
      categoryName: tx.category?.name ?? null,
      accountName: tx.account.name,
      userName: tx.user.name ?? "Unknown",
    })),
    total,
  };
}

// ── Check pending invites for current user ──

export async function getPendingInvites() {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return [];

  const invites = await prisma.householdInvite.findMany({
    where: { email: user.email, status: "pending", expiresAt: { gt: new Date() } },
    include: {
      household: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invites.map((inv) => ({
    id: inv.id,
    token: inv.token,
    householdName: inv.household.name,
    invitedByName: inv.invitedBy.name ?? "Someone",
    createdAt: inv.createdAt.toISOString(),
  }));
}
