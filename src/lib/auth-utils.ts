import { auth } from "./auth";

export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getUserRole(): Promise<string> {
  const session = await auth();
  return (session?.user as { role?: string })?.role ?? "user";
}

export async function isAdmin(): Promise<boolean> {
  return (await getUserRole()) === "admin";
}
