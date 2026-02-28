"use client";

import { MobileNav } from "./sidebar";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
      <MobileNav />
      <h1 className="text-lg font-bold tracking-tight">Revenue</h1>
    </header>
  );
}
