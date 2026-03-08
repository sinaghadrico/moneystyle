"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getCurrencyRates } from "@/actions/currencies";
import { convertAmount } from "@/lib/currency";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatSessionItem = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export async function sendMoneyChat(
  messages: ChatMessage[]
): Promise<{ reply: string } | { error: string }> {
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

  // Gather financial context
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [
    incomeSources,
    bills,
    installments,
    reserves,
    thisMonthTxns,
    lastMonthTxns,
    recentTxns,
    accounts,
    budgets,
  ] = await Promise.all([
    prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
    prisma.bill.findMany({ where: { userId, isActive: true } }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
    prisma.reserve.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: thisMonthStart } },
      select: { merchant: true, amount: true, currency: true, type: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: lastMonthStart, lt: thisMonthStart } },
      select: { merchant: true, amount: true, currency: true, type: true, date: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: threeMonthsAgo } },
      select: { merchant: true, amount: true, currency: true, type: true, date: true, category: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.account.findMany({ where: { userId }, select: { name: true, type: true } }),
    prisma.budget.findMany({ include: { category: true } }),
  ]);

  // Compute summaries
  const sumTxns = (txns: typeof thisMonthTxns, type: string) =>
    txns
      .filter((t) => t.type === type)
      .reduce((s, t) => s + convertAmount(Math.abs(Number(t.amount)), t.currency, primaryCurrency, rates), 0);

  const thisMonthIncome = Math.round(sumTxns(thisMonthTxns, "income"));
  const thisMonthExpense = Math.round(sumTxns(thisMonthTxns, "expense"));
  const lastMonthIncome = Math.round(sumTxns(lastMonthTxns, "income"));
  const lastMonthExpense = Math.round(sumTxns(lastMonthTxns, "expense"));

  // Top merchants this month
  const merchantTotals = new Map<string, number>();
  for (const t of thisMonthTxns.filter((t) => t.type === "expense")) {
    const name = t.merchant?.trim() || "Unknown";
    merchantTotals.set(name, (merchantTotals.get(name) ?? 0) + convertAmount(Math.abs(Number(t.amount)), t.currency, primaryCurrency, rates));
  }
  const topMerchants = [...merchantTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => `${name}: ${Math.round(total)} ${primaryCurrency}`)
    .join("\n");

  // Category breakdown this month
  const categoryTotals = new Map<string, number>();
  for (const t of recentTxns.filter((t) => t.type === "expense" && t.date >= thisMonthStart)) {
    const cat = t.category?.name || "Uncategorized";
    categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + convertAmount(Math.abs(Number(t.amount)), t.currency, primaryCurrency, rates));
  }
  const categoryBreakdown = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => `${name}: ${Math.round(total)} ${primaryCurrency}`)
    .join("\n");

  // Recent transactions (last 15)
  const recentList = recentTxns.slice(0, 15).map((t) => {
    const amt = convertAmount(Math.abs(Number(t.amount)), t.currency, primaryCurrency, rates);
    return `${t.date.toISOString().split("T")[0]} | ${t.type} | ${t.merchant || "?"} | ${Math.round(amt)} ${primaryCurrency} | ${t.category?.name || "?"}`;
  }).join("\n");

  const totalMonthlyRecurring = [
    ...bills.map((b) => convertAmount(Number(b.amount), b.currency, primaryCurrency, rates)),
    ...installments.map((i) => convertAmount(Number(i.amount), i.currency, primaryCurrency, rates)),
  ].reduce((s, a) => s + a, 0);

  const totalIncome = incomeSources.reduce(
    (s, src) => s + convertAmount(Number(src.amount), src.currency, primaryCurrency, rates), 0
  );

  const totalReserves = reserves.reduce(
    (s, r) => s + convertAmount(Number(r.amount), r.currency, primaryCurrency, rates), 0
  );

  const financialContext = `
FINANCIAL CONTEXT (currency: ${primaryCurrency}, today: ${now.toISOString().split("T")[0]}):

THIS MONTH:
- Income: ${thisMonthIncome} ${primaryCurrency} (${thisMonthTxns.filter((t) => t.type === "income").length} transactions)
- Expenses: ${thisMonthExpense} ${primaryCurrency} (${thisMonthTxns.filter((t) => t.type === "expense").length} transactions)
- Net: ${thisMonthIncome - thisMonthExpense} ${primaryCurrency}

LAST MONTH:
- Income: ${lastMonthIncome} ${primaryCurrency}
- Expenses: ${lastMonthExpense} ${primaryCurrency}

RECURRING MONTHLY:
- Income sources: ${incomeSources.map((s) => `${s.name} (${Math.round(convertAmount(Number(s.amount), s.currency, primaryCurrency, rates))})`).join(", ") || "None"}
- Total monthly income: ${Math.round(totalIncome)} ${primaryCurrency}
- Bills: ${bills.map((b) => `${b.name} (${Math.round(convertAmount(Number(b.amount), b.currency, primaryCurrency, rates))})`).join(", ") || "None"}
- Installments: ${installments.map((i) => `${i.name} (${Math.round(convertAmount(Number(i.amount), i.currency, primaryCurrency, rates))})`).join(", ") || "None"}
- Total recurring expenses: ${Math.round(totalMonthlyRecurring)} ${primaryCurrency}

RESERVES: ${Math.round(totalReserves)} ${primaryCurrency} total
${reserves.map((r) => `- ${r.name}: ${Math.round(convertAmount(Number(r.amount), r.currency, primaryCurrency, rates))} ${primaryCurrency} (${r.type})`).join("\n")}

ACCOUNTS: ${accounts.map((a) => `${a.name} (${a.type})`).join(", ") || "None"}

${budgets.length > 0 ? `BUDGETS:\n${budgets.map((b) => `- ${b.category?.name || "General"}: ${Number(b.monthlyLimit)} ${primaryCurrency}/month`).join("\n")}` : ""}

TOP MERCHANTS THIS MONTH:
${topMerchants || "None yet"}

CATEGORY BREAKDOWN THIS MONTH:
${categoryBreakdown || "None yet"}

RECENT TRANSACTIONS:
${recentList || "None"}
`.trim();

  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.moneyChat);

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: `${systemPrompt}\n\n${financialContext}` },
        ...messages.slice(-10).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();
    if (!reply) return { error: "No response from AI" };

    return { reply };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `Chat failed: ${msg}` };
  }
}

// ── Chat Session CRUD ──

export async function getChatSessions(): Promise<ChatSessionItem[]> {
  const userId = await requireAuth();
  const rows = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    messages: r.messages as unknown as ChatMessage[],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function saveChatSession(
  sessionId: string | null,
  title: string,
  messages: ChatMessage[]
): Promise<{ id: string }> {
  const userId = await requireAuth();

  if (sessionId) {
    await prisma.chatSession.update({
      where: { id: sessionId, userId },
      data: { title, messages: JSON.parse(JSON.stringify(messages)) },
    });
    return { id: sessionId };
  }

  const session = await prisma.chatSession.create({
    data: {
      userId,
      title,
      messages: JSON.parse(JSON.stringify(messages)),
    },
  });
  return { id: session.id };
}

export async function deleteChatSession(id: string) {
  const userId = await requireAuth();
  await prisma.chatSession.delete({ where: { id, userId } });
  return { success: true };
}
