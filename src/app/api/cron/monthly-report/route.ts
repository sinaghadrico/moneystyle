import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateMonthlyReport, sendTelegramMessage } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Find all users with monthly report enabled and telegram configured
  const allSettings = await prisma.appSettings.findMany({
    where: {
      notifyMonthlyReport: true,
      telegramChatId: { not: null },
    },
  });

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

  let sent = 0;
  for (const settings of allSettings) {
    const chatId = settings.telegramChatId!;
    try {
      const report = await generateMonthlyReport(monthStr, settings.userId);
      await sendTelegramMessage(chatId, report);
      sent++;
    } catch (err) {
      console.error(`Monthly report error for user ${settings.userId}:`, err);
    }
  }

  return NextResponse.json({ ok: true, month: monthStr, sent });
}
