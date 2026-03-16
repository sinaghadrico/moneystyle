import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSMSWithPatterns } from "@/lib/sms-parser";
import { getDefaultAccount, sendTelegramMessage } from "@/lib/telegram";
import { checkBudgetAlert } from "@/actions/budgets";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { resolveCategory } from "@/lib/auto-categorize";
import {
  getNotificationTemplate,
  renderTemplate,
  NOTIFICATION_TEMPLATE_KEYS,
} from "@/lib/notification-templates";

export async function POST(request: NextRequest) {
  // Authenticate with API key and resolve user
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up user by smsApiKey in their settings
  const settings = await prisma.appSettings.findFirst({
    where: { smsApiKey: apiKey },
    include: { user: { select: { id: true } } },
  });

  // Fallback: check env-level API key (for backwards compat, uses first user with settings)
  if (!settings) {
    if (apiKey !== process.env.SMS_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Find the first user's settings as fallback
    const fallbackSettings = await prisma.appSettings.findFirst();
    if (!fallbackSettings) {
      return NextResponse.json({ error: "No settings configured" }, { status: 500 });
    }
    // Use fallback settings
    return handleSms(request, fallbackSettings, fallbackSettings.userId);
  }

  return handleSms(request, settings, settings.userId);
}

async function handleSms(
  request: NextRequest,
  settings: {
    currency: string;
    defaultAccountId: string | null;
    telegramChatId: string | null;
    telegramBotToken: string | null;
    notifySmsTransaction: boolean;
  },
  userId: string,
) {
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
    where: { enabled: true, userId },
    orderBy: { priority: "asc" },
  });
  const parsed = parseSMSWithPatterns(smsText, dbPatterns);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse SMS", raw: smsText }, { status: 422 });
  }

  // Get default account for this user
  let account = settings.defaultAccountId
    ? await prisma.account.findUnique({ where: { id: settings.defaultAccountId } })
    : null;
  if (!account) {
    account = await prisma.account.findFirst({ where: { userId } });
  }
  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 500 });
  }

  // Auto-categorize by merchant (scoped to user)
  const categoryId = await resolveCategory(parsed.merchant, userId);

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      date: parsed.date ?? new Date(),
      amount: parsed.amount,
      currency: settings.currency,
      type: parsed.type,
      categoryId,
      accountId: account.id,
      merchant: parsed.merchant ?? null,
      description: parsed.description ?? null,
      source: "sms",
      userId,
    },
  });

  // Send Telegram notification
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  const botToken = settings.telegramBotToken || undefined;
  if (chatId && settings.notifySmsTransaction) {
    const typeIcon = parsed.type === "income" ? "💰" : "💳";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    const catName = categoryId
      ? (await prisma.category.findUnique({ where: { id: categoryId } }))?.name
      : null;
    const catLabel = catName ? ` (${catName})` : "";

    const [tplSms, tplBalance] = await Promise.all([
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.smsTransactionAlert),
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.smsBalanceLine),
    ]);

    let msg = renderTemplate(tplSms, {
      icon: typeIcon,
      amount: parsed.amount.toLocaleString(),
      currency: settings.currency,
      type: parsed.type,
      merchant: merchantLabel,
      category: catLabel,
      account: account.name,
      id: transaction.id.slice(-6),
    });

    if (parsed.balance !== undefined) {
      msg += renderTemplate(tplBalance, {
        balance: parsed.balance.toLocaleString(),
        currency: settings.currency,
      });
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
