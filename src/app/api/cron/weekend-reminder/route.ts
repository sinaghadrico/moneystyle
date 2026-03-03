import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { getSettings } from "@/actions/settings";
import type { WeekendOffer } from "@/lib/types";
import {
  getNotificationTemplate,
  renderTemplate,
  NOTIFICATION_TEMPLATE_KEYS,
} from "@/lib/notification-templates";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Only send on Thursdays (day before UAE weekend)
  const today = new Date();
  if (today.getDay() !== 4) {
    return NextResponse.json({ ok: true, sent: false, reason: "Not Thursday" });
  }

  const settings = await getSettings();

  if (!settings.notifyWeekendPlan) {
    return NextResponse.json({ ok: true, sent: false, reason: "Notification disabled" });
  }

  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  const botToken = settings.telegramBotToken || undefined;

  if (!chatId) {
    return NextResponse.json(
      { error: "TELEGRAM_CHAT_ID not configured" },
      { status: 500 }
    );
  }

  try {
    // Find most recent plan created within the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const plan = await prisma.weekendPlan.findFirst({
      where: { createdAt: { gte: oneWeekAgo } },
      orderBy: { createdAt: "desc" },
    });

    if (!plan) {
      return NextResponse.json({ ok: true, sent: false, reason: "No recent plan" });
    }

    const planData = plan.plan as unknown as { offers: WeekendOffer[] };
    // Use balanced offer (index 1) or first available
    const offer = planData.offers[1] ?? planData.offers[0];
    if (!offer) {
      return NextResponse.json({ ok: true, sent: false, reason: "No offers in plan" });
    }

    const [tplHeader, tplActivity, tplFood, tplFooter] = await Promise.all([
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.weekendReminderHeader),
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.weekendReminderActivity),
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.weekendReminderFood),
      getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.weekendReminderFooter),
    ]);

    const lines: string[] = [];
    lines.push(renderTemplate(tplHeader, { title: offer.title }));
    lines.push("");

    if (offer.activities.length > 0) {
      lines.push("📍 Activities:");
      for (const a of offer.activities) {
        lines.push(
          renderTemplate(tplActivity, {
            time_slot: a.timeSlot,
            name: a.name,
            cost: a.estimatedCost,
          })
        );
      }
      lines.push("");
    }

    if (offer.food.length > 0) {
      lines.push("🍽 Food:");
      for (const f of offer.food) {
        lines.push(
          renderTemplate(tplFood, {
            meal: f.meal,
            name: f.name,
            restaurant: f.restaurant ? ` @ ${f.restaurant}` : "",
            cost: f.estimatedCost,
          })
        );
      }
      lines.push("");
    }

    lines.push(
      renderTemplate(tplFooter, {
        total_cost: offer.totalCost,
        tip: offer.tips.length > 0 ? offer.tips[0] : "",
      })
    );

    const message = lines.join("\n");
    await sendTelegramMessage(chatId, message, undefined, botToken);

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("Weekend reminder cron error:", err);
    return NextResponse.json(
      { error: "Failed to send weekend reminder" },
      { status: 500 }
    );
  }
}
