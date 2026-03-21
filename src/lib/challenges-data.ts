export const CHALLENGE_TEMPLATES = [
  { type: "no-spend-day", title: "No-Spend Day", description: "Don't spend anything today", days: 1 },
  { type: "no-spend-weekend", title: "No-Spend Weekend", description: "Zero spending this weekend", days: 2 },
  { type: "save-target", title: "Save 500 This Month", description: "Save at least 500 this month", days: 30 },
  { type: "streak-logging", title: "7-Day Streak", description: "Log transactions for 7 days straight", days: 7 },
  { type: "under-budget", title: "Under Budget Week", description: "Stay under budget for all categories this week", days: 7 },
] as const;

export const BADGE_DEFINITIONS = [
  { type: "first-transaction", name: "First Step", icon: "🎯", description: "Logged your first transaction" },
  { type: "week-streak", name: "Week Warrior", icon: "🔥", description: "7-day logging streak" },
  { type: "month-streak", name: "Monthly Master", icon: "⚡", description: "30-day logging streak" },
  { type: "budget-master", name: "Budget Boss", icon: "👑", description: "Stayed under budget for a full month" },
  { type: "saver", name: "Super Saver", icon: "💎", description: "Saved more than you spent in a month" },
  { type: "no-spend-hero", name: "No-Spend Hero", icon: "🛡️", description: "Completed 3 no-spend challenges" },
] as const;
