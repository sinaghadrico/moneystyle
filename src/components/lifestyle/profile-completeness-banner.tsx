"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { getUserPreferences } from "@/actions/weekend-planner";
import { getIncomeSources, getReserves } from "@/actions/profile";

type Tip = {
  label: string;
  href: string;
};

export function ProfileCompletenessBanner() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function check() {
      const [prefs, sources, reserves] = await Promise.all([
        getUserPreferences(),
        getIncomeSources(),
        getReserves(),
      ]);

      const items: Tip[] = [];

      if (prefs.entertainment.length === 0)
        items.push({ label: "entertainment", href: "/profile/personal" });
      if (prefs.food.length === 0)
        items.push({ label: "food tastes", href: "/profile/personal" });
      if (prefs.likes.length === 0)
        items.push({ label: "interests", href: "/profile/personal" });
      if (sources.length === 0)
        items.push({ label: "income", href: "/profile/income" });
      if (reserves.length === 0)
        items.push({ label: "reserves", href: "/profile/income" });

      setTips(items);
      setLoaded(true);
    }

    check();
  }, []);

  if (!loaded) return null;

  const hasGaps = tips.length > 0;
  const href = hasGaps ? tips[0].href : "/profile/personal";

  return (
    <NextLink href={href} className="group block">
      <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 px-4 py-3 ring-1 ring-amber-500/20 transition-all group-hover:ring-amber-500/40 group-hover:shadow-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
            {hasGaps ? "Better profile = better AI" : "AI fully personalized"}
          </p>
          <p className="mt-0.5 text-xs text-amber-800/70 dark:text-amber-300/70">
            {hasGaps ? (
              <>Add {tips.map((t) => t.label).join(", ")} for smarter suggestions.</>
            ) : (
              <>Your profile is complete — suggestions are tailored to you.</>
            )}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-amber-600/60 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-amber-400/60 dark:group-hover:text-amber-400" />
      </div>
    </NextLink>
  );
}
