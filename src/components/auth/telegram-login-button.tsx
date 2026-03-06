"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { signInWithTelegramWidget } from "@/actions/auth";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string>) => void;
  }
}

export function TelegramLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  if (!botUsername) return null;

  const handleClick = () => {
    if (loading) return;

    // Set up global callback
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

    // Load widget script in a hidden container to trigger Telegram auth popup
    const existing = document.getElementById("tg-widget-container");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "tg-widget-container";
    container.style.position = "fixed";
    container.style.top = "-9999px";
    document.body.appendChild(container);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-auth-url", window.location.href);
    script.async = true;
    container.appendChild(script);

    // After widget loads, click the iframe button to open popup
    setTimeout(() => {
      const iframe = container.querySelector("iframe");
      if (iframe) {
        iframe.style.position = "fixed";
        iframe.style.top = "50%";
        iframe.style.left = "50%";
        iframe.style.transform = "translate(-50%, -50%)";
        iframe.style.zIndex = "9999";
        iframe.click();
      }
    }, 1000);
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
