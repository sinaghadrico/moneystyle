"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brain } from "lucide-react";
import { useSettingsContext } from "@/components/settings/settings-context";
import { AiPromptsSection } from "@/components/settings/ai-prompts-section";

export default function SettingsAiPage() {
  const { settings, update } = useSettingsContext();

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4" />
            OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="aiEnabled">Enable AI</Label>
            <Switch
              id="aiEnabled"
              checked={settings.aiEnabled}
              onCheckedChange={(v) => update({ aiEnabled: v })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
            <Input
              id="openaiApiKey"
              type="password"
              value={settings.openaiApiKey ?? ""}
              onChange={(e) =>
                update({ openaiApiKey: e.target.value || null })
              }
              placeholder="sk-..."
            />
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Used for receipt parsing, meal planning, weekend planning, money advice, and more.
              If left blank, falls back to the <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">OPENAI_API_KEY</code> env var.
            </p>
            <details className="cursor-pointer">
              <summary className="font-medium text-foreground/70 hover:text-foreground">
                How to get an API key
              </summary>
              <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                <li>
                  Go to{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    platform.openai.com/api-keys
                  </a>
                </li>
                <li>Sign in or create an account</li>
                <li>Click &quot;Create new secret key&quot;</li>
                <li>Copy the key (starts with <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">sk-</code>) and paste above</li>
              </ol>
              <p className="mt-1">
                You need a paid account with credits. Receipt parsing costs ~$0.01 per image.
              </p>
            </details>
          </div>
        </CardContent>
      </Card>

      <AiPromptsSection />
    </div>
  );
}
