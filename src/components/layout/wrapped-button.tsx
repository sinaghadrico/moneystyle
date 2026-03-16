"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { SpendingWrapped } from "@/components/dashboard/spending-wrapped";
import { useFeatureFlag } from "@/components/settings/settings-provider";

export function WrappedButton() {
  const [open, setOpen] = useState(false);
  const enabled = useFeatureFlag("spendingWrapped");

  if (!enabled) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative h-9 w-9 shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 transition-transform hover:scale-110 active:scale-95"
        title="Spending Wrapped"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-card transition-colors group-hover:bg-card/80">
          <Trophy className="h-4 w-4 text-pink-500" />
        </div>
      </button>
      <SpendingWrapped open={open} onOpenChange={setOpen} />
    </>
  );
}
