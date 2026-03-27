"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import type {
  BillNegotiatorResult,
  BillNegotiatorRecommendation,
  BillNegotiatorHistoryItem,
} from "@/lib/types";

// ── Bill Negotiator (AI) ──

export async function getBillNegotiation(): Promise<
  { data: BillNegotiatorResult } | { error: string }
> {
  const userId = await requireAuth();
  const settings = await prisma.appSettings.findUnique({ where: { userId } });

  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }
  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  const primaryCurrency = settings.currency ?? "AED";
  const rates = await getCurrencyRates();

  // Gather bills, installments, and recurring transactions (last 3 months)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [bills, installments, transactions] = await Promise.all([
    prisma.bill.findMany({ where: { userId, isActive: true } }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: threeMonthsAgo }, type: "expense" },
      select: { merchant: true, amount: true, currency: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  // Detect recurring merchants (appear 2+ times)
  const merchantCounts = new Map<string, { count: number; totalAmount: number; avgAmount: number }>();
  for (const tx of transactions) {
    const name = tx.merchant?.trim();
    if (!name) continue;
    const entry = merchantCounts.get(name) ?? { count: 0, totalAmount: 0, avgAmount: 0 };
    entry.count++;
    entry.totalAmount += convertAmount(Math.abs(Number(tx.amount)), tx.currency, primaryCurrency, rates);
    merchantCounts.set(name, entry);
  }

  const recurringMerchants = [...merchantCounts.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([name, v]) => ({
      name,
      count: v.count,
      totalAmount: Math.round(v.totalAmount),
      avgPerMonth: Math.round(v.totalAmount / 3),
    }))
    .sort((a, b) => b.avgPerMonth - a.avgPerMonth)
    .slice(0, 30);

  const billLines = bills.map(
    (b) => `- Bill "${b.name}": ~${Math.round(convertAmount(Number(b.amount), b.currency, primaryCurrency, rates))} ${primaryCurrency}/month (due day ${b.dueDay})`
  );

  const installmentLines = installments.map((i) => {
    const remaining = i.totalCount !== null ? `${i.totalCount - i.paidCount} left` : "ongoing";
    return `- Installment "${i.name}": ${Math.round(convertAmount(Number(i.amount), i.currency, primaryCurrency, rates))} ${primaryCurrency}/month (${remaining})`;
  });

  const recurringLines = recurringMerchants.map(
    (m) => `- "${m.name}": ~${m.avgPerMonth} ${primaryCurrency}/month (${m.count} transactions in 3 months, total ${m.totalAmount})`
  );

  const userContext = `
FINANCIAL OBLIGATIONS & RECURRING SPENDING (all amounts in ${primaryCurrency}):

BILLS:
${billLines.length > 0 ? billLines.join("\n") : "- None"}

INSTALLMENTS:
${installmentLines.length > 0 ? installmentLines.join("\n") : "- None"}

RECURRING TRANSACTIONS (last 3 months):
${recurringLines.length > 0 ? recurringLines.join("\n") : "- None"}
`.trim();

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.billNegotiator);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { error: "No response from AI" };

    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as BillNegotiatorResult;

    if (!Array.isArray(parsed.recommendations)) {
      return { error: "AI returned an unexpected format" };
    }

    await prisma.billNegotiation.create({
      data: {
        userId,
        totalMonthlySavings: parsed.totalMonthlySavings,
        totalYearlySavings: parsed.totalYearlySavings,
        recommendations: JSON.parse(JSON.stringify(parsed.recommendations)),
      },
    });

    return { data: parsed };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI analysis failed: ${msg}` };
  }
}

export async function getBillNegotiationHistory(): Promise<BillNegotiatorHistoryItem[]> {
  const userId = await requireAuth();
  const rows = await prisma.billNegotiation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    totalMonthlySavings: r.totalMonthlySavings,
    totalYearlySavings: r.totalYearlySavings,
    recommendations: r.recommendations as unknown as BillNegotiatorRecommendation[],
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function deleteBillNegotiation(id: string) {
  const userId = await requireAuth();
  await prisma.billNegotiation.delete({ where: { id, userId } });
  return { success: true };
}
