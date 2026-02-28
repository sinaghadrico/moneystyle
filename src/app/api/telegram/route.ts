import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  parseTelegramMessage,
  parseDeleteCommand,
  parseStatsCommand,
  deleteByShortIds,
  deleteLastN,
  generateStats,
  resolveAccountByHint,
  resolveCategoryByHint,
  getDefaultAccount,
  sendTelegramMessage,
} from "@/lib/telegram";

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
    // Not a recognized transaction format — ignore silently
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

    // Resolve category
    let category: { id: string; name: string } | null = null;
    if (parsed.categoryHint) {
      category = await resolveCategoryByHint(parsed.categoryHint);
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

    // Build confirmation message
    const typeLabel = parsed.type === "income" ? "income" : "expense";
    const catLabel = category ? ` (${category.name})` : "";
    const merchantLabel = parsed.merchant ? ` at ${parsed.merchant}` : "";
    const confirmation =
      `Saved: ${parsed.amount} AED ${typeLabel}${merchantLabel}${catLabel} [${account.name}]` +
      (transaction.id ? ` #${transaction.id.slice(-6)}` : "");

    await sendTelegramMessage(chatId, confirmation);
  } catch (err) {
    console.error("Telegram webhook error:", err);
    if (chatId) {
      await sendTelegramMessage(chatId, "Failed to save transaction.");
    }
  }

  return NextResponse.json({ ok: true });
}
