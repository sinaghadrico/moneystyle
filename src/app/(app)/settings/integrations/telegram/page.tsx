"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Send, Bell, Loader2, Link2, Unlink, CheckCircle2, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSettingsContext } from "@/components/settings/settings-context";
import { NotificationTemplatesSection } from "@/components/settings/notification-templates-section";
import { generateTelegramLinkCode, unlinkTelegram } from "@/actions/settings";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "moneystyle_app_bot";

export default function SettingsTelegramPage() {
  const { settings, update, saving, handleSave, handleTestTelegram, testingTelegram } = useSettingsContext();
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  if (!settings) return null;

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const result = await generateTelegramLinkCode();
      setLinkCode(result.code);
    } catch {
      toast.error("Failed to generate link code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const result = await unlinkTelegram();
      if ("error" in result) {
        toast.error(`${result.error}`);
      } else {
        toast.success("Telegram account unlinked");
        update({ telegramLinked: false, telegramEnabled: false });
        setLinkCode(null);
      }
    } catch {
      toast.error("Failed to unlink Telegram");
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      toast.success("Code copied to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" />
            Telegram
            {settings.telegramLinked && (
              <Badge variant="default" className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Linked
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.telegramLinked ? (
            <>
              <p className="text-sm text-muted-foreground">
                Your Telegram account is linked. You will receive notifications via the bot.
              </p>
              <div className="flex items-center justify-between">
                <Label htmlFor="telegramEnabled">Enable Telegram Notifications</Label>
                <Switch
                  id="telegramEnabled"
                  checked={settings.telegramEnabled}
                  onCheckedChange={(v) => update({ telegramEnabled: v })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                >
                  {testingTelegram ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Test Connection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleUnlink}
                  disabled={unlinking}
                >
                  {unlinking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="mr-2 h-4 w-4" />
                  )}
                  Unlink
                </Button>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Link your Telegram account to receive notifications directly in Telegram.
              </p>
              {linkCode ? (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/50 p-4 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Your link code</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-2xl font-mono font-bold tracking-widest">{linkCode}</code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Expires in 10 minutes</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Send <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium">/link {linkCode}</code> to{" "}
                      <span className="font-medium text-foreground">@{BOT_USERNAME}</span> on Telegram.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a
                        href={`https://t.me/${BOT_USERNAME}?start=${linkCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Telegram
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateCode} disabled={generatingCode}>
                      {generatingCode ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-4 w-4" />
                      )}
                      New Code
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleGenerateCode} disabled={generatingCode}>
                  {generatingCode ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Link Code
                </Button>
              )}
            </>
          )}
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
          <div className="border-t pt-3 mt-3 flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <NotificationTemplatesSection />
    </div>
  );
}
