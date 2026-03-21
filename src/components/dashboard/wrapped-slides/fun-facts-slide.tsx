import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

export function FunFactsSlide({ data, isActive }: Props) {
  const { noSpendDays, totalDaysInMonth, avgDailySpend, longestNoSpendStreak } =
    data.funFacts;

  const animatedNoSpend = useAnimatedCounter(noSpendDays, 1000, isActive);
  const animatedAvg = useAnimatedCounter(avgDailySpend, 1200, isActive);
  const animatedStreak = useAnimatedCounter(longestNoSpendStreak, 800, isActive);

  return (
    <SlideLayout
      gradient="bg-linear-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white"
      emoji="🎯"
      isActive={isActive}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-6 text-lg font-medium opacity-90">Fun facts</p>
      </AnimatedValue>

      <div className="grid w-full max-w-sm grid-cols-1 gap-3">
        <AnimatedValue delay={200} isActive={isActive}>
          <div className="rounded-lg bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-3xl font-bold">
              {Math.round(animatedNoSpend)}{" "}
              <span className="text-base font-normal opacity-75">
                / {totalDaysInMonth} days
              </span>
            </p>
            <p className="text-sm opacity-75">with no spending</p>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={400} isActive={isActive}>
          <div className="rounded-lg bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-3xl font-bold">
              {formatCurrency(animatedAvg)}
            </p>
            <p className="text-sm opacity-75">average daily spend</p>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={600} isActive={isActive}>
          <div className="rounded-lg bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-3xl font-bold">
              {Math.round(animatedStreak)}{" "}
              <span className="text-base font-normal opacity-75">days</span>
            </p>
            <p className="text-sm opacity-75">longest no-spend streak</p>
          </div>
        </AnimatedValue>
      </div>
    </SlideLayout>
  );
}
