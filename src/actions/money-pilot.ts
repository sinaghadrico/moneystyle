"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import type {
  MoneyPilotResult,
  MoneyPilotHistoryItem,
  MoneyPilotAction,
  MoneyPilotScoreBreakdown,
  MoneyPilotProjections,
  InvestmentSuggestions,
} from "@/lib/types";

export async function generateMoneyPilot(): Promise<
  { data: MoneyPilotResult } | { error: string }
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

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [incomeSources, bills, installments, reserves, recentTxns, savingsGoals] =
    await Promise.all([
      prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
      prisma.bill.findMany({ where: { userId, isActive: true } }),
      prisma.installment.findMany({ where: { userId, isActive: true } }),
      prisma.reserve.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: threeMonthsAgo } },
        select: {
          merchant: true,
          amount: true,
          currency: true,
          type: true,
          date: true,
          category: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.savingsGoal.findMany({ where: { userId, status: "active" } }),
    ]);

  const conv = (amount: number, currency: string) =>
    convertAmount(amount, currency, primaryCurrency, rates);

  // Monthly income
  const totalMonthlyIncome = incomeSources.reduce(
    (s, src) => s + conv(Number(src.amount), src.currency),
    0
  );

  // Monthly obligations
  const totalBills = bills.reduce((s, b) => s + conv(Number(b.amount), b.currency), 0);
  const totalInstallments = installments.reduce(
    (s, i) => s + conv(Number(i.amount), i.currency),
    0
  );
  const totalObligations = totalBills + totalInstallments;

  // Average monthly spending from transactions (last 3 months)
  const monthlyExpenses = new Map<string, number>();
  for (const t of recentTxns.filter((t) => t.type === "expense")) {
    const month = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    monthlyExpenses.set(
      month,
      (monthlyExpenses.get(month) ?? 0) + conv(Math.abs(Number(t.amount)), t.currency)
    );
  }
  const avgMonthlySpend =
    monthlyExpenses.size > 0
      ? [...monthlyExpenses.values()].reduce((a, b) => a + b, 0) / monthlyExpenses.size
      : 0;

  // Category breakdown (3 months averaged)
  const catTotals = new Map<string, number>();
  for (const t of recentTxns.filter((t) => t.type === "expense")) {
    const cat = t.category?.name || "Uncategorized";
    catTotals.set(cat, (catTotals.get(cat) ?? 0) + conv(Math.abs(Number(t.amount)), t.currency));
  }
  const categoryLines = [...catTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, total]) => `- ${name}: ${Math.round(total / 3)}/month (${Math.round(total)} total 3mo)`)
    .join("\n");

  // Reserves detail
  const totalReserves = reserves.reduce((s, r) => s + conv(Number(r.amount), r.currency), 0);
  const reserveLines = reserves
    .map(
      (r) =>
        `- ${r.name}: ${Math.round(conv(Number(r.amount), r.currency))} ${primaryCurrency} (type: ${r.type}, location: ${r.location}${r.note ? `, note: ${r.note}` : ""})`
    )
    .join("\n");

  // Installment details
  const installmentLines = installments.map((i) => {
    const remaining =
      i.totalCount !== null ? `${i.totalCount - i.paidCount}/${i.totalCount} left` : "ongoing";
    return `- ${i.name}: ${Math.round(conv(Number(i.amount), i.currency))}/month (${remaining})`;
  });

  // Top recurring merchants
  const merchantMonthly = new Map<string, number>();
  for (const t of recentTxns.filter((t) => t.type === "expense")) {
    const name = t.merchant?.trim();
    if (!name) continue;
    merchantMonthly.set(name, (merchantMonthly.get(name) ?? 0) + conv(Math.abs(Number(t.amount)), t.currency));
  }
  const topMerchants = [...merchantMonthly.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => `- ${name}: ~${Math.round(total / 3)}/month`)
    .join("\n");

  // Savings goals
  const goalLines = savingsGoals.map(
    (g) =>
      `- ${g.name}: target ${Number(g.targetAmount)} ${g.currency}, current ${Number(g.currentAmount)} (${Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)}%)${g.deadline ? `, deadline: ${g.deadline.toISOString().split("T")[0]}` : ""}`
  );

  const surplus = totalMonthlyIncome - avgMonthlySpend;

  const userContext = `
WEALTH PROFILE (all amounts in ${primaryCurrency}):

MONTHLY INCOME:
${incomeSources.map((s) => `- ${s.name}: ${Math.round(conv(Number(s.amount), s.currency))} (day ${s.depositDay})`).join("\n") || "- None"}
Total: ${Math.round(totalMonthlyIncome)}/month

AVERAGE MONTHLY SPENDING (last 3 months): ${Math.round(avgMonthlySpend)}
MONTHLY SURPLUS (income - spending): ${Math.round(surplus)}

FIXED OBLIGATIONS:
Bills: ${bills.map((b) => `${b.name} (${Math.round(conv(Number(b.amount), b.currency))})`).join(", ") || "None"}
Installments:
${installmentLines.join("\n") || "- None"}
Total obligations: ${Math.round(totalObligations)}/month

SPENDING BY CATEGORY (avg monthly):
${categoryLines || "- No data"}

TOP MERCHANTS (avg monthly):
${topMerchants || "- No data"}

RESERVES & SAVINGS (total: ${Math.round(totalReserves)}):
${reserveLines || "- None"}

SAVINGS GOALS:
${goalLines.join("\n") || "- None"}

EMERGENCY FUND NEEDED: ${Math.round(avgMonthlySpend * 3)} (3 months of expenses)
`.trim();

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.moneyPilot);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { error: "No response from AI" };

    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as MoneyPilotResult;

    if (!Array.isArray(parsed.actions) || typeof parsed.wealthScore !== "number") {
      return { error: "AI returned an unexpected format" };
    }

    await prisma.wealthPlan.create({
      data: {
        userId,
        wealthScore: parsed.wealthScore,
        scoreBreakdown: JSON.parse(JSON.stringify(parsed.scoreBreakdown)),
        monthlySurplus: parsed.monthlySurplus,
        investableCapital: parsed.investableCapital,
        projections: JSON.parse(JSON.stringify(parsed.projections)),
        actions: JSON.parse(JSON.stringify(parsed.actions)),
        investmentSuggestions: parsed.investmentSuggestions ? JSON.parse(JSON.stringify(parsed.investmentSuggestions)) : undefined,
        summary: parsed.summary,
      },
    });

    return { data: parsed };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `Analysis failed: ${msg}` };
  }
}

