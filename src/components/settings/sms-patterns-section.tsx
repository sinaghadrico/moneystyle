"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  FlaskConical,
  Loader2,
  GripVertical,
  BookOpen,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import {
  getSmsPatterns,
  createSmsPattern,
  updateSmsPattern,
  deleteSmsPattern,
  testSmsPattern,
  updateSettings,
  getSettings,
} from "@/actions/settings";
import type { SmsPatternCreateInput } from "@/lib/validators";

type SmsPattern = {
  id: string;
  name: string;
  regex: string;
  type: string;
  priority: number;
  amountCaptureGroup: number;
  merchantCaptureGroup: number | null;
  enabled: boolean;
  creditKeywords: string | null;
};

type FormData = {
  name: string;
  regex: string;
  type: "income" | "expense" | "auto";
  priority: number;
  amountCaptureGroup: number;
  merchantCaptureGroup: string;
  enabled: boolean;
  creditKeywords: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  regex: "",
  type: "expense",
  priority: 50,
  amountCaptureGroup: 1,
  merchantCaptureGroup: "",
  enabled: true,
  creditKeywords: "",
};

const PRESETS: Record<string, FormData[]> = {
  "Mashreq": [
    {
      name: "Mashreq Purchase",
      regex: "for\\s+AED\\s+([\\d,]+\\.?\\d*)\\s+at\\s+(.+?)\\s+on\\s+\\d{2}-[A-Z]{3}-\\d{4}",
      type: "expense",
      priority: 10,
      amountCaptureGroup: 1,
      merchantCaptureGroup: "2",
      enabled: true,
      creditKeywords: "",
    },
    {
      name: "Mashreq Deposit",
      regex: "AED\\s+([\\d,]+\\.?\\d*)\\s+has been deposited",
      type: "income",
      priority: 20,
      amountCaptureGroup: 1,
      merchantCaptureGroup: "",
      enabled: true,
      creditKeywords: "",
    },
    {
      name: "Mashreq Salary",
      regex: "salary.*?AED\\s+([\\d,]+\\.?\\d*)",
      type: "income",
      priority: 30,
      amountCaptureGroup: 1,
      merchantCaptureGroup: "",
      enabled: true,
      creditKeywords: "",
    },
    {
      name: "Mashreq ATM",
      regex: "AED\\s+([\\d,]+\\.?\\d*)\\s+.*?(?:withdrawn|ATM|cash)",
      type: "expense",
      priority: 40,
      amountCaptureGroup: 1,
      merchantCaptureGroup: "",
      enabled: true,
      creditKeywords: "",
    },
  ],
  "Generic": [
    {
      name: "Generic AED Amount",
      regex: "AED\\s+([\\d,]+\\.?\\d*)",
      type: "auto",
      priority: 99,
      amountCaptureGroup: 1,
      merchantCaptureGroup: "",
      enabled: true,
      creditKeywords: "deposit,credit,receiv,salary,transfer to your",
    },
  ],
};

