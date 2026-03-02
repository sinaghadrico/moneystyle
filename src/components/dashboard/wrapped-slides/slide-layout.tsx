import { cn } from "@/lib/utils";

type SlideLayoutProps = {
  children: React.ReactNode;
  gradient: string;
  emoji: string;
  isActive: boolean;
};

export function SlideLayout({
  children,
  gradient,
  emoji,
  isActive,
}: SlideLayoutProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[400px] w-full shrink-0 max-w-sm flex-col items-center justify-center rounded-lg p-8 text-center transition-opacity duration-500",
        gradient,
        isActive ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "mb-4 text-5xl transition-transform duration-700",
          isActive ? "scale-100" : "scale-50",
        )}
      >
        {emoji}
      </div>
      {children}
    </div>
  );
}

type AnimatedValueProps = {
  children: React.ReactNode;
  delay?: number;
  isActive: boolean;
};

export function AnimatedValue({
  children,
  delay = 0,
  isActive,
}: AnimatedValueProps) {
  return (
    <div
      className={cn(
        "transition-all duration-700",
        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
