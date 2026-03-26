import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  parseTelegramMessage,
  parseDeleteCommand,
  parseStatsCommand,
  parseSettleCommand,
  deleteByShortIds,
  deleteLastN,
  generateStats,
  generateHelp,
  generateMonthlyReport,
  generateSavingsReport,
  generateDebtsReport,
  isUnknownCommand,
  resolveAccountByHint,
  resolveCategoryByHint,
  resolveTagsByHints,
  sendTelegramMessage,
} from "@/lib/telegram";
import { checkBudgetAlert } from "@/actions/budgets";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { resolveCategory } from "@/lib/auto-categorize";
import { getOrCreatePerson } from "@/actions/persons";
import { splitTransaction } from "@/actions/transactions";

export async function POST(request: NextRequest) {
  // Validate webhook secret from env
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Handle inline keyboard callback queries
  const callbackQuery = body.callback_query as Record<string, unknown> | undefined;
  if (callbackQuery) {
    const cbChatId = ((callbackQuery.message as Record<string, unknown>)?.chat as Record<string, unknown>)?.id as number;
    const cbData = callbackQuery.data as string;
    const cbUserId = callbackQuery.id as string;

    // Acknowledge the callback
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cbUserId }),
      });
    }

    // Find linked user
    const cbSettings = await prisma.appSettings.findFirst({
      where: { telegramChatId: String(cbChatId) },
    });

    if (!cbSettings) {
      await sendTelegramMessage(cbChatId, "Your account is not linked. Use /start to get started.");
      return NextResponse.json({ ok: true });
    }

    // Route callback commands
    if (cbData === "cmd_stats") {
      const report = await generateStats(undefined, cbSettings.userId);
      await sendTelegramMessage(cbChatId, report);
    } else if (cbData === "cmd_report") {
      const report = await generateMonthlyReport(undefined, cbSettings.userId);
      await sendTelegramMessage(cbChatId, report);
    } else if (cbData === "cmd_savings") {
      const report = await generateSavingsReport(cbSettings.userId);
      await sendTelegramMessage(cbChatId, report);
    } else if (cbData === "cmd_debts") {
      const report = await generateDebtsReport(cbSettings.userId);
      await sendTelegramMessage(cbChatId, report);
    } else if (cbData === "cmd_help") {
      await sendTelegramMessage(cbChatId, generateHelp());
    }

    return NextResponse.json({ ok: true });
  }

  const message =
    (body.channel_post as Record<string, unknown>) ??
    (body.message as Record<string, unknown>);

  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = message.text as string;

  // Handle /start without code (welcome message)
  if (/^\/start$/i.test(text.trim())) {
    const existing = await prisma.appSettings.findFirst({
      where: { telegramChatId: String(chatId) },
    });
    if (existing) {
      await sendTelegramMessage(
        chatId,
        "Welcome back to MoneyStyle! 👋\n\nYour account is linked. Send a transaction like:\n250 Carrefour #grocery",
        undefined,
        [
          [
            { text: "📊 Stats", callback_data: "cmd_stats" },
            { text: "📈 Report", callback_data: "cmd_report" },
          ],
          [
            { text: "🎯 Savings", callback_data: "cmd_savings" },
            { text: "💳 Debts", callback_data: "cmd_debts" },
          ],
          [
            { text: "📖 All Commands", callback_data: "cmd_help" },
            { text: "🌐 Open App", url: "https://moneystyle.app/dashboard" },
          ],
        ],
      );
    } else {
      await sendTelegramMessage(
        chatId,
        "Welcome to MoneyStyle! 👋💰\n\nTo get started, link your account:\n\n1️⃣ Open MoneyStyle app\n2️⃣ Go to Settings → Integrations → Telegram\n3️⃣ Tap \"Generate Link Code\"\n4️⃣ Send the code here: /link CODE",
        undefined,
        [
          [{ text: "🔗 Open Settings to Link", url: "https://moneystyle.app/settings/integrations/telegram" }],
        ],
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Handle /link CODE and /start CODE before user lookup
  const linkMatch = text.trim().match(/^\/(link|start)\s+(\d{6})$/i);
  if (linkMatch) {
    const code = linkMatch[2];
    const linkCode = await prisma.telegramLinkCode.findFirst({
      where: { code, expiresAt: { gt: new Date() } },
    });
    if (linkCode) {
      await prisma.appSettings.update({
        where: { userId: linkCode.userId },
        data: { telegramChatId: String(chatId), telegramEnabled: true },
      });
      await prisma.telegramLinkCode.delete({ where: { id: linkCode.id } });
      await sendTelegramMessage(
        chatId,
        "✅ Account linked successfully!\n\nYou can now send transactions like:\n250 Carrefour #grocery\n\nOr use the buttons below:",
        undefined,
        [
          [
            { text: "📊 Stats", callback_data: "cmd_stats" },
            { text: "📈 Report", callback_data: "cmd_report" },
          ],
          [
            { text: "🎯 Savings", callback_data: "cmd_savings" },
            { text: "💳 Debts", callback_data: "cmd_debts" },
          ],
          [
            { text: "📖 All Commands", callback_data: "cmd_help" },
            { text: "🌐 Open App", url: "https://moneystyle.app/dashboard" },
          ],
        ],
      );
    } else {
      await sendTelegramMessage(
        chatId,
        "Invalid or expired code. Get a new one from Settings.",
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Handle /unlink
  if (/^\/unlink$/i.test(text.trim())) {
    const unlinkSettings = await prisma.appSettings.findFirst({
      where: { telegramChatId: String(chatId) },
    });
    if (unlinkSettings) {
      await prisma.appSettings.update({
        where: { userId: unlinkSettings.userId },
        data: { telegramChatId: null, telegramEnabled: false },
      });
      await sendTelegramMessage(chatId, "Account unlinked successfully.");
    } else {
      await sendTelegramMessage(chatId, "Your Telegram is not linked to any account.");
    }
    return NextResponse.json({ ok: true });
  }

  // Look up user by telegramChatId
  const settings = await prisma.appSettings.findFirst({
    where: { telegramChatId: String(chatId) },
  });

  if (!settings) {
    await sendTelegramMessage(
      chatId,
      "Your Telegram is not linked to any account.\n\nGet a link code from Settings:",
      undefined,
      [[{ text: "🔗 Open Settings to Link", url: "https://moneystyle.app/settings/integrations/telegram" }]],
    );
    return NextResponse.json({ ok: true });
  }

  return handleTelegram(text, chatId, settings, settings.userId);
}

async function handleTelegram(
  text: string,
  chatId: number,
  settings: {
    currency: string;
    defaultAccountId: string | null;
  },
  userId: string,
) {
  const reply = (msg: string) => sendTelegramMessage(chatId, msg);

  // /help or /start (without code)
  if (/^\/?(help|start|راهنما)$/i.test(text.trim())) {
    await sendTelegramMessage(chatId, generateHelp(), undefined, [
      [
        { text: "📊 Stats", callback_data: "cmd_stats" },
        { text: "📈 Report", callback_data: "cmd_report" },
      ],
      [
        { text: "🎯 Savings", callback_data: "cmd_savings" },
        { text: "💳 Debts", callback_data: "cmd_debts" },
      ],
      [
        { text: "🌐 Open App", url: "https://moneystyle.app/dashboard" },
      ],
    ]);
    return NextResponse.json({ ok: true });
  }

  // /savings
  if (/^\/?savings$/i.test(text.trim())) {
    try {
      const report = await generateSavingsReport(userId);
      await reply(report);
    } catch (err) {
      console.error("Telegram savings error:", err);
      await reply("Failed to load savings goals.");
    }
    return NextResponse.json({ ok: true });
  }

  // /report
  if (/^\/?report$/i.test(text.trim())) {
    try {
      const report = await generateMonthlyReport(undefined, userId);
      await reply(report);
    } catch (err) {
      console.error("Telegram report error:", err);
      await reply("Failed to generate report.");
    }
    return NextResponse.json({ ok: true });
  }

  // /debts
  if (/^\/?debts$/i.test(text.trim())) {
    try {
      const report = await generateDebtsReport(userId);
      await reply(report);
    } catch (err) {
      console.error("Telegram debts error:", err);
      await reply("Failed to load debts.");
    }
    return NextResponse.json({ ok: true });
  }

  // /settle name amount
  const settleCmd = parseSettleCommand(text);
  if (settleCmd) {
    try {
      const person = await getOrCreatePerson(settleCmd.personName, userId);
      if (!person) {
        await reply("Could not resolve person name.");
        return NextResponse.json({ ok: true });
      }
      await prisma.settlement.create({
        data: {
          personId: person.id,
          amount: settleCmd.amount,
          source: "telegram",
        },
      });
      await reply(
        `✅ Settled ${settleCmd.amount} ${settings.currency} with ${person.name}`,
      );
    } catch (err) {
      console.error("Telegram settle error:", err);
      await reply("Failed to record settlement.");
    }
    return NextResponse.json({ ok: true });
  }

  // Check for stats command
  const statsCmd = parseStatsCommand(text);
  if (statsCmd) {
    try {
      const report = await generateStats(statsCmd.month, userId);
      await reply(report);
    } catch (err) {
      console.error("Telegram stats error:", err);
      await reply("Failed to generate stats.");
    }
    return NextResponse.json({ ok: true });
  }

  // Check for delete command
  const delCmd = parseDeleteCommand(text);
  if (delCmd) {
    try {
      let result: { deleted: string[]; notFound?: string[] };
      if (delCmd.lastN) {
        result = await deleteLastN(delCmd.lastN, userId);
      } else if (delCmd.shortIds) {
        result = await deleteByShortIds(delCmd.shortIds, userId);
      } else {
        return NextResponse.json({ ok: true });
      }

      const lines: string[] = [];
      if (result.deleted.length > 0) {
        lines.push(`Deleted ${result.deleted.length}:`);
        result.deleted.forEach((d) => lines.push(`  - ${d}`));
      }
      if (result.notFound && result.notFound.length > 0) {
        lines.push(`Not found: ${result.notFound.join(", ")}`);
      }
      if (lines.length === 0) {
        lines.push("Nothing to delete.");
      }
      await reply(lines.join("\n"));
    } catch (err) {
      console.error("Telegram delete error:", err);
      await reply("Failed to delete.");
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = parseTelegramMessage(text);
  if (!parsed) {
    if (isUnknownCommand(text)) {
      await reply("Unknown command. Send /help to see available commands.");
    }
    return NextResponse.json({ ok: true });
  }

  try {
    // Resolve account
    let account: { id: string; name: string } | null = null;
    if (parsed.accountHint) {
      account = await resolveAccountByHint(parsed.accountHint, userId);
    }
    if (!account && settings.defaultAccountId) {
      const defaultAcc = await prisma.account.findUnique({ where: { id: settings.defaultAccountId } });
      if (defaultAcc) account = { id: defaultAcc.id, name: defaultAcc.name };
    }
    if (!account) {
      const firstAcc = await prisma.account.findFirst({ where: { userId } });
      if (firstAcc) account = { id: firstAcc.id, name: firstAcc.name };
    }
    if (!account) {
      await reply("No accounts found in the database.");
      return NextResponse.json({ ok: true });
    }

    // Resolve category
    let category: { id: string; name: string } | null = null;
    if (parsed.categoryHint) {
      category = await resolveCategoryByHint(parsed.categoryHint, userId);
    }
    if (!category && parsed.merchant) {
      const autoCatId = await resolveCategory(parsed.merchant, userId);
      if (autoCatId) {
        const cat = await prisma.category.findUnique({ where: { id: autoCatId } });
        if (cat) category = { id: cat.id, name: cat.name };
      }
    }

    // Resolve tags
    let tags: { id: string; name: string }[] = [];
    if (parsed.tagHints && parsed.tagHints.length > 0) {
      tags = await resolveTagsByHints(parsed.tagHints, userId);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(),
        amount: parsed.amount,
        currency: settings.currency,
        type: parsed.type,
        categoryId: category?.id ?? null,
        accountId: account.id,
        merchant: parsed.merchant ?? null,
        description: parsed.description ?? null,
        source: "telegram",
        confirmed: false,
        userId,
      },
    });

    // Save tags
    if (tags.length > 0) {
      await prisma.transactionTag.createMany({
        data: tags.map((t) => ({ transactionId: transaction.id, tagId: t.id })),
      });
    }

    // Auto-split 50/50 if /split was used
    let splitInfo = "";
    if (parsed.splitPersonName && parsed.type === "expense") {
      const person = await getOrCreatePerson(parsed.splitPersonName, userId);
      if (person) {
        const halfAmount = Math.round((parsed.amount / 2) * 100) / 100;
        const myHalf = Math.round((parsed.amount - halfAmount) * 100) / 100;
        await splitTransaction(transaction.id, {
          splits: [
            { categoryId: category?.id ?? null, personId: null, amount: myHalf, description: null },
            { categoryId: category?.id ?? null, personId: person.id, amount: halfAmount, description: null },
          ],
        }, userId);
        splitInfo = `\n👥 Split: ${myHalf} you + ${halfAmount} ${person.name}`;
      }
    }

    // Build confirmation message
    const typeLabel = parsed.type === "income" ? "income" : "expense";
    const catLabel = category ? ` (${category.name})` : "";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    const tagLabel = tags.length > 0 ? ` [${tags.map((t) => t.name).join(", ")}]` : "";
    let confirmation =
      `Saved: ${parsed.amount} ${settings.currency} ${typeLabel}${merchantLabel}${catLabel}${tagLabel} [${account.name}]` +
      (transaction.id ? ` #${transaction.id.slice(-6)}` : "") +
      splitInfo;

    // Check budget alert
    if (category && parsed.type === "expense") {
      const budgetWarning = await checkBudgetAlert(category.id);
      if (budgetWarning) confirmation += budgetWarning;
    }

    // Check anomaly
    const anomalyWarning = await checkTransactionAnomaly(
      parsed.amount,
      category?.id ?? null,
      parsed.merchant ?? null,
    );
    if (anomalyWarning) confirmation += anomalyWarning;

    await reply(confirmation);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    if (chatId) {
      await reply("Failed to save transaction.");
    }
  }

  return NextResponse.json({ ok: true });
}
