import type { WrappedData } from "@/lib/types";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SpendingPatternSlide({ data, isActive }: Props) {
  const { dailyAmounts, busiestDay, lightestDay } = data.spendingPattern;
  const maxAmount = Math.max(...dailyAmounts, 1);

  return (
    <SlideLayout
      gradient="bg-linear-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600 text-white"
      emoji="📊"
      isActive={isActive}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-6 text-lg font-medium opacity-90">
          Your spending by day of the week
        </p>
      </AnimatedValue>

      <AnimatedValue delay={200} isActive={isActive}>
        <div className="mb-6 flex items-end gap-3">
          {dailyAmounts.map((amount, i) => {
            const height = Math.max((amount / maxAmount) * 140, 8);
            const isBusiest = DAY_LABELS[i] === busiestDay;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 rounded-t-md transition-all duration-1000 ${
                    isBusiest ? "bg-white" : "bg-white/50"
                  }`}
                  style={{
                    height: isActive ? `${height}px` : "8px",
                    transitionDelay: `${300 + i * 100}ms`,
                  }}
                />
                <span
                  className={`text-xs ${
                    isBusiest ? "font-bold" : "opacity-75"
                  }`}
                >
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </AnimatedValue>

      <AnimatedValue delay={800} isActive={isActive}>
        <div className="flex items-center gap-4 text-sm">
          <span className="rounded-full bg-white/20 px-3 py-1">
            Busiest: <strong>{busiestDay}</strong>
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1">
            Lightest: <strong>{lightestDay}</strong>
          </span>
        </div>
      </AnimatedValue>
    </SlideLayout>
  );
}
