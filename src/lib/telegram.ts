import { prisma } from "./db";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function persianToLatin(text: string): string {
  return text.replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)));
}

export interface ParsedMessage {
  amount: number;
  type: "income" | "expense";
  merchant?: string;
  categoryHint?: string;
  tagHints?: string[];
  accountHint?: string;
  description?: string;
  splitPersonName?: string;
}

export function parseTelegramMessage(raw: string): ParsedMessage | null {
  const text = persianToLatin(raw).trim();
  if (!text) return null;

  // Match optional +/- prefix, then a number (with optional decimals)
  const amountMatch = text.match(/^([+-]?)\s*(\d+(?:\.\d+)?)/);
  if (!amountMatch) return null;

  const prefix = amountMatch[1];
  const amount = parseFloat(amountMatch[2]);
  if (isNaN(amount) || amount <= 0) return null;

  const type: "income" | "expense" = prefix === "+" ? "income" : "expense";

  // Everything after the amount number
  let rest = text.slice(amountMatch[0].length).trim();

  // Extract /split PersonName
  let splitPersonName: string | undefined;
  const splitMatch = rest.match(/\/split\s+(\S+)/i);
  if (splitMatch) {
    splitPersonName = splitMatch[1];
    rest = rest.replace(splitMatch[0], "").trim();
  }

  // Extract all #tags — first matching category = categoryHint, rest = tagHints
  const hashMatches = [...rest.matchAll(/#(\S+)/g)];
  let categoryHint: string | undefined;
  const tagHints: string[] = [];
  for (const m of hashMatches) {
    rest = rest.replace(m[0], "").trim();
  }
  if (hashMatches.length > 0) {
    // First tag is attempted as category, rest are tag hints
    categoryHint = hashMatches[0][1];
    for (let i = 1; i < hashMatches.length; i++) {
      tagHints.push(hashMatches[i][1]);
    }
  }

  // Extract @account tag
  let accountHint: string | undefined;
  const accMatch = rest.match(/@(\S+)/);
  if (accMatch) {
    accountHint = accMatch[1];
    rest = rest.replace(accMatch[0], "").trim();
  }

  // First word(s) before any remaining whitespace-separated description
  // The merchant is the first "token(s)" on the line, description is the rest after newline or extra text
  let merchant: string | undefined;
  let description: string | undefined;

  // Split on newline first — anything after first line is description
  const lines = rest.split(/\n/, 2);
  const firstLine = lines[0].trim();
  const extraLines = lines[1]?.trim();

  if (firstLine) {
    // The merchant is the first line content
    merchant = firstLine;
  }

  if (extraLines) {
    description = extraLines;
  }

  return {
    amount,
    type,
    merchant: merchant || undefined,
    categoryHint,
    tagHints: tagHints.length > 0 ? tagHints : undefined,
    accountHint,
    description,
    splitPersonName,
  };
}

const DEFAULT_ACCOUNT_NAME = "Farnoosh Mashreq";

export async function resolveAccountByHint(
  hint: string,
  userId?: string,
): Promise<{ id: string; name: string } | null> {
  const lower = hint.toLowerCase();
  const accounts = await prisma.account.findMany({
    where: userId ? { userId } : undefined,
  });
  // Substring match, case-insensitive
  const match = accounts.find((a) => a.name.toLowerCase().includes(lower));
  return match ? { id: match.id, name: match.name } : null;
}

export async function getDefaultAccount(userId?: string): Promise<{
  id: string;
  name: string;
} | null> {
  // Check DB settings first
  if (userId) {
    const settings = await prisma.appSettings.findUnique({
      where: { userId },
    });
    if (settings?.defaultAccountId) {
      const acc = await prisma.account.findUnique({
        where: { id: settings.defaultAccountId },
      });
      if (acc) return { id: acc.id, name: acc.name };
    }
  }

  const userFilter = userId ? { userId } : {};
  const account = await prisma.account.findFirst({
    where: { name: DEFAULT_ACCOUNT_NAME, ...userFilter },
  });
  if (account) return { id: account.id, name: account.name };
  // Fallback: return first account for user
  const first = await prisma.account.findFirst({ where: userFilter });
  return first ? { id: first.id, name: first.name } : null;
}

export async function resolveCategoryByHint(
  hint: string,
  userId?: string,
): Promise<{ id: string; name: string } | null> {
  const lower = hint.toLowerCase();
  const categories = await prisma.category.findMany({
    where: userId ? { userId } : undefined,
  });

  // Exact match first
  const exact = categories.find((c) => c.name.toLowerCase() === lower);
  if (exact) return { id: exact.id, name: exact.name };

  // Substring/prefix match
  const partial = categories.find((c) => c.name.toLowerCase().includes(lower));
  if (partial) return { id: partial.id, name: partial.name };

  // Reverse: hint contains the category name
  const reverse = categories.find((c) => lower.includes(c.name.toLowerCase()));
  if (reverse) return { id: reverse.id, name: reverse.name };

  return null;
}

export async function resolveTagsByHints(
  hints: string[],
  userId?: string,
): Promise<{ id: string; name: string }[]> {
  const resolved: { id: string; name: string }[] = [];
  for (const hint of hints) {
    const lower = hint.toLowerCase();
    let tag = await prisma.tag.findFirst({
      where: {
        name: { equals: lower, mode: "insensitive" },
        ...(userId ? { userId } : {}),
      },
    });
    if (!tag) {
      tag = await prisma.tag.findFirst({
        where: {
          name: { contains: lower, mode: "insensitive" },
          ...(userId ? { userId } : {}),
        },
      });
    }
    if (!tag && userId) {
      // Auto-create the tag for this user
      const TAG_COLORS = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#14b8a6",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#6b7280",
        "#0ea5e9",
      ];
      const count = await prisma.tag.count({ where: { userId } });
      tag = await prisma.tag.create({
        data: {
          name: hint,
          color: TAG_COLORS[count % TAG_COLORS.length],
          userId,
        },
      });
    }
    if (tag) resolved.push({ id: tag.id, name: tag.name });
  }
  return resolved;
}

export interface DeleteCommand {
  kind: "delete";
  shortIds?: string[];
  lastN?: number;
}

/**
 * Parse delete commands:
 *   /del abc123          — single by short ID
 *   /del abc123 def456   — multiple by short ID
 *   /del last            — last telegram transaction
 *   /del last 3          — last N telegram transactions
 *   /undo                — alias for /del last
 *   Also supports: del, delete, حذف (without slash)
 */
export function parseDeleteCommand(raw: string): DeleteCommand | null {
  const text = raw.trim();

  // /undo or undo → alias for "del last"
  if (/^\/?(undo|برگرد)$/i.test(text)) {
    return { kind: "delete", lastN: 1 };
  }

  const match = text.match(/^\/?(del|delete|حذف)\s+(.+)$/i);
  if (!match) return null;

  // shift: match[1] is the command word, match[2] is args
  const args = match[2].trim();

  // "last" or "last N"
  const lastMatch = args.match(/^last\s*(\d+)?$/i);
  if (lastMatch) {
    return { kind: "delete", lastN: parseInt(lastMatch[1] || "1", 10) };
  }

  // Short IDs (space-separated)
  const ids = args.split(/\s+/).filter(Boolean);
  if (ids.length > 0) {
    return { kind: "delete", shortIds: ids };
  }

  return null;
}

export async function deleteByShortIds(
  shortIds: string[],
  userId?: string,
): Promise<{ deleted: string[]; notFound: string[] }> {
  const deleted: string[] = [];
  const notFound: string[] = [];

  for (const sid of shortIds) {
    const tx = await prisma.transaction.findFirst({
      where: { id: { endsWith: sid }, ...(userId ? { userId } : {}) },
    });
    if (tx) {
      await prisma.transaction.delete({ where: { id: tx.id } });
      deleted.push(`${tx.amount} AED ${tx.merchant || ""} #${tx.id.slice(-6)}`);
    } else {
      notFound.push(sid);
    }
  }

  return { deleted, notFound };
}

export async function deleteLastN(
  n: number,
  userId?: string,
): Promise<{ deleted: string[] }> {
  const txs = await prisma.transaction.findMany({
    where: { source: "telegram", ...(userId ? { userId } : {}) },
    orderBy: { createdAt: "desc" },
    take: Math.min(n, 50),
  });

  const deleted: string[] = [];
  for (const tx of txs) {
    await prisma.transaction.delete({ where: { id: tx.id } });
    deleted.push(`${tx.amount} AED ${tx.merchant || ""} #${tx.id.slice(-6)}`);
  }

  return { deleted };
}

export interface StatsCommand {
  kind: "stats";
  month?: string; // "2026-02" or undefined for current month
}

/**
 * Parse stats commands:
 *   /stats             — current month
 *   /stats 2026-01     — specific month
 *   /stats jan         — month name (current year)
 *   /stats last        — previous month
 *   /today             — today's transactions
 *   Also supports: stats, stat, آمار, گزارش (without slash)
 */
export function parseStatsCommand(raw: string): StatsCommand | null {
  const text = raw.trim();

  // /today or today → special day command
  if (/^\/?(today|امروز)$/i.test(text)) {
    return { kind: "stats", month: "__today__" };
  }

  const match = text.match(/^\/?(?:stats|stat|آمار|گزارش)(?:\s+(.+))?$/i);
  if (!match) return null;

  const arg = match[1]?.trim();
  if (!arg) return { kind: "stats" };

  // "last" = previous month
  if (/^last$/i.test(arg)) {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return {
      kind: "stats",
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  // "2026-02" format
  if (/^\d{4}-\d{2}$/.test(arg)) {
    return { kind: "stats", month: arg };
  }

  // Month name like "jan", "feb", "january"
  const MONTHS: Record<string, number> = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };
  const m = MONTHS[arg.toLowerCase()];
  if (m) {
    const year = new Date().getFullYear();
    return { kind: "stats", month: `${year}-${String(m).padStart(2, "0")}` };
  }

  return { kind: "stats" };
}

const BAR_FULL = "█";
const BAR_EMPTY = "░";
const BAR_WIDTH = 12;

function textBar(percent: number): string {
  const filled = Math.round((percent / 100) * BAR_WIDTH);
  return BAR_FULL.repeat(filled) + BAR_EMPTY.repeat(BAR_WIDTH - filled);
}

function fmtAmount(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function generateStats(
  monthStr?: string,
  userId?: string,
): Promise<string> {
  // /today is handled separately
  if (monthStr === "__today__") {
    return generateTodayStats(userId);
  }

  const now = new Date();
  const month =
    monthStr ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mon = parseInt(monStr, 10);

  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  const userFilter = userId ? { userId } : {};
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: "expense",
      mergedIntoId: null,
      confirmed: true,
      ...userFilter,
    },
    include: { category: true },
  });

  if (transactions.length === 0) {
    return `📊 ${MONTH_NAMES[mon]} ${year}\n\nNo expenses found.`;
  }

  // Group by category
  const catMap = new Map<string, { name: string; total: number }>();
  let grandTotal = 0;

  for (const tx of transactions) {
    const name = tx.category?.name || "Uncategorized";
    const amt = Number(tx.amount ?? 0);
    const entry = catMap.get(name) || { name, total: 0 };
    entry.total += amt;
    catMap.set(name, entry);
    grandTotal += amt;
  }

  // Sort by total descending
  const sorted = [...catMap.values()].sort((a, b) => b.total - a.total);

  // Find longest category name for alignment
  const maxNameLen = Math.max(...sorted.map((c) => c.name.length), 5);

  const lines: string[] = [];
  lines.push(`📊 ${MONTH_NAMES[mon]} ${year}`);
  lines.push("");

  for (const cat of sorted) {
    const pct = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
    const bar = textBar(pct);
    const name = cat.name.padEnd(maxNameLen);
    lines.push(
      `${name} ${bar} ${pct.toFixed(0).padStart(3)}%  ${fmtAmount(cat.total)} AED`,
    );
  }

  lines.push("");
  lines.push(
    `${"Total".padEnd(maxNameLen)} ${" ".repeat(BAR_WIDTH)}      ${fmtAmount(grandTotal)} AED`,
  );
  lines.push(`${transactions.length} transactions`);

  // Income summary
  const incomes = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: "income",
      mergedIntoId: null,
      confirmed: true,
      ...userFilter,
    },
  });
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount ?? 0), 0);
  if (totalIncome > 0) {
    lines.push("");
    lines.push(`💰 Income: ${fmtAmount(totalIncome)} AED`);
    lines.push(`📉 Net: ${fmtAmount(totalIncome - grandTotal)} AED`);
  }

  return lines.join("\n");
}

