import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";

// GET /api/v1/categories
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  const categories = await prisma.category.findMany({
    where: { userId: auth.userId },
    select: {
      id: true,
      name: true,
      color: true,
      icon: true,
      _count: { select: { transactions: true } },
    },
    orderBy: { name: "asc" },
  });

  return jsonSuccess({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      transactionCount: c._count.transactions,
    })),
  });
}

// POST /api/v1/categories
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  let body: { name?: string; color?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const name = body.name?.trim();
  const color = body.color ?? "#6b7280";
  if (!name) return jsonError("name is required", 422);

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: auth.userId, name } },
  });
  if (existing) return jsonError("Category already exists", 409);

  const category = await prisma.category.create({
    data: { name, color, icon: body.icon ?? null, userId: auth.userId },
  });

  return jsonSuccess(
    { id: category.id, name: category.name, color: category.color, icon: category.icon },
    201
  );
}
