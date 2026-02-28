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
  accountHint?: string;
  description?: string;
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

  // Extract #category tag
  let categoryHint: string | undefined;
  const catMatch = rest.match(/#(\S+)/);
  if (catMatch) {
    categoryHint = catMatch[1];
    rest = rest.replace(catMatch[0], "").trim();
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
    accountHint,
    description,
  };
}

const DEFAULT_ACCOUNT_NAME = "Sina Mashreq";

export async function resolveAccountByHint(
  hint: string
): Promise<{ id: string; name: string } | null> {
  const lower = hint.toLowerCase();
  const accounts = await prisma.account.findMany();
  // Substring match, case-insensitive
  const match = accounts.find((a) => a.name.toLowerCase().includes(lower));
  return match ? { id: match.id, name: match.name } : null;
}

export async function getDefaultAccount(): Promise<{
  id: string;
  name: string;
} | null> {
  const account = await prisma.account.findFirst({
    where: { name: DEFAULT_ACCOUNT_NAME },
  });
  if (account) return { id: account.id, name: account.name };
  // Fallback: return first account
  const first = await prisma.account.findFirst();
  return first ? { id: first.id, name: first.name } : null;
}

export async function resolveCategoryByHint(
  hint: string
): Promise<{ id: string; name: string } | null> {
  const lower = hint.toLowerCase();
  const categories = await prisma.category.findMany();

  // Exact match first
  const exact = categories.find((c) => c.name.toLowerCase() === lower);
  if (exact) return { id: exact.id, name: exact.name };

  // Substring/prefix match
  const partial = categories.find((c) =>
    c.name.toLowerCase().includes(lower)
  );
  if (partial) return { id: partial.id, name: partial.name };

  // Reverse: hint contains the category name
  const reverse = categories.find((c) =>
    lower.includes(c.name.toLowerCase())
  );
  if (reverse) return { id: reverse.id, name: reverse.name };

  return null;
}

export interface DeleteCommand {
  kind: "delete";
  shortIds?: string[];
  lastN?: number;
}

/**
 * Parse delete commands:
 *   del abc123          — single by short ID
 *   del abc123 def456   — multiple by short ID
 *   del last            — last telegram transaction
 *   del last 3          — last N telegram transactions
 */
export function parseDeleteCommand(raw: string): DeleteCommand | null {
  const text = raw.trim();
  const match = text.match(/^(?:del|delete|حذف)\s+(.+)$/i);
  if (!match) return null;

  const args = match[1].trim();

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
  shortIds: string[]
): Promise<{ deleted: string[]; notFound: string[] }> {
  const deleted: string[] = [];
  const notFound: string[] = [];

  for (const sid of shortIds) {
    const tx = await prisma.transaction.findFirst({
      where: { id: { endsWith: sid } },
    });
    if (tx) {
      await prisma.transaction.delete({ where: { id: tx.id } });
      deleted.push(
        `${tx.amount} AED ${tx.merchant || ""} #${tx.id.slice(-6)}`
      );
    } else {
      notFound.push(sid);
    }
  }

  return { deleted, notFound };
}

export async function deleteLastN(
  n: number
): Promise<{ deleted: string[] }> {
  const txs = await prisma.transaction.findMany({
    where: { source: "telegram" },
    orderBy: { createdAt: "desc" },
    take: Math.min(n, 50),
  });

  const deleted: string[] = [];
  for (const tx of txs) {
    await prisma.transaction.delete({ where: { id: tx.id } });
    deleted.push(
      `${tx.amount} AED ${tx.merchant || ""} #${tx.id.slice(-6)}`
    );
  }

  return { deleted };
}

export interface StatsCommand {
  kind: "stats";
  month?: string; // "2026-02" or undefined for current month
}

/**
 * Parse stats commands:
 *   stats             — current month
 *   stats 2026-01     — specific month
 *   stats jan         — month name (current year)
 *   stats last        — previous month
 */
export function parseStatsCommand(raw: string): StatsCommand | null {
  const text = raw.trim();
  const match = text.match(/^(?:stats|stat|آمار|گزارش)(?:\s+(.+))?$/i);
  if (!match) return null;

  const arg = match[1]?.trim();
  if (!arg) return { kind: "stats" };

  // "last" = previous month
  if (/^last$/i.test(arg)) {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { kind: "stats", month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  }

  // "2026-02" format
  if (/^\d{4}-\d{2}$/.test(arg)) {
    return { kind: "stats", month: arg };
  }

  // Month name like "jan", "feb", "january"
  const MONTHS: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
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
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function generateStats(monthStr?: string): Promise<string> {
  const now = new Date();
  const month = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mon = parseInt(monStr, 10);

  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: "expense",
      mergedIntoId: null,
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
    lines.push(`${name} ${bar} ${pct.toFixed(0).padStart(3)}%  ${fmtAmount(cat.total)} AED`);
  }

  lines.push("");
  lines.push(`${"Total".padEnd(maxNameLen)} ${" ".repeat(BAR_WIDTH)}      ${fmtAmount(grandTotal)} AED`);
  lines.push(`${transactions.length} transactions`);

  // Income summary
  const incomes = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      type: "income",
      mergedIntoId: null,
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

const TELEGRAM_API = "https://api.telegram.org/bot";

export async function sendTelegramMessage(
  chatId: number | string,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not set");
    return;
  }

  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
