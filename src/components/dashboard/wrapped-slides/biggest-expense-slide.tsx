import type { WrappedData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

export function BiggestExpenseSlide({ data, isActive }: Props) {
  const expense = data.biggestExpense;
  const animatedAmount = useAnimatedCounter(
    expense?.amount ?? 0,
    1500,
    isActive
  );

  if (!expense) return null;

  return (
    <SlideLayout
      gradient="bg-linear-to-br from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 text-white"
      emoji="🔥"
      isActive={isActive}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-2 text-lg font-medium opacity-90">
          Your biggest single expense
        </p>
      </AnimatedValue>

      <AnimatedValue delay={200} isActive={isActive}>
        <p className="mb-2 text-3xl font-bold">{expense.merchant}</p>
      </AnimatedValue>

      <AnimatedValue delay={400} isActive={isActive}>
        <p className="mb-4 text-5xl font-bold tracking-tight">
          {formatCurrency(animatedAmount)}
        </p>
      </AnimatedValue>

      <AnimatedValue delay={600} isActive={isActive}>
        <div className="flex items-center gap-3 text-sm opacity-75">
          <span>{formatDate(expense.date)}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">
            {expense.category}
          </span>
        </div>
      </AnimatedValue>
    </SlideLayout>
  );
}
