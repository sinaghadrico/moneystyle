import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseMashreqSMS } from "@/lib/sms-parser";
import { getDefaultAccount, sendTelegramMessage } from "@/lib/telegram";
import { checkBudgetAlert } from "@/actions/budgets";
import { checkTransactionAnomaly } from "@/lib/anomaly";

export async function POST(request: NextRequest) {
  // Authenticate with API key
  const apiKey = process.env.SMS_API_KEY;
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

  const parsed = parseMashreqSMS(smsText);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse SMS", raw: smsText }, { status: 422 });
  }

  // Get default account
  const account = await getDefaultAccount();
  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 500 });
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      date: parsed.date ?? new Date(),
      amount: parsed.amount,
      currency: "AED",
      type: parsed.type,
      accountId: account.id,
      merchant: parsed.merchant ?? null,
      description: parsed.description ?? null,
      source: "sms",
    },
  });

  // Send Telegram notification
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (chatId) {
    const typeIcon = parsed.type === "income" ? "💰" : "💳";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    let msg = `${typeIcon} SMS: ${parsed.amount.toLocaleString()} AED ${parsed.type}${merchantLabel} [${account.name}] #${transaction.id.slice(-6)}`;

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

    await sendTelegramMessage(chatId, msg);
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
