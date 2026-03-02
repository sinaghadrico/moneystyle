"use server";

import { prisma } from "@/lib/db";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";

// ── Types ──

export type MealData = {
  name: string;
  recipe: string;
  ingredients: string[];
  hasIngredients: boolean;
};

export type DayPlan = {
  day: string;
  meals: {
    breakfast: MealData;
    lunch: MealData;
    dinner: MealData;
  };
};

export type MealPlanData = {
  id: string;
  weekLabel: string;
  days: DayPlan[];
  shoppingList: string[];
  createdAt: string;
};

// ── Actions ──

export async function generateMealPlan(): Promise<
  { data: MealPlanData } | { error: string }
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

  // Get recent purchased items (last 60 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const items = await prisma.transactionItem.groupBy({
    by: ["name"],
    where: {
      transaction: {
        date: { gte: sixtyDaysAgo },
      },
    },
    _count: { name: true },
    _sum: { quantity: true },
    orderBy: { _count: { name: "desc" } },
    take: 80,
  });

  if (items.length === 0) {
    return {
      error:
        "No purchased items found in the last 60 days. Add transaction line items first.",
    };
  }

  const itemLines = items.map(
    (i) =>
      `- ${i.name} (bought ${i._count.name}x, total qty: ${Math.round((i._sum.quantity ?? 1) * 10) / 10})`
  );

  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.mealPlanner);

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here are the grocery items I've purchased recently:\n${itemLines.join("\n")}\n\nPlease create a weekly Iranian meal plan using these ingredients.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { error: "No response from AI" };
    }

    const jsonStr = content
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");

    const parsed = JSON.parse(jsonStr) as {
      days: DayPlan[];
      shoppingList: string[];
    };

    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      return { error: "AI returned an unexpected format" };
    }

    // Build week label
    const now = new Date();
    const weekLabel = `${now.toLocaleDateString("fa-IR", { month: "long", day: "numeric" })} — هفته`;

    // Save to DB
    const saved = await prisma.mealPlan.create({
      data: {
        weekLabel,
        plan: JSON.parse(JSON.stringify(parsed)),
      },
    });

    return {
      data: {
        id: saved.id,
        weekLabel: saved.weekLabel,
        days: parsed.days,
        shoppingList: parsed.shoppingList ?? [],
        createdAt: saved.createdAt.toISOString(),
      },
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI meal planning failed: ${msg}` };
  }
}

export async function getMealPlans(): Promise<MealPlanData[]> {
  const rows = await prisma.mealPlan.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return rows.map((r) => {
    const plan = r.plan as unknown as {
      days: DayPlan[];
      shoppingList: string[];
    };
    return {
      id: r.id,
      weekLabel: r.weekLabel,
      days: plan.days,
      shoppingList: plan.shoppingList ?? [],
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function deleteMealPlan(id: string) {
  await prisma.mealPlan.delete({ where: { id } });
  return { success: true };
}
