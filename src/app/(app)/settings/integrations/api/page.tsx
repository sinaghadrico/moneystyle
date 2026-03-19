"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, Copy, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { generateDeveloperApiKey, revokeApiKey } from "@/actions/settings";
import { useAppSettings } from "@/components/settings/settings-provider";

export default function SettingsApiPage() {
  const { settings, refresh } = useAppSettings();
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const apiKey = settings.developerApiKey;

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateDeveloperApiKey();
    setGenerating(false);
    if (result.success) {
      await navigator.clipboard.writeText(result.apiKey);
      toast.success("API key generated and copied to clipboard");
      await refresh();
      setShowKey(true);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    await revokeApiKey();
    setRevoking(false);
    toast.success("API key revoked");
    await refresh();
    setShowKey(false);
  };

  const handleCopy = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="h-4 w-4" />
            Developer API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Use the REST API to programmatically access your transactions, categories, and accounts.
            See the{" "}
            <a href="/docs/api" className="underline underline-offset-2 hover:text-foreground">
              full API documentation
            </a>.
          </p>

          <div className="space-y-2">
            <Label>API Key</Label>
            {apiKey ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    className="font-mono text-xs pr-16"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCopy}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-destructive"
                  onClick={handleRevoke}
                  disabled={revoking}
                >
                  {revoking && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Revoke
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  readOnly
                  disabled
                  value=""
                  placeholder="No API key generated"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <p className="text-xs font-medium">Quick Start</p>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`# List transactions
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  ${typeof window !== "undefined" ? window.location.origin : "https://moneystyle.app"}/api/v1/transactions

# Create transaction
curl -X POST \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"date":"2026-03-19","type":"expense","accountId":"...","amount":25}' \\
  ${typeof window !== "undefined" ? window.location.origin : "https://moneystyle.app"}/api/v1/transactions`}
            </pre>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Available Endpoints</p>
            <div className="grid gap-1 text-xs text-muted-foreground">
              {[
                "GET    /api/v1/transactions",
                "POST   /api/v1/transactions",
                "GET    /api/v1/transactions/:id",
                "PATCH  /api/v1/transactions/:id",
                "DELETE /api/v1/transactions/:id",
                "GET    /api/v1/categories",
                "POST   /api/v1/categories",
                "GET    /api/v1/accounts",
                "POST   /api/v1/accounts",
              ].map((ep) => (
                <code key={ep} className="font-mono">{ep}</code>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
