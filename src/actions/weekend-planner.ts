"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  userPreferenceSchema,
  rateItemSchema,
  swapItemSchema,
  linkTransactionsSchema,
} from "@/lib/validators";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import { getBudgetProgress } from "@/actions/budgets";
import { getUaeSeason } from "@/lib/utils";
import type {
  UserPreferenceData,
  WeekendPlanData,
  WeekendOffer,
  WeekendPlanRatings,
  WeekendSpendingComparison,
  WeekendActivity,
  WeekendFoodSuggestion,
} from "@/lib/types";

// ── Preferences ──

export async function getUserPreferences(): Promise<UserPreferenceData> {
  const row = await prisma.userPreference.findUnique({
    where: { id: "default" },
  });
  return {
    entertainment: row?.entertainment ?? [],
    food: row?.food ?? [],
    likes: row?.likes ?? [],
    city: row?.city ?? "Dubai",
    companionType: row?.companionType ?? "solo",
  };
}

export async function updateUserPreferences(
  data: Record<string, unknown>
): Promise<{ success: boolean } | { error: string }> {
  const parsed = userPreferenceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid preferences data" };
  }

  await prisma.userPreference.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });

  return { success: true };
}

// ── Internal: Past Ratings Summary ──

async function getPastRatingsSummary(): Promise<string> {
  const recentPlans = await prisma.weekendPlan.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    where: { ratings: { not: Prisma.JsonNull } },
  });

  const liked: string[] = [];
  const disliked: string[] = [];

  for (const plan of recentPlans) {
    const ratings = (plan.ratings ?? {}) as WeekendPlanRatings;
    const offers = (plan.plan as unknown as { offers: WeekendOffer[] }).offers;

    for (const [key, rating] of Object.entries(ratings)) {
      const [type, offerIdx, itemIdx] = key.split(":");
      const offer = offers[Number(offerIdx)];
      if (!offer) continue;

      let name = "";
      if (type === "activity") {
        name = offer.activities[Number(itemIdx)]?.name ?? "";
      } else if (type === "food") {
        name = offer.food[Number(itemIdx)]?.name ?? "";
      }

      if (name) {
        if (rating === "like") liked.push(name);
        else disliked.push(name);
      }
    }
  }

  if (liked.length === 0 && disliked.length === 0) return "";

  const lines: string[] = [];
  if (liked.length > 0)
    lines.push(`Previously LIKED: ${liked.slice(0, 10).join(", ")}`);
  if (disliked.length > 0)
    lines.push(`Previously DISLIKED: ${disliked.slice(0, 10).join(", ")}`);
  return lines.join("\n");
}

// ── Weekend Plans ──

export async function generateWeekendPlan(): Promise<
  { data: WeekendPlanData } | { error: string }
