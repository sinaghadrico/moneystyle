import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { SlideLayout, AnimatedValue } from "./slide-layout";

type Props = { data: WrappedData; isActive: boolean };

export function TopCategorySlide({ data, isActive }: Props) {
  const cat = data.topCategory;
  const animatedAmount = useAnimatedCounter(cat?.amount ?? 0, 1500, isActive);
  const animatedPercent = useAnimatedCounter(
    cat?.percentOfTotal ?? 0,
    1200,
    isActive
  );

  if (!cat) return null;

  // SVG progress ring
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  return (
    <SlideLayout
      gradient="bg-linear-to-br text-white"
      emoji="🏆"
      isActive={isActive}
    >
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${cat.color}cc, ${cat.color}88)`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <AnimatedValue isActive={isActive}>
          <p className="mb-2 text-lg font-medium opacity-90">
            Your #1 spending category
          </p>
        </AnimatedValue>

        <AnimatedValue delay={200} isActive={isActive}>
          <p className="mb-6 text-4xl font-bold">{cat.name}</p>
        </AnimatedValue>

        <AnimatedValue delay={400} isActive={isActive}>
          <div className="relative mb-4 flex items-center justify-center">
            <svg width="100" height="100" className="-rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-bold">
              {Math.round(animatedPercent)}%
            </span>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={600} isActive={isActive}>
          <p className="text-2xl font-semibold">
            {formatCurrency(animatedAmount)}
          </p>
          <p className="mt-1 text-sm opacity-75">
            {cat.count} transaction{cat.count !== 1 ? "s" : ""}
          </p>
        </AnimatedValue>
      </div>
    </SlideLayout>
  );
}
