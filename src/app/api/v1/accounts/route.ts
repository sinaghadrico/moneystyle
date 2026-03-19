import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";
import { accountCreateSchema } from "@/lib/validators";

// GET /api/v1/accounts
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  const accounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    select: {
      id: true,
      name: true,
      type: true,
      bank: true,
      color: true,
      icon: true,
      _count: { select: { transactions: true } },
    },
    orderBy: { name: "asc" },
  });

  return jsonSuccess({
    data: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      bank: a.bank,
      color: a.color,
      icon: a.icon,
      transactionCount: a._count.transactions,
    })),
  });
}

// POST /api/v1/accounts
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = accountCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
      422
    );
  }

  const existing = await prisma.account.findUnique({
    where: { userId_name: { userId: auth.userId, name: parsed.data.name } },
  });
  if (existing) return jsonError("Account already exists", 409);

  const account = await prisma.account.create({
    data: { ...parsed.data, userId: auth.userId },
  });

  return jsonSuccess(
    { id: account.id, name: account.name, type: account.type, bank: account.bank, color: account.color },
    201
  );
}
