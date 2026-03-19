import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";
import { transactionUpdateSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

// GET /api/v1/transactions/:id
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const tx = await prisma.transaction.findUnique({
    where: { id, userId: auth.userId },
    include: {
      category: { select: { id: true, name: true, color: true } },
      account: { select: { id: true, name: true, type: true } },
      tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
      lineItems: { select: { id: true, name: true, quantity: true, unitPrice: true, totalPrice: true } },
    },
  });

  if (!tx) return jsonError("Transaction not found", 404);

  return jsonSuccess({
    id: tx.id,
    date: tx.date.toISOString(),
    time: tx.time,
    amount: tx.amount ? Number(tx.amount) : null,
    currency: tx.currency,
    type: tx.type,
    merchant: tx.merchant,
    description: tx.description,
    source: tx.source,
    confirmed: tx.confirmed,
    category: tx.category,
    account: tx.account,
    tags: tx.tags.map((t) => t.tag),
    lineItems: tx.lineItems,
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  });
}

// PATCH /api/v1/transactions/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.transaction.findUnique({
    where: { id, userId: auth.userId },
  });
  if (!existing) return jsonError("Transaction not found", 404);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
      422
    );
  }

  const { tagIds, ...data } = parsed.data;

  const tx = await prisma.transaction.update({
    where: { id, userId: auth.userId },
    data,
  });

  if (tagIds) {
    await prisma.transactionTag.deleteMany({ where: { transactionId: id } });
    if (tagIds.length > 0) {
      await prisma.transactionTag.createMany({
        data: tagIds.map((tagId: string) => ({ transactionId: id, tagId })),
      });
    }
  }

  return jsonSuccess({
    id: tx.id,
    date: tx.date.toISOString(),
    amount: tx.amount ? Number(tx.amount) : null,
    currency: tx.currency,
    type: tx.type,
    merchant: tx.merchant,
    updatedAt: tx.updatedAt.toISOString(),
  });
}

// DELETE /api/v1/transactions/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.transaction.findUnique({
    where: { id, userId: auth.userId },
  });
  if (!existing) return jsonError("Transaction not found", 404);

  await prisma.transaction.delete({ where: { id, userId: auth.userId } });
  return jsonSuccess({ deleted: true });
}
