"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithTelegramWidget } from "@/actions/auth";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void;
  }
}

export function TelegramLoginButton() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername || !widgetRef.current) return;

    // Global callback for Telegram widget
    window.onTelegramAuth = async (user) => {
      setLoading(true);
      setError("");
      const result = await signInWithTelegramWidget(user);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        window.location.href = "/dashboard";
      }
    };

    // Load Telegram Login Widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    widgetRef.current.innerHTML = "";
    widgetRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername]);

  if (!botUsername) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting with Telegram...
      </div>
    );
  }

  return (
    <div>
      <div ref={widgetRef} className="flex justify-center [&>iframe]:!w-full" />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
