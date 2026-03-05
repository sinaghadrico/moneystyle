"use server";

import { prisma } from "@/lib/db";
import { signIn, seedNewUser } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return { error: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashedPassword,
    },
  });

  await seedNewUser(user.id);

  return { success: true };
}

export async function getUserProfile() {
  const userId = await requireAuth();
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, email: true, image: true },
  });
}

export async function updateUserProfile(data: {
  name?: string;
  username?: string;
  image?: string;
}) {
  const userId = await requireAuth();

  // Validate username
  if (data.username !== undefined) {
    const trimmed = data.username.trim().toLowerCase();
    if (trimmed && !/^[a-z0-9_-]{3,30}$/.test(trimmed)) {
      return { error: "Username must be 3-30 characters (letters, numbers, _ or -)" };
    }
    if (trimmed) {
      const existing = await prisma.user.findUnique({ where: { username: trimmed } });
      if (existing && existing.id !== userId) {
        return { error: "Username already taken" };
      }
    }
    data.username = trimmed || null as unknown as string;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
      image: data.image,
    },
  });

  return { success: true };
}

export async function signInWithCredentials(data: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: "Invalid email or password" };
  }
}
