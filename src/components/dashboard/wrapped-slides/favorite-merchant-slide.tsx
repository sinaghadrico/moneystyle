import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

export function FavoriteMerchantSlide({ data, isActive }: Props) {
  const merchant = data.favoriteMerchant;
  const animatedVisits = useAnimatedCounter(
    merchant?.visitCount ?? 0,
    1200,
    isActive
  );
  const animatedTotal = useAnimatedCounter(
    merchant?.totalSpent ?? 0,
    1500,
    isActive
  );

  if (!merchant) return null;

  return (
    <SlideLayout
      gradient="bg-linear-to-br from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white"
      emoji="⭐"
      isActive={isActive}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-2 text-lg font-medium opacity-90">
          Your favorite place
        </p>
      </AnimatedValue>

      <AnimatedValue delay={200} isActive={isActive}>
        <p className="mb-6 text-4xl font-bold">{merchant.merchant}</p>
      </AnimatedValue>

      <AnimatedValue delay={400} isActive={isActive}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{Math.round(animatedVisits)}</p>
            <p className="text-sm opacity-75">visits</p>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div className="text-center">
            <p className="text-3xl font-bold">
              {formatCurrency(animatedTotal)}
            </p>
            <p className="text-sm opacity-75">total spent</p>
          </div>
        </div>
      </AnimatedValue>
    </SlideLayout>
  );
}