export async function generateTodayStats(userId?: string): Promise<string> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      mergedIntoId: null,
      confirmed: true,
      ...(userId ? { userId } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  if (transactions.length === 0) {
    return "📋 Today\n\nNo transactions recorded today.";
  }

  const lines: string[] = [];
  lines.push(
    `📋 Today — ${now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`,
  );
  lines.push("");

  let totalExpense = 0;
  let totalIncome = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount ?? 0);
    const sign = tx.type === "income" ? "+" : "-";
    const cat = tx.category?.name ? ` [${tx.category.name}]` : "";
    const merchant = tx.merchant ?? "";
    lines.push(
      `${sign}${fmtAmount(amt)} AED  ${merchant}${cat}  #${tx.id.slice(-6)}`,
    );
    if (tx.type === "income") totalIncome += amt;
    else totalExpense += amt;
  }

  lines.push("");
  if (totalExpense > 0) lines.push(`💸 Spent: ${fmtAmount(totalExpense)} AED`);
  if (totalIncome > 0) lines.push(`💰 Earned: ${fmtAmount(totalIncome)} AED`);
  lines.push(`📝 ${transactions.length} transaction(s)`);

  return lines.join("\n");
}

export function generateHelp(): string {
  return [
    "💰 MoneyStyle Bot — Commands",
    "",
    "📝 Record a transaction:",
    "  250 Carrefour #grocery",
    "  +15000 Salary #income @sina",
    "  50.5 Uber",
    "",
    "👥 Split with someone:",
    "  500 restaurant /split sina",
    "  Auto 50/50 split, creates debt",
    "",
    "💳 /debts — View who owes what",
    "  /settle sina 250 — Record payment",
    "",
    "📊 /stats — This month's report",
    "  /stats last — Last month",
    "  /stats feb — Specific month",
    "",
    "📋 /today — Today's transactions",
    "",
    "🗑 /del last — Delete last entry",
    "  /del last 3 — Delete last 3",
    "  /del abc123 — Delete by ID",
    "",
    "↩️ /undo — Undo last entry",
    "",
    "📊 /report — Monthly report with comparisons",
    "",
    "🐷 /savings — View savings goals progress",
    "",
    "🔗 /link CODE — Link your Telegram to your account",
    "  /unlink — Unlink your Telegram account",
    "",
    "❓ /help — Show this message",
    "",
    "Format: [+]amount merchant [#category] [#tag1 #tag2] [@account] [/split name]",
    "  + prefix = income, no prefix = expense",
    "  First #tag matches a category, extra #tags become labels",
    "  @tag matches an account",
    "  /split name splits 50/50 with that person",
  ].join("\n");
}