> {
  const settings = await prisma.appSettings.findFirst({
    where: { id: "default" },
  });

  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  // Load preferences
  const prefs = await getUserPreferences();
  if (
    prefs.entertainment.length === 0 &&
    prefs.food.length === 0 &&
    prefs.likes.length === 0
  ) {
    return {
      error:
        "No preferences set. Please add your entertainment, food, and likes in Profile first.",
    };
  }

  // Load budget progress
  const budgets = await getBudgetProgress();
  const budgetLines = budgets.map(
    (b) =>
      `- ${b.categoryName}: limit ${b.monthlyLimit} AED, spent ${b.spent} AED, remaining ${Math.max(0, b.monthlyLimit - b.spent)} AED`
  );

  // Season + feedback
  const season = getUaeSeason();
  const feedbackSummary = await getPastRatingsSummary();

  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.weekendPlanner);

  const userMessage = `Here are my preferences:
Entertainment: ${prefs.entertainment.join(", ") || "none specified"}
Food: ${prefs.food.join(", ") || "none specified"}
Likes: ${prefs.likes.join(", ") || "none specified"}

City: ${prefs.city}
Companion: ${prefs.companionType}
Season: ${season.season} — ${season.description}

My budget status this month:
${budgetLines.length > 0 ? budgetLines.join("\n") : "No budgets set"}
${feedbackSummary ? `\nFeedback from past plans:\n${feedbackSummary}` : ""}

Please generate 3 weekend plan offers (اقتصادی، متعادل، ویژه).`;

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { error: "No response from AI" };
    }

    const jsonStr = content
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");

    const parsed = JSON.parse(jsonStr) as { offers: WeekendOffer[] };

    if (!Array.isArray(parsed.offers) || parsed.offers.length === 0) {
      return { error: "AI returned an unexpected format" };
    }

    // Build week label
    const now = new Date();
    const weekLabel = `${now.toLocaleDateString("fa-IR", { month: "long", day: "numeric" })} — آخر هفته`;

    const saved = await prisma.weekendPlan.create({
      data: {
        weekLabel,
        plan: JSON.parse(JSON.stringify(parsed)),
        ratings: {},
        linkedTransactionIds: [],
      },
    });

    return {
      data: {
        id: saved.id,
        weekLabel: saved.weekLabel,
        offers: parsed.offers,
        ratings: {},
        linkedTransactionIds: [],
        createdAt: saved.createdAt.toISOString(),
      },
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI weekend planning failed: ${msg}` };
  }
}

export async function getWeekendPlans(): Promise<WeekendPlanData[]> {
  const rows = await prisma.weekendPlan.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return rows.map((r) => {
    const plan = r.plan as unknown as { offers: WeekendOffer[] };
    return {
      id: r.id,
      weekLabel: r.weekLabel,
      offers: plan.offers,
      ratings: (r.ratings ?? {}) as WeekendPlanRatings,
      linkedTransactionIds: r.linkedTransactionIds ?? [],
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function deleteWeekendPlan(id: string) {
  await prisma.weekendPlan.delete({ where: { id } });
  return { success: true };
}

// ── Rate Item ──

export async function rateWeekendItem(
  data: Record<string, unknown>
): Promise<{ success: boolean; ratings: WeekendPlanRatings } | { error: string }> {
  const parsed = rateItemSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid rating data" };

  const { planId, itemKey, rating } = parsed.data;

  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const currentRatings = (plan.ratings ?? {}) as WeekendPlanRatings;

  // Toggle: if same rating exists, remove it
  if (currentRatings[itemKey] === rating) {
    delete currentRatings[itemKey];
  } else {
    currentRatings[itemKey] = rating;
  }

  await prisma.weekendPlan.update({
    where: { id: planId },
    data: { ratings: currentRatings },
  });

  return { success: true, ratings: currentRatings };
}

// ── Swap Item ──

export async function swapWeekendItem(
  data: Record<string, unknown>
): Promise<{ success: boolean; offers: WeekendOffer[] } | { error: string }> {
  const parsed = swapItemSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid swap data" };

  const { planId, offerIndex, itemType, itemIndex, reason } = parsed.data;

  const settings = await prisma.appSettings.findFirst({
    where: { id: "default" },
  });
  if (!settings?.aiEnabled) return { error: "AI is not enabled." };

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "OpenAI API key is not configured." };

  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const planData = plan.plan as unknown as { offers: WeekendOffer[] };
  const offer = planData.offers[offerIndex];
  if (!offer) return { error: "Offer not found" };

  const currentItem =
    itemType === "activity"
      ? offer.activities[itemIndex]
      : offer.food[itemIndex];
  if (!currentItem) return { error: "Item not found" };

  const prefs = await getUserPreferences();
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.weekendItemSwap);

  const userMessage = `City: ${prefs.city}
Companion: ${prefs.companionType}
Offer tier: ${offerIndex === 0 ? "Budget" : offerIndex === 1 ? "Balanced" : "Premium"}

Current ${itemType} to replace:
${JSON.stringify(currentItem)}
${reason ? `\nReason for swap: ${reason}` : ""}

Generate a replacement ${itemType}.`;

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return { error: "No response from AI" };

    const jsonStr = content
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
    const result = JSON.parse(jsonStr);

    if (itemType === "activity" && result.activity) {
      offer.activities[itemIndex] = result.activity as WeekendActivity;
    } else if (itemType === "food" && result.food) {
      offer.food[itemIndex] = result.food as WeekendFoodSuggestion;
    } else {
      return { error: "AI returned an unexpected format" };
    }

    // Recalculate total cost
    offer.totalCost =
      offer.activities.reduce((s, a) => s + a.estimatedCost, 0) +
      offer.food.reduce((s, f) => s + f.estimatedCost, 0);

    await prisma.weekendPlan.update({
      where: { id: planId },
      data: { plan: JSON.parse(JSON.stringify(planData)) },
    });

    return { success: true, offers: planData.offers };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `Swap failed: ${msg}` };
  }
}

// ── Link / Unlink Transactions ──

export async function linkTransactionsToWeekendPlan(
  data: Record<string, unknown>
): Promise<{ success: boolean; linkedTransactionIds: string[] } | { error: string }> {
  const parsed = linkTransactionsSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data" };

  const { planId, transactionIds } = parsed.data;

  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const existing = new Set(plan.linkedTransactionIds ?? []);
  for (const id of transactionIds) existing.add(id);

  const merged = Array.from(existing);

  await prisma.weekendPlan.update({
    where: { id: planId },
    data: { linkedTransactionIds: merged },
  });

  return { success: true, linkedTransactionIds: merged };
}

export async function unlinkTransactionFromWeekendPlan(
  planId: string,
  txId: string
): Promise<{ success: boolean; linkedTransactionIds: string[] } | { error: string }> {
  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const updated = (plan.linkedTransactionIds ?? []).filter((id) => id !== txId);

  await prisma.weekendPlan.update({
    where: { id: planId },
    data: { linkedTransactionIds: updated },
  });

  return { success: true, linkedTransactionIds: updated };
}

// ── Spending Comparison ──

export async function getWeekendSpendingComparison(
  planId: string,
  offerIndex: number
): Promise<WeekendSpendingComparison | { error: string }> {
  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const planData = plan.plan as unknown as { offers: WeekendOffer[] };
  const offer = planData.offers[offerIndex];
  if (!offer) return { error: "Offer not found" };

  const estimatedTotal = offer.totalCost;

  const txIds = plan.linkedTransactionIds ?? [];
  if (txIds.length === 0) {
    return {
      estimatedTotal,
      actualTotal: 0,
      difference: -estimatedTotal,
      linkedTransactions: [],
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: { id: { in: txIds } },
    include: { category: true },
  });

  const linkedTransactions = transactions.map((tx) => ({
    id: tx.id,
    merchant: tx.merchant,
    amount: Number(tx.amount ?? 0),
    date: tx.date.toISOString(),
    category: tx.category?.name ?? null,
  }));

  const actualTotal = linkedTransactions.reduce((s, t) => s + t.amount, 0);

  return {
    estimatedTotal,
    actualTotal,
    difference: actualTotal - estimatedTotal,
    linkedTransactions,
  };
}

// ── Calendar ICS Export ──

export async function generateWeekendIcs(
  planId: string,
  offerIndex: number
): Promise<{ ics: string } | { error: string }> {
  const plan = await prisma.weekendPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan not found" };

  const planData = plan.plan as unknown as { offers: WeekendOffer[] };
  const offer = planData.offers[offerIndex];
  if (!offer) return { error: "Offer not found" };

  // Target next Friday
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = ((5 - dayOfWeek + 7) % 7) || 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFriday);

  const timeSlotHours: Record<string, { start: number; end: number }> = {
    "صبح": { start: 8, end: 10 },
    "ظهر": { start: 12, end: 14 },
    "عصر": { start: 16, end: 18 },
    "شب": { start: 20, end: 22 },
  };

  const mealHours: Record<string, { start: number; end: number }> = {
    "صبحانه": { start: 7, end: 8 },
    "ناهار": { start: 12, end: 13 },
    "شام": { start: 19, end: 20 },
    "میان‌وعده": { start: 15, end: 16 },
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDate = (d: Date, hour: number) => {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(hour);
    return `${y}${m}${day}T${h}0000`;
  };

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}@weekendplanner`;

  const events: string[] = [];

  for (const activity of offer.activities) {
    const slot = timeSlotHours[activity.timeSlot] ?? { start: 10, end: 12 };
    events.push(
      `BEGIN:VEVENT\r\nUID:${uid()}\r\nDTSTART:${formatDate(friday, slot.start)}\r\nDTEND:${formatDate(friday, slot.end)}\r\nSUMMARY:${activity.name}\r\nDESCRIPTION:${activity.description}\\nLocation: ${activity.location || ""}\\nCost: ${activity.estimatedCost} AED\r\nLOCATION:${activity.location || ""}\r\nEND:VEVENT`
    );
  }

  for (const food of offer.food) {
    const slot = mealHours[food.meal] ?? { start: 12, end: 13 };
    events.push(
      `BEGIN:VEVENT\r\nUID:${uid()}\r\nDTSTART:${formatDate(friday, slot.start)}\r\nDTEND:${formatDate(friday, slot.end)}\r\nSUMMARY:${food.name}${food.restaurant ? ` @ ${food.restaurant}` : ""}\r\nDESCRIPTION:${food.description}\\nCost: ${food.estimatedCost} AED\r\nLOCATION:${food.restaurant || ""}\r\nEND:VEVENT`
    );
  }

  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Weekend Planner//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n${events.join("\r\n")}\r\nEND:VCALENDAR`;

  return { ics };
}
