"use client";

import { useEffect, useState, useCallback } from "react";
import { signInWithTelegramMiniApp } from "@/actions/auth";

export function useTelegramAutoAuth() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
    }
  }, []);

  const signInWithTelegram = useCallback(async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) return;

    setAuthStatus("loading");
    const result = await signInWithTelegramMiniApp(tg.initData);
    if (result.error) {
      setAuthStatus("error");
    } else {
      setAuthStatus("done");
      window.location.href = "/dashboard";
    }
  }, []);

  return { isTelegram, authStatus, signInWithTelegram };
}
