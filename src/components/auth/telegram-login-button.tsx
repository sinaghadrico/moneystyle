"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { signInWithTelegramWidget } from "@/actions/auth";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void;
    TelegramLoginWidget?: {
      auth: (options: { bot_id: string; request_access?: string; lang?: string }, callback: (user: Record<string, string> | false) => void) => void;
    };
  }
}

export function TelegramLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const handleAuth = useCallback(async (user: Record<string, string>) => {
    setLoading(true);
    setError("");
    const result = await signInWithTelegramWidget(user);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }, []);

  useEffect(() => {
    if (!botUsername) return;

    // Global callback for Telegram widget
    window.onTelegramAuth = (user) => {
      handleAuth(user);
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, handleAuth]);

  if (!botUsername) return null;

  const handleClick = () => {
    if (loading) return;

    // Open Telegram OAuth directly in a popup
    const botId = botUsername;
    const origin = encodeURIComponent(window.location.origin);
    const popup = window.open(
      `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&embed=0&request_access=write&return_to=${encodeURIComponent(window.location.href)}`,
      "telegram_oauth",
      `width=550,height=500,left=${(screen.width - 550) / 2},top=${(screen.height - 500) / 2}`
    );

    // Poll for popup close and check for auth data in URL
    if (popup) {
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
        }
      }, 500);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {loading ? "Connecting..." : "Continue with Telegram"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
