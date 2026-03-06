"use client";

import { useEffect, useState } from "react";
import { signInWithTelegramMiniApp } from "@/actions/auth";

export function useTelegramAutoAuth() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) return;

    setIsTelegram(true);
    setAuthStatus("loading");
    tg.ready();
    tg.expand();

    signInWithTelegramMiniApp(tg.initData).then((result) => {
      if (result.error) {
        setAuthStatus("error");
      } else {
        setAuthStatus("done");
        window.location.href = "/dashboard";
      }
    });
  }, []);

  return { isTelegram, authStatus };
}
