"use server";

import { prisma } from "@/lib/db";
import { userPreferenceSchema } from "@/lib/validators";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";
import { getBudgetProgress } from "@/actions/budgets";
import type { UserPreferenceData, WeekendPlanData, WeekendOffer } from "@/lib/types";

// ── Preferences ──

export async function getUserPreferences(): Promise<UserPreferenceData> {
  const row = await prisma.userPreference.findUnique({
    where: { id: "default" },
  });
  return {
    entertainment: row?.entertainment ?? [],
    food: row?.food ?? [],
    likes: row?.likes ?? [],
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

  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.weekendPlanner);

  const userMessage = `Here are my preferences:
Entertainment: ${prefs.entertainment.join(", ") || "none specified"}
Food: ${prefs.food.join(", ") || "none specified"}
Likes: ${prefs.likes.join(", ") || "none specified"}

My budget status this month:
${budgetLines.length > 0 ? budgetLines.join("\n") : "No budgets set"}

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
      },
    });

    return {
      data: {
        id: saved.id,
        weekLabel: saved.weekLabel,
        offers: parsed.offers,
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
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function deleteWeekendPlan(id: string) {
  await prisma.weekendPlan.delete({ where: { id } });
  return { success: true };
}
