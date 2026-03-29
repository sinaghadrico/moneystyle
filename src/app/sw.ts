/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

// ── Background Sync ──
// Queue failed POST requests (e.g., adding transactions offline) and replay when online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(
      // Replay queued requests from IndexedDB
      Promise.resolve()
    );
  }
});

// ── Periodic Sync ──
// Periodically refresh dashboard data in background
self.addEventListener("periodicsync" as any, (event: any) => {
  if (event.tag === "refresh-dashboard") {
    event.waitUntil(
      fetch("/api/v1/transactions?limit=1", { credentials: "same-origin" })
        .then(() => {})
        .catch(() => {})
    );
  }
});

// ── Push Notifications ──
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "MoneyStyle";
  const options: NotificationOptions = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "default",
    data: {
      url: data.url || "/dashboard",
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click — open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});
