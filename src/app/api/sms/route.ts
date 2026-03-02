import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSMSWithPatterns } from "@/lib/sms-parser";
import { getDefaultAccount, sendTelegramMessage } from "@/lib/telegram";
import { checkBudgetAlert } from "@/actions/budgets";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { resolveCategory } from "@/lib/auto-categorize";
import { getSettings } from "@/actions/settings";

export async function POST(request: NextRequest) {
  const settings = await getSettings();

  // Authenticate with API key (DB settings first, env fallback)
  const apiKey = settings.smsApiKey || process.env.SMS_API_KEY;
  if (apiKey) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const smsText = body.text;
  if (!smsText || typeof smsText !== "string") {
    return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
  }

  const dbPatterns = await prisma.smsPattern.findMany({
    where: { enabled: true },
    orderBy: { priority: "asc" },
  });
  const parsed = parseSMSWithPatterns(smsText, dbPatterns);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse SMS", raw: smsText }, { status: 422 });
  }

  // Get default account
  const account = await getDefaultAccount();
  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 500 });
  }

  // Auto-categorize by merchant
  const categoryId = await resolveCategory(parsed.merchant);

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      date: parsed.date ?? new Date(),
      amount: parsed.amount,
      currency: "AED",
      type: parsed.type,
      categoryId,
      accountId: account.id,
      merchant: parsed.merchant ?? null,
      description: parsed.description ?? null,
      source: "sms",
    },
  });

  // Send Telegram notification (DB settings first, env fallback)
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  const botToken = settings.telegramBotToken || undefined;
  if (chatId) {
    const typeIcon = parsed.type === "income" ? "💰" : "💳";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    const catName = categoryId
      ? (await prisma.category.findUnique({ where: { id: categoryId } }))?.name
      : null;
    const catLabel = catName ? ` (${catName})` : "";
    let msg = `${typeIcon} SMS: ${parsed.amount.toLocaleString()} AED ${parsed.type}${merchantLabel}${catLabel} [${account.name}] #${transaction.id.slice(-6)}`;

    if (parsed.balance !== undefined) {
      msg += `\n💰 Balance: ${parsed.balance.toLocaleString()} AED`;
    }

    // Budget check for expenses
    if (parsed.type === "expense" && transaction.categoryId) {
      const budgetWarning = await checkBudgetAlert(transaction.categoryId);
      if (budgetWarning) msg += budgetWarning;
    }

    // Anomaly check
    const anomalyWarning = await checkTransactionAnomaly(
      parsed.amount,
      null,
      parsed.merchant ?? null,
    );
    if (anomalyWarning) msg += anomalyWarning;

    await sendTelegramMessage(chatId, msg, undefined, botToken);
  }

  return NextResponse.json({
    ok: true,
    transaction: {
      id: transaction.id,
      amount: parsed.amount,
      type: parsed.type,
      merchant: parsed.merchant,
    },
  });
}
