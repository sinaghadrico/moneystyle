"use server";

import { prisma } from "@/lib/db";
import {
  settingsUpdateSchema,
  smsPatternCreateSchema,
  smsPatternUpdateSchema,
  type SettingsUpdateInput,
  type SmsPatternCreateInput,
  type SmsPatternUpdateInput,
} from "@/lib/validators";
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
  aiEnabled: false,
  openaiApiKey: null,
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

// --- SMS Patterns ---

const DEFAULT_SMS_PATTERNS: SmsPatternCreateInput[] = [
  {
    name: "Mashreq Purchase",
    regex: "for\\s+AED\\s+([\\d,]+\\.?\\d*)\\s+at\\s+(.+?)\\s+on\\s+\\d{2}-[A-Z]{3}-\\d{4}",
    type: "expense",
    priority: 10,
    amountCaptureGroup: 1,
    merchantCaptureGroup: 2,
    enabled: true,
  },
  {
    name: "Mashreq Deposit",
    regex: "AED\\s+([\\d,]+\\.?\\d*)\\s+has been deposited",
    type: "income",
    priority: 20,
    amountCaptureGroup: 1,
    enabled: true,
  },
  {
    name: "Salary Credit",
    regex: "salary.*?AED\\s+([\\d,]+\\.?\\d*)",
    type: "income",
    priority: 30,
    amountCaptureGroup: 1,
    enabled: true,
  },
  {
    name: "Salary Credit (alt)",
    regex: "AED\\s+([\\d,]+\\.?\\d*)\\s+.*?(?:salary|credited)",
    type: "income",
    priority: 31,
    amountCaptureGroup: 1,
    enabled: true,
  },
  {
    name: "ATM Withdrawal",
    regex: "AED\\s+([\\d,]+\\.?\\d*)\\s+.*?(?:withdrawn|ATM|cash)",
    type: "expense",
    priority: 40,
    amountCaptureGroup: 1,
    enabled: true,
  },
  {
    name: "Generic AED Amount",
    regex: "AED\\s+([\\d,]+\\.?\\d*)",
    type: "auto",
    priority: 99,
    amountCaptureGroup: 1,
    enabled: true,
    creditKeywords: "deposit,credit,receiv,salary,transfer to your",
  },
];

export async function getSmsPatterns() {
  let patterns = await prisma.smsPattern.findMany({
    orderBy: { priority: "asc" },
  });

  // Auto-seed if table is empty
  if (patterns.length === 0) {
    await prisma.$transaction(
      DEFAULT_SMS_PATTERNS.map((p) =>
        prisma.smsPattern.create({ data: p }),
      ),
    );
    patterns = await prisma.smsPattern.findMany({
      orderBy: { priority: "asc" },
    });
  }

  return patterns;
}

export async function createSmsPattern(
  data: SmsPatternCreateInput,
): Promise<{ success: true; id: string } | { error: string }> {
  const parsed = smsPatternCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  // Validate regex compiles
  try {
    new RegExp(parsed.data.regex, "i");
  } catch (e) {
    return { error: `Invalid regex: ${e instanceof Error ? e.message : "unknown error"}` };
  }

  try {
    const pattern = await prisma.smsPattern.create({ data: parsed.data });
    revalidatePath("/settings");
    return { success: true, id: pattern.id };
  } catch (e) {
    if (String(e).includes("Unique constraint")) {
      return { error: "A pattern with this name already exists" };
    }
    return { error: "Failed to create pattern" };
  }
}

export async function updateSmsPattern(
  id: string,
  data: SmsPatternUpdateInput,
): Promise<{ success: true } | { error: string }> {
  const parsed = smsPatternUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  if (parsed.data.regex) {
    try {
      new RegExp(parsed.data.regex, "i");
    } catch (e) {
      return { error: `Invalid regex: ${e instanceof Error ? e.message : "unknown error"}` };
    }
  }

  try {
    await prisma.smsPattern.update({ where: { id }, data: parsed.data });
    revalidatePath("/settings");
    return { success: true };
  } catch (e) {
    if (String(e).includes("Unique constraint")) {
      return { error: "A pattern with this name already exists" };
    }
    return { error: "Failed to update pattern" };
  }
}

export async function deleteSmsPattern(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    await prisma.smsPattern.delete({ where: { id } });
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Failed to delete pattern" };
  }
}

export async function testSmsPattern(
  regex: string,
  smsText: string,
  amountGroup: number,
  merchantGroup: number | null,
): Promise<
  { success: true; amount: string; merchant: string | null } | { error: string }
> {
  let re: RegExp;
  try {
    re = new RegExp(regex, "i");
  } catch (e) {
    return { error: `Invalid regex: ${e instanceof Error ? e.message : "unknown error"}` };
  }

  const match = smsText.replace(/\s+/g, " ").trim().match(re);
  if (!match) {
    return { error: "No match found" };
  }

  const amountStr = match[amountGroup];
  if (!amountStr) {
    return { error: `Capture group ${amountGroup} not found in match` };
  }

  const amount = parseFloat(amountStr.replace(/,/g, ""));
  if (isNaN(amount) || amount <= 0) {
    return { error: `Captured value "${amountStr}" is not a valid amount` };
  }

  const merchant =
    merchantGroup && match[merchantGroup]
      ? match[merchantGroup].trim()
      : null;

  return { success: true, amount: amount.toFixed(2), merchant };
}

// ── AI Prompts ──

export type AiPromptData = {
  key: string;
  label: string;
  content: string;
  isCustom: boolean;
};

export async function getAiPrompts(): Promise<AiPromptData[]> {
  const { DEFAULT_PROMPTS } = await import("@/lib/ai-prompts");
  const rows = await prisma.aiPrompt.findMany();
  const customMap = new Map(rows.map((r) => [r.key, r.content]));

  return Object.entries(DEFAULT_PROMPTS).map(([key, def]) => ({
    key,
    label: def.label,
    content: customMap.get(key) ?? def.content,
    isCustom: customMap.has(key),
  }));
}

export async function updateAiPrompt(key: string, content: string) {
  await prisma.aiPrompt.upsert({
    where: { key },
    create: { key, content },
    update: { content },
  });
  return { success: true };
}

export async function resetAiPrompt(key: string) {
  await prisma.aiPrompt.deleteMany({ where: { key } });
  return { success: true };
}