export async function generateSavingsReport(userId?: string): Promise<string> {
  const goals = await prisma.savingsGoal.findMany({
    where: { status: "active", ...(userId ? { userId } : {}) },
    orderBy: { createdAt: "desc" },
  });

  if (goals.length === 0) {
    return "🐷 Savings Goals\n\nNo active savings goals.";
  }

  const lines: string[] = [];
  lines.push("🐷 Savings Goals");
  lines.push("");

  let totalSaved = 0;
  let totalTarget = 0;

  for (const g of goals) {
    const current = Number(g.currentAmount);
    const target = Number(g.targetAmount);
    const pct = target > 0 ? Math.round((current / target) * 100) : 0;
    const bar = textBar(pct);
    const deadline = g.deadline
      ? ` (due ${g.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
      : "";

    lines.push(`${g.name}${deadline}`);
    lines.push(
      `  ${bar} ${pct}%  ${fmtAmount(current)} / ${fmtAmount(target)} AED`,
    );
    lines.push("");

    totalSaved += current;
    totalTarget += target;
  }

  const overallPct =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  lines.push(
    `Total: ${fmtAmount(totalSaved)} / ${fmtAmount(totalTarget)} AED (${overallPct}%)`,
  );
  lines.push(`${goals.length} active goal(s)`);

  return lines.join("\n");
}

export function parseReportCommand(raw: string): boolean {
  return /^\/?report$/i.test(raw.trim());
}

export interface SettleCommand {
  kind: "settle";
  personName: string;
  amount: number;
}

/**
 * Parse settle commands:
 *   /settle علی 250
 *   /settle Ali 100.5
 */
export function parseSettleCommand(raw: string): SettleCommand | null {
  const text = persianToLatin(raw).trim();
  const match = text.match(/^\/settle\s+(\S+)\s+(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const amount = parseFloat(match[2]);
  if (isNaN(amount) || amount <= 0) return null;
  return { kind: "settle", personName: match[1], amount };
}

export async function generateDebtsReport(userId?: string): Promise<string> {
  const persons = await prisma.person.findMany({
    where: userId ? { userId } : undefined,
    include: {
      splits: { select: { amount: true } },
      settlements: { select: { amount: true } },
    },
  });

  if (persons.length === 0) {
    return "💳 Debts\n\nNo shared expenses recorded.";
  }

  const lines: string[] = [];
  lines.push("💳 Debts Summary");
  lines.push("");

  let anyDebt = false;
  for (const p of persons) {
    const totalSplits = p.splits.reduce((s, sp) => s + Number(sp.amount), 0);
    const totalSettled = p.settlements.reduce(
      (s, st) => s + Number(st.amount),
      0,
    );
    const balance = totalSplits - totalSettled;
    if (Math.abs(balance) < 0.01) continue;
    anyDebt = true;
    const icon = balance > 0 ? "🔴" : "🟢";
    lines.push(
      `${icon} ${p.name}: ${fmtAmount(Math.abs(balance))} AED ${balance > 0 ? "owes you" : "you owe"}`,
    );
    lines.push(
      `   splits: ${fmtAmount(totalSplits)} | settled: ${fmtAmount(totalSettled)}`,
    );
    lines.push("");
  }

  if (!anyDebt) {
    lines.push("All settled! No outstanding debts.");
  }

  return lines.join("\n");
}

export async function generateMonthlyReport(
  monthStr?: string,
  userId?: string,
): Promise<string> {
  const now = new Date();
  const month =
    monthStr ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mon = parseInt(monStr, 10);

  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  // Previous month for comparison
  const prevStart = new Date(year, mon - 2, 1);
  const prevEnd = new Date(year, mon - 1, 0, 23, 59, 59, 999);

  const uf = userId ? { userId } : {};
  const [expenses, incomes, prevExpenses, prevIncomes] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        type: "expense",
        mergedIntoId: null,
        confirmed: true,
        ...uf,
      },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        type: "income",
        mergedIntoId: null,
        confirmed: true,
        ...uf,
      },
    }),
    prisma.transaction.findMany({
      where: {
        date: { gte: prevStart, lte: prevEnd },
        type: "expense",
        mergedIntoId: null,
        confirmed: true,
        ...uf,
      },
    }),
    prisma.transaction.findMany({
      where: {
        date: { gte: prevStart, lte: prevEnd },
        type: "income",
        mergedIntoId: null,
        confirmed: true,
        ...uf,
      },
    }),
  ]);

  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const prevTotalExpense = prevExpenses.reduce(
    (s, t) => s + Number(t.amount ?? 0),
    0,
  );
  const prevTotalIncome = prevIncomes.reduce(
    (s, t) => s + Number(t.amount ?? 0),
    0,
  );

  // Top merchants
  const merchantMap = new Map<string, number>();
  for (const tx of expenses) {
    const m = tx.merchant || "Unknown";
    merchantMap.set(m, (merchantMap.get(m) ?? 0) + Number(tx.amount ?? 0));
  }
  const topMerchants = [...merchantMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Category breakdown
  const catMap = new Map<string, number>();
  for (const tx of expenses) {
    const name = tx.category?.name || "Uncategorized";
    catMap.set(name, (catMap.get(name) ?? 0) + Number(tx.amount ?? 0));
  }
  const sortedCats = [...catMap.entries()].sort((a, b) => b[1] - a[1]);

  // Budget status
  const budgets = await prisma.budget.findMany({ include: { category: true } });
  const budgetLines: string[] = [];
  for (const b of budgets) {
    const spent = catMap.get(b.category.name) ?? 0;
    const limit = Number(b.monthlyLimit);
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const icon = pct >= 100 ? "🔴" : pct >= b.alertThreshold ? "🟡" : "🟢";
    budgetLines.push(
      `  ${icon} ${b.category.name}: ${fmtAmount(spent)} / ${fmtAmount(limit)} AED (${pct}%)`,
    );
  }

  const lines: string[] = [];
  lines.push(`📊 Monthly Report — ${MONTH_NAMES[mon]} ${year}`);
  lines.push("");
  lines.push(`💸 Total Expenses: ${fmtAmount(totalExpense)} AED`);
  lines.push(`💰 Total Income: ${fmtAmount(totalIncome)} AED`);
  lines.push(`📉 Net: ${fmtAmount(totalIncome - totalExpense)} AED`);
  lines.push(`📝 ${expenses.length + incomes.length} transactions`);

  // Month-over-month comparison
  if (prevTotalExpense > 0) {
    const expChange =
      ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100;
    const arrow = expChange > 0 ? "📈" : "📉";
    lines.push("");
    lines.push(
      `${arrow} vs last month: ${expChange > 0 ? "+" : ""}${expChange.toFixed(0)}% expenses`,
    );
  }

  if (sortedCats.length > 0) {
    lines.push("");
    lines.push("📂 By Category:");
    for (const [name, total] of sortedCats.slice(0, 8)) {
      const pct =
        totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(0) : "0";
      lines.push(`  ${name}: ${fmtAmount(total)} AED (${pct}%)`);
    }
  }

  if (topMerchants.length > 0) {
    lines.push("");
    lines.push("🏪 Top Merchants:");
    for (const [name, total] of topMerchants) {
      lines.push(`  ${name}: ${fmtAmount(total)} AED`);
    }
  }

  if (budgetLines.length > 0) {
    lines.push("");
    lines.push("📋 Budget Status:");
    lines.push(...budgetLines);
  }

  return lines.join("\n");
}

/** Returns true if text looks like an unknown /command */
export function isUnknownCommand(text: string): boolean {
  return /^\/\w+/.test(text.trim());
}

const TELEGRAM_API = "https://api.telegram.org/bot";

export type InlineButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  parseMode?: "HTML" | "Markdown",
  keyboard?: InlineButton[][],
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const payload: Record<string, unknown> = { chat_id: chatId, text };
  if (parseMode) payload.parse_mode = parseMode;
  if (keyboard) payload.reply_markup = { inline_keyboard: keyboard };

  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
