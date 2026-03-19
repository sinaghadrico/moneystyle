import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/v1/accounts/:id
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id, userId: auth.userId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!account) return jsonError("Account not found", 404);

  return jsonSuccess({
    id: account.id,
    name: account.name,
    type: account.type,
    bank: account.bank,
    color: account.color,
    icon: account.icon,
    transactionCount: account._count.transactions,
  });
}

// PATCH /api/v1/accounts/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.account.findUnique({ where: { id, userId: auth.userId } });
  if (!existing) return jsonError("Account not found", 404);

  let body: { name?: string; type?: string; bank?: string; color?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const account = await prisma.account.update({
    where: { id, userId: auth.userId },
    data: {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(body.bank !== undefined ? { bank: body.bank } : {}),
      ...(body.color ? { color: body.color } : {}),
    },
  });

  return jsonSuccess({ id: account.id, name: account.name, type: account.type, bank: account.bank, color: account.color });
}

// DELETE /api/v1/accounts/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.account.findUnique({
    where: { id, userId: auth.userId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!existing) return jsonError("Account not found", 404);
  if (existing._count.transactions > 0) {
    return jsonError("Cannot delete account with transactions. Reassign them first.", 409);
  }

  await prisma.account.delete({ where: { id, userId: auth.userId } });
  return jsonSuccess({ deleted: true });
}
