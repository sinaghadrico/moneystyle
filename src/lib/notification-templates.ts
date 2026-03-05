import { prisma } from "@/lib/db";

export const NOTIFICATION_TEMPLATE_KEYS = {
  paymentReminderHeader: "payment_reminder_header",
  paymentDueToday: "payment_due_today",
  paymentDueSoon: "payment_due_soon",
  weekendReminderHeader: "weekend_reminder_header",
  weekendReminderActivity: "weekend_reminder_activity",
  weekendReminderFood: "weekend_reminder_food",
  weekendReminderFooter: "weekend_reminder_footer",
  webTransactionAlert: "web_transaction_alert",
  smsTransactionAlert: "sms_transaction_alert",
  smsBalanceLine: "sms_balance_line",
} as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATE_KEYS)[keyof typeof NOTIFICATION_TEMPLATE_KEYS];

export const DEFAULT_NOTIFICATION_TEMPLATES: Record<
  NotificationTemplateKey,
  { label: string; content: string; variables: string }
> = {
  [NOTIFICATION_TEMPLATE_KEYS.paymentReminderHeader]: {
    label: "Payment Reminder — Header",
    content: "📋 Payment Reminders",
    variables: "(none)",
  },
  [NOTIFICATION_TEMPLATE_KEYS.paymentDueToday]: {
    label: "Payment — Due Today",
    content: "🔴 TODAY: {name} — {amount} {currency}{progress}",
    variables: "name, amount, currency, progress",
  },
  [NOTIFICATION_TEMPLATE_KEYS.paymentDueSoon]: {
    label: "Payment — Due Soon",
    content:
      "⏰ {name} due in {days} {days_label} — {amount} {currency}{progress}",
    variables: "name, amount, currency, progress, days, days_label",
  },
  [NOTIFICATION_TEMPLATE_KEYS.weekendReminderHeader]: {
    label: "Weekend Reminder — Header",
    content: "🗓 Weekend Plan Reminder\n{title}",
    variables: "title",
  },
  [NOTIFICATION_TEMPLATE_KEYS.weekendReminderActivity]: {
    label: "Weekend — Activity Line",
    content: "  🎭 {time_slot} — {name} ({cost} AED)",
    variables: "time_slot, name, cost",
  },
  [NOTIFICATION_TEMPLATE_KEYS.weekendReminderFood]: {
    label: "Weekend — Food Line",
    content: "  🍽️ {meal} — {name}{restaurant} ({cost} AED)",
    variables: "meal, name, restaurant, cost",
  },
  [NOTIFICATION_TEMPLATE_KEYS.weekendReminderFooter]: {
    label: "Weekend Reminder — Footer",
    content: "💰 Total: {total_cost} AED\n\n💡 {tip}",
    variables: "total_cost, tip",
  },
  [NOTIFICATION_TEMPLATE_KEYS.webTransactionAlert]: {
    label: "Web Transaction Alert",
    content: "🔍 Web transaction alert: {amount} AED{merchant}{warning}",
    variables: "amount, merchant, warning",
  },
  [NOTIFICATION_TEMPLATE_KEYS.smsTransactionAlert]: {
    label: "SMS Transaction Alert",
    content:
      "{icon} SMS: {amount} {currency} {type}{merchant}{category} [{account}] #{id}",
    variables: "icon, amount, currency, type, merchant, category, account, id",
  },
  [NOTIFICATION_TEMPLATE_KEYS.smsBalanceLine]: {
    label: "SMS — Balance Line",
    content: "\n💰 Balance: {balance} {currency}",
    variables: "balance, currency",
  },
};

/**
 * Replace `{key}` placeholders with values from the vars object.
 * Unknown placeholders are left as-is.
 */
export function renderTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Get template content for a given key.
 * Returns DB value if exists, otherwise the hardcoded default.
 */
export async function getNotificationTemplate(
  key: NotificationTemplateKey,
  userId?: string,
): Promise<string> {
  const row = userId
    ? await prisma.notificationTemplate.findUnique({ where: { userId_key: { userId, key } } })
    : await prisma.notificationTemplate.findFirst({ where: { key } });
  return row?.content ?? DEFAULT_NOTIFICATION_TEMPLATES[key].content;
}
