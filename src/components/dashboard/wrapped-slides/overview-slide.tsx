import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

export function OverviewSlide({ data, isActive }: Props) {
  const animatedTotal = useAnimatedCounter(data.totalSpent, 1500, isActive);

  return (
    <SlideLayout
      gradient="bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white"
      emoji="💸"
      isActive={isActive}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-2 text-lg font-medium opacity-90">
          In {data.monthLabel}, you spent
        </p>
      </AnimatedValue>

      <AnimatedValue delay={200} isActive={isActive}>
        <p className="mb-4 text-5xl font-bold tracking-tight">
          {formatCurrency(animatedTotal)}
        </p>
      </AnimatedValue>

      <AnimatedValue delay={400} isActive={isActive}>
        <div className="flex items-center gap-4">
          {data.vsLastMonthPercent !== null && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                data.vsLastMonthPercent > 0
                  ? "bg-red-400/30 text-red-100"
                  : "bg-green-400/30 text-green-100"
              }`}
            >
              {data.vsLastMonthPercent > 0 ? "+" : ""}
              {data.vsLastMonthPercent}% vs last month
            </span>
          )}
        </div>
      </AnimatedValue>

      <AnimatedValue delay={600} isActive={isActive}>
        <p className="mt-4 text-sm opacity-75">
          across {data.transactionCount} transactions
        </p>
      </AnimatedValue>
    </SlideLayout>
  );
}
