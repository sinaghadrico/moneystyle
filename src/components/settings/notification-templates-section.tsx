"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getNotificationTemplates,
  updateNotificationTemplate,
  resetNotificationTemplate,
  type NotificationTemplateData,
} from "@/actions/settings";
import { toast } from "sonner";
import { FileText, Loader2, RotateCcw, Save } from "lucide-react";

export function NotificationTemplatesSection() {
  const [templates, setTemplates] = useState<NotificationTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getNotificationTemplates();
    setTemplates(data);
    const values: Record<string, string> = {};
    for (const t of data) values[t.key] = t.content;
    setEditValues(values);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string) => {
    const content = editValues[key];
    if (!content?.trim()) {
      toast.error("❌ Template cannot be empty");
      return;
    }
    setSavingKey(key);
    await updateNotificationTemplate(key, content);
    toast.success("✅ Template saved");
    await load();
    setSavingKey(null);
  };

  const handleReset = async (key: string) => {
    setSavingKey(key);
    await resetNotificationTemplate(key);
    toast.success("🔄 Reset to default");
    await load();
    setSavingKey(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Notification Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Notification Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xs text-muted-foreground">
          Customize the text of Telegram notifications. Use{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            {"{variable}"}
          </code>{" "}
          placeholders for dynamic values. Changes take effect immediately.
        </p>

        {templates.map((template) => {
          const isDirty = editValues[template.key] !== template.content;
          return (
            <div key={template.key} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="font-semibold">{template.label}</Label>
                {template.isCustom && (
                  <Badge variant="secondary" className="text-xs">
                    Customized
                  </Badge>
                )}
              </div>
              <Textarea
                className="min-h-[80px] font-mono text-xs"
                value={editValues[template.key] ?? ""}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [template.key]: e.target.value,
                  }))
                }
              />
              {template.variables !== "(none)" && (
                <p className="text-[11px] text-muted-foreground">
                  Variables:{" "}
                  {template.variables.split(", ").map((v) => (
                    <code
                      key={v}
                      className="mr-1 rounded bg-muted px-1 py-0.5 font-mono"
                    >
                      {`{${v}}`}
                    </code>
                  ))}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(template.key)}
                  disabled={savingKey === template.key || !isDirty}
                >
                  {savingKey === template.key ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3 w-3" />
                  )}
                  Save
                </Button>
                {template.isCustom && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReset(template.key)}
                    disabled={savingKey === template.key}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
