import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
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

  // Find all users with weekend plan notifications enabled
  const allSettings = await prisma.appSettings.findMany({
    where: {
      notifyWeekendPlan: true,
      telegramChatId: { not: null },
    },
  });

  let sent = 0;

  for (const settings of allSettings) {
    const userId = settings.userId;
    const chatId = settings.telegramChatId!;
    const botToken = settings.telegramBotToken || undefined;

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const plan = await prisma.weekendPlan.findFirst({
        where: { createdAt: { gte: oneWeekAgo }, userId },
        orderBy: { createdAt: "desc" },
      });

      if (!plan) continue;

      const planData = plan.plan as unknown as { offers: WeekendOffer[] };
      const offer = planData.offers[1] ?? planData.offers[0];
      if (!offer) continue;

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
              time_slot: a.timeSlot, name: a.name, cost: a.estimatedCost,
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
              meal: f.meal, name: f.name,
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

      await sendTelegramMessage(chatId, lines.join("\n"), undefined, botToken);
      sent++;
    } catch (err) {
      console.error(`Weekend reminder error for user ${userId}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
