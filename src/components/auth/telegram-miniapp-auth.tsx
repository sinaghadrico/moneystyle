"use client";

import { useEffect, useState } from "react";
import { signInWithTelegramMiniApp } from "@/actions/auth";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function TelegramMiniAppAuth() {
  const [status, setStatus] = useState<"loading" | "error" | "no-telegram">(
    "loading"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg?.initData) {
      setStatus("no-telegram");
      return;
    }

    tg.ready();
    tg.expand();

    async function authenticate() {
      const result = await signInWithTelegramMiniApp(tg!.initData);
      if (result.error) {
        setStatus("error");
        setError(result.error);
      } else {
        window.location.href = "/dashboard";
      }
    }

    authenticate();
  }, []);

  if (status === "no-telegram") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Open in Telegram</p>
          <p className="text-sm text-muted-foreground">
            This page is designed to be opened from Telegram.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-destructive">
            Authentication Failed
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-3">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          Signing in with Telegram...
        </p>
      </div>
    </div>
  );
}
