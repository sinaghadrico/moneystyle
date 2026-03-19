import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/v1/categories/:id
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id, userId: auth.userId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!category) return jsonError("Category not found", 404);

  return jsonSuccess({
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
    transactionCount: category._count.transactions,
  });
}

// PATCH /api/v1/categories/:id
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.category.findUnique({ where: { id, userId: auth.userId } });
  if (!existing) return jsonError("Category not found", 404);

  let body: { name?: string; color?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const category = await prisma.category.update({
    where: { id, userId: auth.userId },
    data: {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.color ? { color: body.color } : {}),
      ...(body.icon !== undefined ? { icon: body.icon } : {}),
    },
  });

  return jsonSuccess({ id: category.id, name: category.name, color: category.color, icon: category.icon });
}

// DELETE /api/v1/categories/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const existing = await prisma.category.findUnique({ where: { id, userId: auth.userId } });
  if (!existing) return jsonError("Category not found", 404);

  await prisma.category.delete({ where: { id, userId: auth.userId } });
  return jsonSuccess({ deleted: true });
}
