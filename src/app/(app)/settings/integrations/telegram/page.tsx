"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, Bell, Loader2 } from "lucide-react";
import { useSettingsContext } from "@/components/settings/settings-context";
import { NotificationTemplatesSection } from "@/components/settings/notification-templates-section";

export default function SettingsTelegramPage() {
  const { settings, update, saving, handleSave, handleTestTelegram, testingTelegram } = useSettingsContext();

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" />
            Telegram
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="telegramEnabled">Enable Telegram</Label>
            <Switch
              id="telegramEnabled"
              checked={settings.telegramEnabled}
              onCheckedChange={(v) => update({ telegramEnabled: v })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="botToken">Bot Token</Label>
            <Input
              id="botToken"
              type="password"
              value={settings.telegramBotToken ?? ""}
              onChange={(e) =>
                update({ telegramBotToken: e.target.value || null })
              }
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <Input
              id="webhookSecret"
              type="password"
              value={settings.telegramWebhookSecret ?? ""}
              onChange={(e) =>
                update({ telegramWebhookSecret: e.target.value || null })
              }
              placeholder="Optional secret"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <Input
              id="chatId"
              value={settings.telegramChatId ?? ""}
              onChange={(e) =>
                update({ telegramChatId: e.target.value || null })
              }
              placeholder="-1001234567890"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestTelegram}
            disabled={
              testingTelegram ||
              !settings.telegramBotToken ||
              !settings.telegramChatId
            }
          >
            {testingTelegram && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Test Connection
          </Button>
          <div className="border-t pt-3 mt-3 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Choose which notifications are sent via Telegram.
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyPaymentReminders" className="text-sm">
              Payment Reminders
            </Label>
            <Switch
              id="notifyPaymentReminders"
              checked={settings.notifyPaymentReminders}
              onCheckedChange={(v) => update({ notifyPaymentReminders: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyWeekendPlan" className="text-sm">
              Weekend Plan Reminder
            </Label>
            <Switch
              id="notifyWeekendPlan"
              checked={settings.notifyWeekendPlan}
              onCheckedChange={(v) => update({ notifyWeekendPlan: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyMonthlyReport" className="text-sm">
              Monthly Report
            </Label>
            <Switch
              id="notifyMonthlyReport"
              checked={settings.notifyMonthlyReport}
              onCheckedChange={(v) => update({ notifyMonthlyReport: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyWebTransaction" className="text-sm">
              Web Transaction Alerts
            </Label>
            <Switch
              id="notifyWebTransaction"
              checked={settings.notifyWebTransaction}
              onCheckedChange={(v) => update({ notifyWebTransaction: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifySmsTransaction" className="text-sm">
              SMS Transaction Alerts
            </Label>
            <Switch
              id="notifySmsTransaction"
              checked={settings.notifySmsTransaction}
              onCheckedChange={(v) => update({ notifySmsTransaction: v })}
            />
          </div>
        </CardContent>
      </Card>

      <NotificationTemplatesSection />
    </div>
  );
}
