"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import { ChevronLeft } from "lucide-react";

type SwipeableCardProps = {
  children: ReactNode;
  actions: ReactNode;
  actionWidth?: number;
  onTap?: () => void;
  showHint?: boolean;
};

export function SwipeableCard({
  children,
  actions,
  actionWidth = 140,
  onTap,
  showHint,
}: SwipeableCardProps) {
  const offsetRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Auto-peek animation
  useEffect(() => {
    if (!showHint) return;
    const el = containerRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      el.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      el.style.transform = "translateX(-70px)";
      setTimeout(() => {
        el.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        el.style.transform = "translateX(0px)";
      }, 800);
    }, 800);

    return () => clearTimeout(timer);
  }, [showHint]);

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], active, cancel, tap }) => {
      if (tap && onTap) {
        onTap();
        return;
      }

      const el = containerRef.current;
      if (!el) return;

      if (active) {
        const next = Math.max(-actionWidth, Math.min(0, offsetRef.current + mx));
        el.style.transition = "none";
        el.style.transform = `translateX(${next}px)`;
      } else {
        const current = offsetRef.current + mx;
        const fastSwipeLeft = vx > 0.3 && dx < 0;
        const snapOpen = current < -actionWidth / 2 || fastSwipeLeft;
        const target = snapOpen ? -actionWidth : 0;

        offsetRef.current = target;
        setIsOpen(target !== 0);
        el.style.transition = "transform 0.2s ease-out";
        el.style.transform = `translateX(${target}px)`;
      }
    },
    {
      axis: "x",
      filterTaps: true,
      from: () => [offsetRef.current, 0],
    }
  );

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Action buttons revealed behind */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        {actions}
      </div>
      {/* Draggable foreground */}
      <div
        ref={containerRef}
        {...bind()}
        style={{ touchAction: "pan-y" }}
        className="relative bg-card"
      >
        {children}
        {/* Swipe hint chevron — hidden when card is swiped open */}
        {!isOpen && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground/30 pointer-events-none">
            <ChevronLeft className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
