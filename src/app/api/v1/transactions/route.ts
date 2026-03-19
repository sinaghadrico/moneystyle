import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, jsonError, jsonSuccess } from "@/lib/api-auth";
import { transactionCreateSchema } from "@/lib/validators";

// GET /api/v1/transactions — List transactions
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
  const sortBy = searchParams.get("sortBy") ?? "date";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {
    userId: auth.userId,
    mergedIntoId: null,
  };

  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const type = searchParams.get("type");
  if (type) where.type = type;

  const categoryId = searchParams.get("categoryId");
  if (categoryId) where.categoryId = categoryId;

  const accountId = searchParams.get("accountId");
  if (accountId) where.accountId = accountId;

  const merchant = searchParams.get("merchant");
  if (merchant) where.merchant = { contains: merchant, mode: "insensitive" };

  const confirmed = searchParams.get("confirmed");
  if (confirmed !== null) where.confirmed = confirmed !== "false";

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        account: { select: { id: true, name: true, type: true } },
        tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return jsonSuccess({
    data: transactions.map((tx) => ({
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
      createdAt: tx.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/v1/transactions — Create transaction
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
      422
    );
  }

  const { tagIds, ...data } = parsed.data;

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      source: "api",
      userId: auth.userId,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
      account: { select: { id: true, name: true, type: true } },
    },
  });

  return jsonSuccess(
    {
      id: transaction.id,
      date: transaction.date.toISOString(),
      amount: transaction.amount ? Number(transaction.amount) : null,
      currency: transaction.currency,
      type: transaction.type,
      merchant: transaction.merchant,
      category: transaction.category,
      account: transaction.account,
      createdAt: transaction.createdAt.toISOString(),
    },
    201
  );
}
