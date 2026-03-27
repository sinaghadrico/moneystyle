"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { signInWithTelegramMiniApp } from "@/actions/auth";

function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

function subscribeTelegram() {
  // Telegram WebApp doesn't change after load — no-op subscriber
  return () => {};
}

function getSnapshot() {
  const tg = getTelegramWebApp();
  return !!(tg?.initData);
}

function getServerSnapshot() {
  return false;
}

export function useTelegramAutoAuth() {
  const isTelegram = useSyncExternalStore(subscribeTelegram, getSnapshot, getServerSnapshot);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const readyCalled = useRef(false);

  useEffect(() => {
    if (!isTelegram || readyCalled.current) return;
    readyCalled.current = true;
    const tg = getTelegramWebApp();
    tg?.ready();
    tg?.expand();
  }, [isTelegram]);

  const signInWithTelegram = useCallback(async () => {
    const tg = getTelegramWebApp();
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