export function SmsPatternsSection() {
  const [patterns, setPatterns] = useState<SmsPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Test area
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // SMS API Key
  const [smsApiKey, setSmsApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  // Setup guide
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadPatterns = useCallback(async () => {
    setLoading(true);
    const [data, settings] = await Promise.all([
      getSmsPatterns(),
      getSettings(),
    ]);
    setPatterns(
      data.map((p) => ({
        id: p.id,
        name: p.name,
        regex: p.regex,
        type: p.type,
        priority: p.priority,
        amountCaptureGroup: p.amountCaptureGroup,
        merchantCaptureGroup: p.merchantCaptureGroup,
        enabled: p.enabled,
        creditKeywords: p.creditKeywords,
      })),
    );
    setSmsApiKey(settings.smsApiKey ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTestText("");
    setTestResult(null);
    setDialogOpen(true);
  };

  const openEdit = (p: SmsPattern) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      regex: p.regex,
      type: p.type as FormData["type"],
      priority: p.priority,
      amountCaptureGroup: p.amountCaptureGroup,
      merchantCaptureGroup: p.merchantCaptureGroup?.toString() ?? "",
      enabled: p.enabled,
      creditKeywords: p.creditKeywords ?? "",
    });
    setTestText("");
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: SmsPatternCreateInput = {
      name: form.name,
      regex: form.regex,
      type: form.type,
      priority: form.priority,
      amountCaptureGroup: form.amountCaptureGroup,
      merchantCaptureGroup: form.merchantCaptureGroup
        ? parseInt(form.merchantCaptureGroup)
        : null,
      enabled: form.enabled,
      creditKeywords: form.creditKeywords || null,
    };

    const result = editingId
      ? await updateSmsPattern(editingId, payload)
      : await createSmsPattern(payload);

    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(editingId ? "Pattern updated" : "Pattern created");
      setDialogOpen(false);
      await loadPatterns();
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteSmsPattern(id);
    setDeleting(null);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Pattern deleted");
      await loadPatterns();
    }
  };

  const handleToggle = async (p: SmsPattern) => {
    const result = await updateSmsPattern(p.id, { enabled: !p.enabled });
    if ("error" in result) {
      toast.error(result.error);
    } else {
      await loadPatterns();
    }
  };

  const handleTest = async () => {
    if (!form.regex || !testText) return;
    setTesting(true);
    const result = await testSmsPattern(
      form.regex,
      testText,
      form.amountCaptureGroup,
      form.merchantCaptureGroup ? parseInt(form.merchantCaptureGroup) : null,
    );
    setTesting(false);
    if ("error" in result) {
      setTestResult(`Error: ${result.error}`);
    } else {
      setTestResult(
        `Amount: ${result.amount}${result.merchant ? ` | Merchant: ${result.merchant}` : ""}`,
      );
    }
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    const result = await updateSettings({
      smsApiKey: smsApiKey || null,
    });
    setSavingKey(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("API key saved");
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const typeBadge = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-emerald-600 text-white">income</Badge>;
      case "expense":
        return <Badge className="bg-red-600 text-white">expense</Badge>;
      default:
        return <Badge variant="secondary">auto</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Card 1: Connection & Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" />
            SMS Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="smsApiKey" className="text-xs">
                API Key
              </Label>
              <Input
                id="smsApiKey"
                type="password"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                placeholder="Bearer token for /api/sms"
                className="h-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveApiKey}
              disabled={savingKey}
              className="h-8"
            >
              {savingKey && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Save
            </Button>
          </div>

          {/* Setup Guide */}
          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setGuideOpen((v) => !v)}
              className="flex w-full items-center gap-2 p-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">Setup Guide: Auto-forward SMS</span>
              <span className="text-xs text-muted-foreground">
                {guideOpen ? "Hide" : "Show"}
              </span>
            </button>

            {guideOpen && (
              <div className="space-y-4 border-t px-3 pb-4 pt-3">
                <p className="text-xs text-muted-foreground">
                  Since PWA apps cannot read SMS directly, you need a phone automation app
                  to forward bank SMS messages to your <code className="rounded bg-muted px-1">/api/sms</code> endpoint.
                </p>

                {/* Endpoint info */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Your endpoint</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs font-mono">
                      {appUrl}/api/sms
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copyToClipboard(`${appUrl}/api/sms`, "url")}
                    >
                      {copied === "url" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {smsApiKey && (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs font-mono">
                        Header: Authorization: Bearer {smsApiKey.slice(0, 4)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() =>
                          copyToClipboard(`Bearer ${smsApiKey}`, "key")
                        }
                      >
                        {copied === "key" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* iOS Shortcuts */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    <Label className="text-xs font-medium">iOS Shortcuts</Label>
                  </div>
                  <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                    <li>Open the <strong>Shortcuts</strong> app on your iPhone</li>
                    <li>Tap <strong>Automation</strong> tab &rarr; <strong>New Automation</strong></li>
                    <li>Select <strong>Message</strong> &rarr; choose your bank as sender</li>
                    <li>Set &quot;When I receive&quot; &rarr; <strong>Run Immediately</strong></li>
                    <li>Add action: <strong>Get Contents of URL</strong></li>
                    <li>
                      URL: <code className="rounded bg-muted px-1">{appUrl}/api/sms</code>
                    </li>
                    <li>Method: <strong>POST</strong></li>
                    <li>
                      Headers: <code className="rounded bg-muted px-1">Content-Type: application/json</code>
                      {smsApiKey && (
                        <> and <code className="rounded bg-muted px-1">Authorization: Bearer your-key</code></>
                      )}
                    </li>
                    <li>
                      Body (JSON): <code className="rounded bg-muted px-1">{`{"text": "Shortcut Input"}`}</code>
                      &mdash; use the <strong>Message Content</strong> variable from the trigger
                    </li>
                    <li>Turn off &quot;Ask Before Running&quot; and save</li>
                  </ol>
                </div>

                {/* Android Tasker / MacroDroid */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    <Label className="text-xs font-medium">Android (Tasker / MacroDroid)</Label>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">MacroDroid (easier):</p>
                  <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                    <li>Install <strong>MacroDroid</strong> from Play Store</li>
                    <li>Create new Macro &rarr; Add Trigger: <strong>SMS Received</strong></li>
                    <li>Filter by sender (your bank number)</li>
                    <li>Add Action: <strong>HTTP Request</strong></li>
                    <li>
                      URL: <code className="rounded bg-muted px-1">{appUrl}/api/sms</code>
                    </li>
                    <li>Method: <strong>POST</strong></li>
                    <li>
                      Header: <code className="rounded bg-muted px-1">Content-Type: application/json</code>
                      {smsApiKey && (
                        <> and <code className="rounded bg-muted px-1">Authorization: Bearer your-key</code></>
                      )}
                    </li>
                    <li>
                      Body: <code className="rounded bg-muted px-1">{`{"text": "{sms_text}"}`}</code>
                      &mdash; use the built-in <strong>{`{sms_text}`}</strong> variable
                    </li>
                    <li>Save and enable the macro</li>
                  </ol>

                  <p className="text-xs font-medium text-muted-foreground mt-2">Tasker:</p>
                  <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                    <li>Install <strong>Tasker</strong> from Play Store</li>
                    <li>Create Profile &rarr; Event &rarr; <strong>Phone &rarr; Received Text</strong></li>
                    <li>Set sender to your bank number</li>
                    <li>Link to a new Task with action: <strong>Net &rarr; HTTP Request</strong></li>
                    <li>Method: POST, URL: <code className="rounded bg-muted px-1">{appUrl}/api/sms</code></li>
                    <li>
                      Headers: <code className="rounded bg-muted px-1">Content-Type: application/json</code>
                      {smsApiKey && (
                        <>, <code className="rounded bg-muted px-1">Authorization: Bearer your-key</code></>
                      )}
                    </li>
                    <li>
                      Body: <code className="rounded bg-muted px-1">{`{"text": "%SMSRB"}`}</code>
                      &mdash; <strong>%SMSRB</strong> is Tasker&apos;s SMS body variable
                    </li>
                    <li>Save and activate the profile</li>
                  </ol>
                </div>

                {/* Test with curl */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Test with cURL</Label>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-2 text-xs font-mono leading-relaxed">
{`curl -X POST ${appUrl}/api/sms \\
  -H "Content-Type: application/json" \\${smsApiKey ? `\n  -H "Authorization: Bearer ${smsApiKey}" \\` : ""}
  -d '{"text": "Thank you for using NEO VISA Debit Card for AED 127.48 at TABBY FZ LLC on 01-MAR-2026"}'`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST ${appUrl}/api/sms -H "Content-Type: application/json"${smsApiKey ? ` -H "Authorization: Bearer ${smsApiKey}"` : ""} -d '{"text": "Thank you for using NEO VISA Debit Card for AED 127.48 at TABBY FZ LLC on 01-MAR-2026"}'`,
                          "curl",
                        )
                      }
                    >
                      {copied === "curl" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              SMS Patterns
            </CardTitle>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pattern List */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading patterns...</p>
          ) : patterns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patterns configured.</p>
          ) : (
            <div className="space-y-2">
              {patterns.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {p.priority}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {p.name}
                  </span>
                  {typeBadge(p.type)}
                  <Switch
                    checked={p.enabled}
                    onCheckedChange={() => handleToggle(p)}
                    className="shrink-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Patterns are tested in priority order (lowest first). First match wins.
          </p>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
        <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <ResponsiveDialogContent className="max-w-lg">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>
                {editingId ? "Edit Pattern" : "Add Pattern"}
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Define a regex pattern to parse SMS messages.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <div className="space-y-3 py-2">
              {/* Preset selector — only when adding */}
              {!editingId && (
                <div className="space-y-1">
                  <Label className="text-sm">Load from preset</Label>
                  <Select
                    value=""
                    onValueChange={(v) => {
                      // value = "BankName::index"
                      const [bank, idx] = v.split("::");
                      const preset = PRESETS[bank]?.[Number(idx)];
                      if (preset) setForm(preset);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRESETS).map(([bank, items]) => (
                        items.map((p, i) => (
                          <SelectItem key={`${bank}::${i}`} value={`${bank}::${i}`}>
                            {p.name}
                          </SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="pat-name" className="text-sm">Name</Label>
                <Input
                  id="pat-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Mashreq Purchase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pat-regex" className="text-sm">
                  Regex
                </Label>
                <Input
                  id="pat-regex"
                  value={form.regex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, regex: e.target.value }))
                  }
                  placeholder="AED\s+([\d,]+\.?\d*)"
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        type: v as FormData["type"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pat-priority" className="text-sm">
                    Priority
                  </Label>
                  <Input
                    id="pat-priority"
                    type="number"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: parseInt(e.target.value) || 50,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pat-amount-group" className="text-sm">
                    Amount Group #
                  </Label>
                  <Input
                    id="pat-amount-group"
                    type="number"
                    min={1}
                    value={form.amountCaptureGroup}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amountCaptureGroup: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pat-merchant-group" className="text-sm">
                    Merchant Group #
                  </Label>
                  <Input
                    id="pat-merchant-group"
                    type="number"
                    min={1}
                    value={form.merchantCaptureGroup}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        merchantCaptureGroup: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              {form.type === "auto" && (
                <div className="space-y-1">
                  <Label htmlFor="pat-keywords" className="text-sm">
                    Credit Keywords (comma-separated)
                  </Label>
                  <Input
                    id="pat-keywords"
                    value={form.creditKeywords}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        creditKeywords: e.target.value,
                      }))
                    }
                    placeholder="deposit,credit,salary"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="pat-enabled"
                  checked={form.enabled}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, enabled: v }))
                  }
                />
                <Label htmlFor="pat-enabled" className="text-sm">
                  Enabled
                </Label>
              </div>

              {/* Test Area */}
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="text-sm font-medium">Test Pattern</Label>
                <textarea
                  value={testText}
                  onChange={(e) => {
                    setTestText(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="Paste a sample SMS message here..."
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testing || !form.regex || !testText}
                  >
                    {testing ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <FlaskConical className="mr-1 h-3 w-3" />
                    )}
                    Test
                  </Button>
                  {testResult && (
                    <span
                      className={`text-xs ${testResult.startsWith("Error") ? "text-destructive" : "text-emerald-600"}`}
                    >
                      {testResult}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <ResponsiveDialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.regex}>
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
    </div>
  );
}
