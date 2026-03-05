import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
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

  // Find all users with payment reminders enabled
  const allSettings = await prisma.appSettings.findMany({
    where: {
      notifyPaymentReminders: true,
      telegramChatId: { not: null },
    },
  });

  let totalReminders = 0;

  for (const settings of allSettings) {
    const userId = settings.userId;
    const chatId = settings.telegramChatId!;
    const botToken = settings.telegramBotToken || undefined;

    try {
      const [installments, bills] = await Promise.all([
        prisma.installment.findMany({ where: { isActive: true, userId } }),
        prisma.bill.findMany({ where: { isActive: true, userId } }),
      ]);

      if (installments.length === 0 && bills.length === 0) continue;

      const today = new Date();
      const currentDay = today.getDate();
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      const lines: string[] = [];

      const calcDaysUntilDue = (dueDay: number) => {
        let days = dueDay - currentDay;
        if (days < 0) days += daysInMonth;
        return days;
      };

      const [tplHeader, tplDueToday, tplDueSoon] = await Promise.all([
        getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.paymentReminderHeader),
        getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.paymentDueToday),
        getNotificationTemplate(NOTIFICATION_TEMPLATE_KEYS.paymentDueSoon),
      ]);

      for (const inst of installments) {
        const daysUntilDue = calcDaysUntilDue(inst.dueDay);
        const amount = Number(inst.amount);
        const progress =
          inst.totalCount !== null
            ? ` (${inst.paidCount}/${inst.totalCount})`
            : "";
        const amtStr = amount.toLocaleString("en-US", { maximumFractionDigits: 0 });

        if (daysUntilDue === 0) {
          lines.push(
            renderTemplate(tplDueToday, {
              name: inst.name, amount: amtStr, currency: inst.currency, progress,
            })
          );
          if (inst.paymentInstructions) lines.push(`  📝 ${inst.paymentInstructions}`);
        } else if (daysUntilDue === inst.reminderDays) {
          lines.push(
            renderTemplate(tplDueSoon, {
              name: inst.name, amount: amtStr, currency: inst.currency, progress,
              days: daysUntilDue, days_label: daysUntilDue !== 1 ? "days" : "day",
            })
          );
          if (inst.paymentInstructions) lines.push(`  📝 ${inst.paymentInstructions}`);
        }
      }

      for (const bill of bills) {
        const daysUntilDue = calcDaysUntilDue(bill.dueDay);
        const amount = Number(bill.amount);
        const amtStr = `~${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

        if (daysUntilDue === 0) {
          lines.push(
            renderTemplate(tplDueToday, {
              name: bill.name, amount: amtStr, currency: bill.currency, progress: "",
            })
          );
          if (bill.paymentInstructions) lines.push(`  📝 ${bill.paymentInstructions}`);
        } else if (daysUntilDue === bill.reminderDays) {
          lines.push(
            renderTemplate(tplDueSoon, {
              name: bill.name, amount: amtStr, currency: bill.currency, progress: "",
              days: daysUntilDue, days_label: daysUntilDue !== 1 ? "days" : "day",
            })
          );
          if (bill.paymentInstructions) lines.push(`  📝 ${bill.paymentInstructions}`);
        }
      }

      if (lines.length === 0) continue;

      const message = `${tplHeader}\n\n${lines.join("\n")}`;
      await sendTelegramMessage(chatId, message, undefined, botToken);
      totalReminders += lines.length;
    } catch (err) {
      console.error(`Payment reminders error for user ${userId}:`, err);
    }
  }

  return NextResponse.json({ ok: true, reminders: totalReminders });
}
