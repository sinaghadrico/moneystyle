import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const CATEGORY_COLORS: Record<string, string> = {
  deposit: "#22c55e",
  food: "#f97316",
  groceries: "#84cc16",
  transport: "#3b82f6",
  utilities: "#8b5cf6",
  other: "#6b7280",
  housing: "#ec4899",
  entertainment: "#06b6d4",
  clothing: "#f43f5e",
  transfer: "#14b8a6",
  healthcare: "#ef4444",
  subscription: "#a855f7",
  education: "#eab308",
  government: "#64748b",
};

function normalizeItems(items: unknown): string | null {
  if (items === null || items === undefined) return null;
  if (typeof items === "string") return items;
  if (Array.isArray(items)) return JSON.stringify(items);
  return String(items);
}

const DEFAULT_ACCOUNT_ID = "default_farnoosh_mashreq";

async function main() {
  console.log("Seeding database...");

  const filePath = path.join(process.cwd(), "transactions.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const transactions: Array<Record<string, unknown>> = data.transactions;

  console.log(`Found ${transactions.length} transactions`);

  // Create default account
  await prisma.account.upsert({
    where: { id: DEFAULT_ACCOUNT_ID },
    update: {},
    create: {
      id: DEFAULT_ACCOUNT_ID,
      name: "Farnoosh Mashreq",
      bank: "Mashreq",
      color: "#3b82f6",
    },
  });
  console.log("Created default account");

  // Create categories
  const categories = Object.entries(CATEGORY_COLORS).map(([name, color]) => ({
    name,
    color,
  }));

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color },
      create: { name: cat.name, color: cat.color },
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Get category map
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  // Insert transactions in batches
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(
      batch.map((t) =>
        prisma.transaction.upsert({
          where: { id: t.id as string },
          update: {},
          create: {
            id: t.id as string,
            date: new Date(t.date as string),
            time: (t.time as string) || null,
            amount: t.amount != null ? t.amount as number : null,
            currency: (t.currency as string) || "AED",
            type: t.type as string,
            categoryId: categoryMap.get(t.category as string) || null,
            accountId: DEFAULT_ACCOUNT_ID,
            merchant: (t.merchant as string) || null,
            description: (t.description as string) || null,
            items: normalizeItems(t.items),
            source: (t.source as string) || null,
            hasReceipt: (t.hasReceipt as boolean) || false,
            mediaFiles: Array.isArray(t.mediaFiles)
              ? (t.mediaFiles as string[])
              : [],
          },
        })
      )
    );

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${transactions.length} transactions`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
