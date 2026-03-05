"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, ExternalLink, Key, ToggleRight } from "lucide-react";
import { useAppSettings } from "@/components/settings/settings-provider";

export function useAiCheck() {
  const { settings } = useAppSettings();
  const [showSetup, setShowSetup] = useState(false);

  const checkAi = (): boolean => {
    if (settings.aiEnabled && settings.hasOpenaiKey) return true;
    setShowSetup(true);
    return false;
  };

  return { checkAi, showSetup, setShowSetup, settings };
}

export function AiSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { settings } = useAppSettings();

  const needsEnable = !settings.aiEnabled;
  const needsKey = !settings.hasOpenaiKey;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Setup Required
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            To use AI features, you need to configure a few things in Settings.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <div className={`flex items-start gap-3 rounded-lg border p-3 ${needsEnable ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"}`}>
              <ToggleRight className={`h-5 w-5 mt-0.5 shrink-0 ${needsEnable ? "text-amber-600" : "text-green-600"}`} />
              <div>
                <p className="text-sm font-medium">
                  {needsEnable ? "1. Enable AI" : "AI is enabled"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {needsEnable
                    ? "Go to Settings → Integrations and turn on the AI toggle."
                    : "Already enabled."}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 rounded-lg border p-3 ${needsKey ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"}`}>
              <Key className={`h-5 w-5 mt-0.5 shrink-0 ${needsKey ? "text-amber-600" : "text-green-600"}`} />
              <div>
                <p className="text-sm font-medium">
                  {needsKey ? "2. Add OpenAI API Key" : "API key configured"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {needsKey ? (
                    <>
                      Get your key from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 underline hover:text-foreground"
                      >
                        platform.openai.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {" "}and paste it in Settings → Integrations.
                    </>
                  ) : (
                    "Already configured."
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            AI features use OpenAI GPT models for receipt parsing, meal planning, weekend planning, and financial advice. Typical cost is ~$0.01 per request.
          </p>
        </div>

        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Later
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                router.push("/settings/integrations");
              }}
            >
              <Settings className="mr-1 h-4 w-4" />
              Go to Settings
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
