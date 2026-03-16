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

  const message =
    (body.channel_post as Record<string, unknown>) ??
    (body.message as Record<string, unknown>);

  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = message.text as string;

  // Look up user by telegramChatId
  const settings = await prisma.appSettings.findFirst({
    where: { telegramChatId: String(chatId) },
  });

  if (!settings) {
    // Try env-level fallback — find first user with telegram enabled
    const fallbackSettings = await prisma.appSettings.findFirst({
      where: { telegramEnabled: true },
    });
    if (!fallbackSettings) {
      return NextResponse.json({ ok: true });
    }
    return handleTelegram(text, chatId, fallbackSettings, fallbackSettings.userId);
  }

  return handleTelegram(text, chatId, settings, settings.userId);
}

async function handleTelegram(
  text: string,
  chatId: number,
  settings: {
    currency: string;
    defaultAccountId: string | null;
    telegramBotToken: string | null;
  },
  userId: string,
) {
  const botToken = settings.telegramBotToken || undefined;
  const reply = (msg: string) => sendTelegramMessage(chatId, msg, undefined, botToken);

  // /help or /start
  if (/^\/?(help|start|راهنما)$/i.test(text.trim())) {
    await reply(generateHelp());
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
