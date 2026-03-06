"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WrappedButton } from "./wrapped-button";
import { UserMenu } from "@/components/auth/user-menu";
import { LogoMark } from "@/components/ui/logo";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <LogoMark className="h-6 w-6" />
        <h1 className="text-lg font-bold tracking-tight">MoneyStyle</h1>
      </Link>
      <div className="flex items-center gap-2">
        <WrappedButton />
        <UserMenu />
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={cycleTheme}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
