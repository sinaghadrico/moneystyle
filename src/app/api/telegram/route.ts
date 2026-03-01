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
  getDefaultAccount,
  sendTelegramMessage,
} from "@/lib/telegram";
import { checkBudgetAlert } from "@/actions/budgets";
import { checkTransactionAnomaly } from "@/lib/anomaly";
import { resolveCategory } from "@/lib/auto-categorize";
import { getOrCreatePerson } from "@/actions/persons";
import { splitTransaction } from "@/actions/transactions";

export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const headerSecret = request.headers.get(
      "x-telegram-bot-api-secret-token"
    );
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

  // Extract message from channel_post or message
  const message =
    (body.channel_post as Record<string, unknown>) ??
    (body.message as Record<string, unknown>);

  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = message.text as string;

  // /help or /start
  if (/^\/?(help|start|راهنما)$/i.test(text.trim())) {
    await sendTelegramMessage(chatId, generateHelp());
    return NextResponse.json({ ok: true });
  }

  // /savings
  if (/^\/?savings$/i.test(text.trim())) {
    try {
      const report = await generateSavingsReport();
      await sendTelegramMessage(chatId, report);
    } catch (err) {
      console.error("Telegram savings error:", err);
      await sendTelegramMessage(chatId, "Failed to load savings goals.");
    }
    return NextResponse.json({ ok: true });
  }

  // /report
  if (/^\/?report$/i.test(text.trim())) {
    try {
      const report = await generateMonthlyReport();
      await sendTelegramMessage(chatId, report);
    } catch (err) {
      console.error("Telegram report error:", err);
      await sendTelegramMessage(chatId, "Failed to generate report.");
    }
    return NextResponse.json({ ok: true });
  }

  // /debts
  if (/^\/?debts$/i.test(text.trim())) {
    try {
      const report = await generateDebtsReport();
      await sendTelegramMessage(chatId, report);
    } catch (err) {
      console.error("Telegram debts error:", err);
      await sendTelegramMessage(chatId, "Failed to load debts.");
    }
    return NextResponse.json({ ok: true });
  }

  // /settle name amount
  const settleCmd = parseSettleCommand(text);
  if (settleCmd) {
    try {
      const person = await getOrCreatePerson(settleCmd.personName);
      if (!person) {
        await sendTelegramMessage(chatId, "Could not resolve person name.");
        return NextResponse.json({ ok: true });
      }
      await prisma.settlement.create({
        data: {
          personId: person.id,
          amount: settleCmd.amount,
          source: "telegram",
        },
      });
      await sendTelegramMessage(
        chatId,
        `✅ Settled ${settleCmd.amount} AED with ${person.name}`,
      );
    } catch (err) {
      console.error("Telegram settle error:", err);
      await sendTelegramMessage(chatId, "Failed to record settlement.");
    }
    return NextResponse.json({ ok: true });
  }

  // Check for stats command
  const statsCmd = parseStatsCommand(text);
  if (statsCmd) {
    try {
      const report = await generateStats(statsCmd.month);
      await sendTelegramMessage(chatId, report);
    } catch (err) {
      console.error("Telegram stats error:", err);
      await sendTelegramMessage(chatId, "Failed to generate stats.");
    }
    return NextResponse.json({ ok: true });
  }

  // Check for delete command
  const delCmd = parseDeleteCommand(text);
  if (delCmd) {
    try {
      let result: { deleted: string[]; notFound?: string[] };
      if (delCmd.lastN) {
        result = await deleteLastN(delCmd.lastN);
      } else if (delCmd.shortIds) {
        result = await deleteByShortIds(delCmd.shortIds);
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
      await sendTelegramMessage(chatId, lines.join("\n"));
    } catch (err) {
      console.error("Telegram delete error:", err);
      await sendTelegramMessage(chatId, "Failed to delete.");
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = parseTelegramMessage(text);
  if (!parsed) {
    // If it looks like a /command, reply with hint
    if (isUnknownCommand(text)) {
      await sendTelegramMessage(
        chatId,
        "Unknown command. Send /help to see available commands.",
      );
    }
    // Otherwise ignore silently (random chat messages)
    return NextResponse.json({ ok: true });
  }

  try {
    // Resolve account
    let account: { id: string; name: string } | null = null;
    if (parsed.accountHint) {
      account = await resolveAccountByHint(parsed.accountHint);
    }
    if (!account) {
      account = await getDefaultAccount();
    }
    if (!account) {
      await sendTelegramMessage(chatId, "No accounts found in the database.");
      return NextResponse.json({ ok: true });
    }

    // Resolve category — try hint first, then auto-categorize from merchant
    let category: { id: string; name: string } | null = null;
    if (parsed.categoryHint) {
      category = await resolveCategoryByHint(parsed.categoryHint);
    }
    if (!category && parsed.merchant) {
      const autoCatId = await resolveCategory(parsed.merchant);
      if (autoCatId) {
        const cat = await prisma.category.findUnique({ where: { id: autoCatId } });
        if (cat) category = { id: cat.id, name: cat.name };
      }
    }

    // Resolve tags
    let tags: { id: string; name: string }[] = [];
    if (parsed.tagHints && parsed.tagHints.length > 0) {
      tags = await resolveTagsByHints(parsed.tagHints);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(),
        amount: parsed.amount,
        currency: "AED",
        type: parsed.type,
        categoryId: category?.id ?? null,
        accountId: account.id,
        merchant: parsed.merchant ?? null,
        description: parsed.description ?? null,
        source: "telegram",
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
      const person = await getOrCreatePerson(parsed.splitPersonName);
      if (person) {
        const halfAmount = Math.round((parsed.amount / 2) * 100) / 100;
        const myHalf = Math.round((parsed.amount - halfAmount) * 100) / 100;
        await splitTransaction(transaction.id, {
          splits: [
            { categoryId: category?.id ?? null, personId: null, amount: myHalf, description: null },
            { categoryId: category?.id ?? null, personId: person.id, amount: halfAmount, description: null },
          ],
        });
        splitInfo = `\n👥 Split: ${myHalf} you + ${halfAmount} ${person.name}`;
      }
    }

    // Build confirmation message
    const typeLabel = parsed.type === "income" ? "income" : "expense";
    const catLabel = category ? ` (${category.name})` : "";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    const tagLabel = tags.length > 0 ? ` [${tags.map((t) => t.name).join(", ")}]` : "";
    let confirmation =
      `Saved: ${parsed.amount} AED ${typeLabel}${merchantLabel}${catLabel}${tagLabel} [${account.name}]` +
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

    await sendTelegramMessage(chatId, confirmation);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    if (chatId) {
      await sendTelegramMessage(chatId, "Failed to save transaction.");
    }
  }

  return NextResponse.json({ ok: true });
}
