import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSettings } from "@/actions/settings";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const settings = await getSettings();
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  const botToken = settings.telegramBotToken || undefined;

  if (!chatId) {
    return NextResponse.json(
      { error: "TELEGRAM_CHAT_ID not configured" },
      { status: 500 }
    );
  }

  try {
    const installments = await prisma.installment.findMany({
      where: { isActive: true },
    });

    if (installments.length === 0) {
      return NextResponse.json({ ok: true, reminders: 0 });
    }

    const today = new Date();
    const currentDay = today.getDate();
    const lines: string[] = [];

    for (const inst of installments) {
      let daysUntilDue = inst.dueDay - currentDay;
      if (daysUntilDue < 0) {
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        daysUntilDue += daysInMonth;
      }

      const amount = Number(inst.amount);
      const progress =
        inst.totalCount !== null
          ? ` (${inst.paidCount}/${inst.totalCount})`
          : "";
      const amtStr = `${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${inst.currency}`;

      if (daysUntilDue === 0) {
        lines.push(`🔴 TODAY: ${inst.name} — ${amtStr}${progress}`);
      } else if (daysUntilDue === inst.reminderDays) {
        lines.push(
          `⏰ ${inst.name} due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""} — ${amtStr}${progress}`
        );
      }
    }

    if (lines.length === 0) {
      return NextResponse.json({ ok: true, reminders: 0 });
    }

    const message = `📋 Installment Reminders\n\n${lines.join("\n")}`;
    await sendTelegramMessage(chatId, message, undefined, botToken);

    return NextResponse.json({ ok: true, reminders: lines.length });
  } catch (err) {
    console.error("Installment reminders cron error:", err);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
