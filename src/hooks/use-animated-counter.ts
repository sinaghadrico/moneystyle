import { useState, useEffect, useRef } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useAnimatedCounter(
  target: number,
  duration: number = 1500,
  enabled: boolean = true,
): number {
  const [value, setValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setValue(eased * target);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, enabled]);

  // Reset when target changes to 0 (month switch)
  useEffect(() => {
    if (target === 0) {
      hasAnimated.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(0);
    }
  }, [target]);

  return value;
}
