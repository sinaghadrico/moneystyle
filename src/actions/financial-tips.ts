"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export type FinancialTip = {
  id: string;
  title: string;
  description: string;
  type: "warning" | "suggestion" | "achievement";
  icon: string;
};

export async function getFinancialTips(): Promise<FinancialTip[]> {
  const userId = await requireAuth();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const [
    settings,
    transactionCount,
    thisMonthExpenses,
    categories,
    budgets,
    savingsGoals,
    reserves,
    incomeSources,
    bills,
    installments,
  ] = await Promise.all([
    prisma.appSettings.findFirst({ where: { userId } }),
    prisma.transaction.count({ where: { userId, confirmed: true, mergedIntoId: null } }),
    prisma.transaction.findMany({
      where: { userId, type: "expense", date: { gte: thisMonthStart }, confirmed: true, mergedIntoId: null },
      select: { amount: true, categoryId: true },
    }),
    prisma.category.findMany({ where: { userId }, select: { id: true, name: true } }),
    prisma.budget.findMany({
      include: { category: { select: { name: true, userId: true } } },
    }),
    prisma.savingsGoal.findMany({ where: { userId, status: "active" } }),
    prisma.reserve.findMany({ where: { userId } }),
    prisma.incomeSource.findMany({ where: { userId, isActive: true } }),
    prisma.bill.findMany({ where: { userId, isActive: true } }),
    prisma.installment.findMany({ where: { userId, isActive: true } }),
  ]);

  const tips: FinancialTip[] = [];
  const userBudgets = budgets.filter((b) => b.category.userId === userId);

  // ── Getting Started Tips ──

  if (transactionCount === 0) {
    tips.push({
      id: "no-transactions",
      title: "Log Your First Expense",
      description: "Start by adding your first transaction. The more you log, the smarter MoneyStyle gets.",
      type: "suggestion",
      icon: "receipt",
    });
  }

  if (categories.length <= 3) {
    tips.push({
      id: "few-categories",
      title: "Set Up Your Categories",
      description: "Create categories like Groceries, Transport, and Entertainment to see exactly where your money goes.",
      type: "suggestion",
      icon: "tag",
    });
  }

  if (incomeSources.length === 0) {
    tips.push({
      id: "no-income",
      title: "Add Your Income Sources",
      description: "Set up your salary and other income to track your real cashflow and see how much you can save.",
      type: "suggestion",
      icon: "trending-up",
    });
  }

  // ── Budget Tips ──

  if (userBudgets.length === 0 && transactionCount > 10) {
    tips.push({
      id: "no-budgets",
      title: "Create a Budget",
      description: "You have transactions but no budgets. Set spending limits per category to avoid overspending.",
      type: "suggestion",
      icon: "bar-chart",
    });
  }

  for (const budget of userBudgets) {
    const spent = thisMonthExpenses
      .filter((tx) => tx.categoryId === budget.categoryId)
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);
    const limit = Number(budget.monthlyLimit);
    const pct = limit > 0 ? (spent / limit) * 100 : 0;

    if (pct >= 100) {
      tips.push({
        id: `over-budget-${budget.categoryId}`,
        title: `Over Budget: ${budget.category.name}`,
        description: `You've spent ${Math.round(pct)}% of your ${budget.category.name} budget this month. Consider cutting back or adjusting your limit.`,
        type: "warning",
        icon: "alert-triangle",
      });
    } else if (pct >= 80) {
      tips.push({
        id: `near-budget-${budget.categoryId}`,
        title: `Almost There: ${budget.category.name}`,
        description: `You've used ${Math.round(pct)}% of your ${budget.category.name} budget. ${Math.round(limit - spent)} left for the rest of the month.`,
        type: "warning",
        icon: "alert-circle",
      });
    }
  }

  // ── Savings Tips ──

  if (savingsGoals.length === 0 && transactionCount > 20) {
    tips.push({
      id: "no-savings-goals",
      title: "Set a Savings Goal",
      description: "Whether it's an emergency fund, vacation, or a new gadget — setting a goal makes saving 3x more likely.",
      type: "suggestion",
      icon: "target",
    });
  }

  for (const goal of savingsGoals) {
    const pct = Number(goal.targetAmount) > 0
      ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
      : 0;
    if (pct >= 100) {
      tips.push({
        id: `goal-reached-${goal.id}`,
        title: `Goal Reached: ${goal.name}!`,
        description: `Congratulations! You've reached your savings goal. Time to set a new one?`,
        type: "achievement",
        icon: "trophy",
      });
    } else if (pct >= 75) {
      tips.push({
        id: `goal-close-${goal.id}`,
        title: `Almost There: ${goal.name}`,
        description: `You're ${Math.round(pct)}% of the way to your goal. Keep it up!`,
        type: "achievement",
        icon: "star",
      });
    }
  }

  // ── Emergency Fund ──

  const totalReserves = reserves.reduce((sum, r) => sum + Number(r.amount), 0);
  const monthlyBills = bills.reduce((sum, b) => sum + Number(b.amount), 0) +
    installments.reduce((sum, i) => sum + Number(i.amount), 0);

  if (monthlyBills > 0 && totalReserves < monthlyBills * 3) {
    tips.push({
      id: "emergency-fund",
      title: "Build Your Emergency Fund",
      description: `Financial experts recommend 3-6 months of expenses in reserve. You have ${totalReserves > 0 ? Math.round(totalReserves / monthlyBills) + " month(s)" : "nothing"} saved. Aim for at least ${Math.round(monthlyBills * 3)}.`,
      type: "suggestion",
      icon: "shield",
    });
  }

  // ── General Education ──

  if (transactionCount > 50 && !settings?.aiEnabled) {
    tips.push({
      id: "enable-ai",
      title: "Enable AI Features",
      description: "Unlock receipt scanning, money advice, meal planning, and more by adding your OpenAI API key in Settings.",
      type: "suggestion",
      icon: "sparkles",
    });
  }

  if (reserves.length > 0 && reserves.every((r) => r.type === "cash")) {
    tips.push({
      id: "diversify",
      title: "Consider Diversifying",
      description: "All your reserves are in cash. Consider diversifying into investments — even index funds can grow your wealth over time.",
      type: "suggestion",
      icon: "pie-chart",
    });
  }

  // ── Always-On Insights (show even when everything is good) ──

  if (transactionCount > 0) {
    const thisMonthCount = thisMonthExpenses.length;
    tips.push({
      id: "tracking-streak",
      title: `${thisMonthCount} Expenses This Month`,
      description: thisMonthCount > 20
        ? "Impressive tracking! You're logging consistently — this gives you the most accurate financial picture."
        : thisMonthCount > 0
          ? "Keep logging your expenses. The more data you have, the better MoneyStyle can help you."
          : "No expenses logged this month yet. Start tracking to stay on top of your spending.",
      type: "achievement",
      icon: "receipt",
    });
  }

  // Top spending category this month
  if (thisMonthExpenses.length > 0) {
    const catSpending = new Map<string, number>();
    for (const tx of thisMonthExpenses) {
      if (!tx.categoryId) continue;
      catSpending.set(tx.categoryId, (catSpending.get(tx.categoryId) ?? 0) + Math.abs(Number(tx.amount ?? 0)));
    }
    if (catSpending.size > 0) {
      const topCatId = [...catSpending.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const topCatAmount = catSpending.get(topCatId) ?? 0;
      const topCat = categories.find((c) => c.id === topCatId);
      if (topCat) {
        tips.push({
          id: "top-category",
          title: `Top Category: ${topCat.name}`,
          description: `Your biggest spending category this month is ${topCat.name} at ${Math.round(topCatAmount)}. Is this in line with your expectations?`,
          type: "suggestion",
          icon: "pie-chart",
        });
      }
    }
  }

  // Total spending this month
  if (thisMonthExpenses.length > 0) {
    const totalSpent = thisMonthExpenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);
    const totalIncome = incomeSources.reduce((sum, s) => sum + Number(s.amount), 0);
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
      if (savingsRate > 0) {
        tips.push({
          id: "savings-rate",
          title: `Saving ${Math.round(savingsRate)}% of Income`,
          description: savingsRate >= 20
            ? "Excellent! You're saving 20%+ of your income — that's above what most financial advisors recommend."
            : savingsRate >= 10
              ? "Good job! You're saving a healthy portion. Aim for 20% if you can."
              : "You're saving, but there's room to grow. Financial experts recommend saving at least 20% of income.",
          type: savingsRate >= 20 ? "achievement" : "suggestion",
          icon: savingsRate >= 20 ? "trophy" : "trending-up",
        });
      } else {
        tips.push({
          id: "overspending",
          title: "Spending More Than You Earn",
          description: `You've spent ${Math.round(totalSpent)} this month against ${Math.round(totalIncome)} income. Review your expenses and look for areas to cut back.`,
          type: "warning",
          icon: "alert-triangle",
        });
      }
    }
  }

  // Reserves health
  if (reserves.length > 0) {
    tips.push({
      id: "reserves-summary",
      title: `${reserves.length} Reserve${reserves.length > 1 ? "s" : ""} Tracked`,
      description: `You're tracking ${reserves.length} reserve${reserves.length > 1 ? "s" : ""} worth ${Math.round(totalReserves)} total. Keep recording values to see your net worth trend.`,
      type: "achievement",
      icon: "shield",
    });
  }

  // Transaction total milestone
  if (transactionCount >= 1000) {
    tips.push({
      id: "milestone-1000",
      title: "1,000+ Transactions!",
      description: "You've logged over 1,000 transactions. MoneyStyle has a clear picture of your finances — check out Money Advice and Wealth Pilot for personalized insights.",
      type: "achievement",
      icon: "trophy",
    });
  } else if (transactionCount >= 100) {
    tips.push({
      id: "milestone-100",
      title: `${transactionCount} Transactions Logged`,
      description: "Great consistency! The more you track, the smarter your AI features become.",
      type: "achievement",
      icon: "star",
    });
  }

  return tips;
}
