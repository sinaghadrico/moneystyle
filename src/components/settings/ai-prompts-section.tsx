"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getAiPrompts,
  updateAiPrompt,
  resetAiPrompt,
  type AiPromptData,
} from "@/actions/settings";
import { toast } from "sonner";
import { MessageSquareCode, Loader2, RotateCcw, Save } from "lucide-react";

const PROMPT_COST: Record<string, string> = {
  receipt_parser: "~$0.01/image",
  money_advice: "~$0.01",
  item_normalizer: "~$0.005",
  meal_planner: "~$0.02",
  weekend_planner: "~$0.03",
  weekend_item_swap: "~$0.005",
};

export function AiPromptsSection() {
  const [prompts, setPrompts] = useState<AiPromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getAiPrompts();
    setPrompts(data);
    const values: Record<string, string> = {};
    for (const p of data) values[p.key] = p.content;
    setEditValues(values);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string) => {
    const content = editValues[key];
    if (!content?.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }
    setSavingKey(key);
    await updateAiPrompt(key, content);
    toast.success("Prompt saved");
    await load();
    setSavingKey(null);
  };

  const handleReset = async (key: string) => {
    setSavingKey(key);
    await resetAiPrompt(key);
    toast.success("Reset to default");
    await load();
    setSavingKey(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareCode className="h-4 w-4" />
            AI Prompts
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
          <MessageSquareCode className="h-4 w-4" />
          AI Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-xs text-muted-foreground">
          Customize the system prompts sent to the AI. Changes take effect
          immediately.
        </p>

        {prompts.map((prompt) => {
          const isDirty = editValues[prompt.key] !== prompt.content;
          return (
            <div key={prompt.key} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="font-semibold">{prompt.label}</Label>
                {PROMPT_COST[prompt.key] && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {PROMPT_COST[prompt.key]}
                  </Badge>
                )}
                {prompt.isCustom && (
                  <Badge variant="secondary" className="text-xs">
                    Customized
                  </Badge>
                )}
              </div>
              <Textarea
                className="min-h-[120px] font-mono text-xs"
                value={editValues[prompt.key] ?? ""}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    [prompt.key]: e.target.value,
                  }))
                }
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(prompt.key)}
                  disabled={
                    savingKey === prompt.key || !isDirty
                  }
                >
                  {savingKey === prompt.key ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3 w-3" />
                  )}
                  Save
                </Button>
                {prompt.isCustom && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReset(prompt.key)}
                    disabled={savingKey === prompt.key}
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
