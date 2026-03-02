"use server";

import { prisma } from "@/lib/db";
import { settingsUpdateSchema, type SettingsUpdateInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

const DEFAULTS = {
  id: "default" as const,
  currency: "AED",
  defaultPageSize: 20,
  defaultAccountId: null,
  defaultTransactionType: "expense",
  defaultDashboardPeriod: "3m",
  autoCategorize: true,
  telegramEnabled: false,
  telegramBotToken: null,
  telegramWebhookSecret: null,
  telegramChatId: null,
  smsApiKey: null,
};

export async function getSettings() {
  const row = await prisma.appSettings.findFirst({ where: { id: "default" } });
  return row ?? DEFAULTS;
}

export async function updateSettings(
  data: SettingsUpdateInput,
): Promise<{ success: true } | { error: string }> {
  const parsed = settingsUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  await prisma.appSettings.upsert({
    where: { id: "default" },
    create: { ...parsed.data },
    update: { ...parsed.data },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function testTelegramConnection(
  botToken: string,
  chatId: string,
): Promise<{ success: true } | { error: string }> {
  if (!botToken || !chatId) {
    return { error: "Bot token and chat ID are required" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Revenue app connected successfully!",
        }),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        error: (body as { description?: string }).description || `HTTP ${res.status}`,
      };
    }

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Connection failed" };
  }
}

export async function exportTransactions(
  format: "csv" | "json",
): Promise<string> {
  const transactions = await prisma.transaction.findMany({
    where: { mergedIntoId: null },
    include: {
      category: true,
      account: true,
      tags: { include: { tag: true } },
    },
    orderBy: { date: "desc" },
  });

  if (format === "json") {
    return JSON.stringify(
      transactions.map((tx) => ({
        id: tx.id,
        date: tx.date.toISOString().split("T")[0],
        time: tx.time,
        amount: tx.amount != null ? Number(tx.amount) : null,
        currency: tx.currency,
        type: tx.type,
        category: tx.category?.name ?? null,
        account: tx.account.name,
        merchant: tx.merchant,
        description: tx.description,
        tags: tx.tags.map((t) => t.tag.name),
        source: tx.source,
      })),
      null,
      2,
    );
  }

  // CSV
  const header =
    "Date,Time,Amount,Currency,Type,Category,Account,Merchant,Description,Tags,Source";
  const rows = transactions.map((tx) => {
    const fields = [
      tx.date.toISOString().split("T")[0],
      tx.time ?? "",
      tx.amount != null ? Number(tx.amount).toString() : "",
      tx.currency,
      tx.type,
      tx.category?.name ?? "",
      tx.account.name,
      `"${(tx.merchant ?? "").replace(/"/g, '""')}"`,
      `"${(tx.description ?? "").replace(/"/g, '""')}"`,
      `"${tx.tags.map((t) => t.tag.name).join(", ")}"`,
      tx.source ?? "",
    ];
    return fields.join(",");
  });

  return [header, ...rows].join("\n");
}
