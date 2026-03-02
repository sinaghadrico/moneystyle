"use client";

import { useRef, type ReactNode } from "react";
import { useDrag } from "@use-gesture/react";

type SwipeableCardProps = {
  children: ReactNode;
  actions: ReactNode;
  actionWidth?: number;
};

export function SwipeableCard({
  children,
  actions,
  actionWidth = 140,
}: SwipeableCardProps) {
  const offsetRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], active, cancel }) => {
      const el = containerRef.current;
      if (!el) return;

      if (active) {
        // Clamp between -actionWidth and 0
        const next = Math.max(-actionWidth, Math.min(0, offsetRef.current + mx));
        el.style.transition = "none";
        el.style.transform = `translateX(${next}px)`;
      } else {
        // Snap logic
        const current = offsetRef.current + mx;
        const fastSwipeLeft = vx > 0.3 && dx < 0;
        const snapOpen = current < -actionWidth / 2 || fastSwipeLeft;
        const target = snapOpen ? -actionWidth : 0;

        offsetRef.current = target;
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
      </div>
    </div>
  );
}
