import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyReport, sendTelegramMessage } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    return NextResponse.json(
      { error: "TELEGRAM_CHAT_ID not configured" },
      { status: 500 },
    );
  }

  try {
    // Generate report for previous month
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

    const report = await generateMonthlyReport(monthStr);
    await sendTelegramMessage(chatId, report);

    return NextResponse.json({ ok: true, month: monthStr });
  } catch (err) {
    console.error("Monthly report cron error:", err);
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }
}