export async function getMoneyPilotHistory(): Promise<MoneyPilotHistoryItem[]> {
  const userId = await requireAuth();
  const rows = await prisma.wealthPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    wealthScore: r.wealthScore,
    scoreBreakdown: r.scoreBreakdown as unknown as MoneyPilotScoreBreakdown,
    monthlySurplus: r.monthlySurplus,
    investableCapital: r.investableCapital,
    projections: r.projections as unknown as MoneyPilotProjections,
    actions: r.actions as unknown as MoneyPilotAction[],
    investmentSuggestions: r.investmentSuggestions as unknown as InvestmentSuggestions | undefined,
    summary: r.summary,
    completedActions: r.completedActions,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function toggleMoneyPilotAction(planId: string, actionId: string) {
  const userId = await requireAuth();
  const plan = await prisma.wealthPlan.findUnique({ where: { id: planId, userId } });
  if (!plan) return { error: "Plan not found" };

  const completed = plan.completedActions.includes(actionId)
    ? plan.completedActions.filter((a) => a !== actionId)
    : [...plan.completedActions, actionId];

  await prisma.wealthPlan.update({
    where: { id: planId },
    data: { completedActions: completed },
  });
  return { success: true, completed };
}

export async function deleteMoneyPilot(id: string) {
  const userId = await requireAuth();
  await prisma.wealthPlan.delete({ where: { id, userId } });
  return { success: true };
}
