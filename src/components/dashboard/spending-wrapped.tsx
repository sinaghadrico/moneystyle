"use client";

import { useState, useEffect, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getWrappedData } from "@/actions/wrapped";
import type { WrappedData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OverviewSlide } from "./wrapped-slides/overview-slide";
import { TopCategorySlide } from "./wrapped-slides/top-category-slide";
import { BiggestExpenseSlide } from "./wrapped-slides/biggest-expense-slide";
import { FavoriteMerchantSlide } from "./wrapped-slides/favorite-merchant-slide";
import { SpendingPatternSlide } from "./wrapped-slides/spending-pattern-slide";
import { FunFactsSlide } from "./wrapped-slides/fun-facts-slide";
import { SummarySlide } from "./wrapped-slides/summary-slide";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getLastMonths(count: number): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label });
  }
  return months;
}

const MONTHS = getLastMonths(12);

export function SpendingWrapped({ open, onOpenChange }: Props) {
  const [month, setMonth] = useState(MONTHS[0].value);
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const loadData = useCallback(async (m: string) => {
    setLoading(true);
    setSlideIndex(0);
    const result = await getWrappedData(m);
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadData(month);
    }
  }, [open, month, loadData]);

  // Build slides array based on available data
  const slides: React.ReactNode[] = [];
  if (data && data.transactionCount > 0) {
    slides.push(
      <OverviewSlide key="overview" data={data} isActive={slideIndex === 0} />,
    );
    if (data.topCategory) {
      slides.push(
        <TopCategorySlide
          key="category"
          data={data}
          isActive={slideIndex === slides.length}
        />,
      );
    }
    if (data.biggestExpense) {
      slides.push(
        <BiggestExpenseSlide
          key="biggest"
          data={data}
          isActive={slideIndex === slides.length}
        />,
      );
    }
    if (data.favoriteMerchant) {
      slides.push(
        <FavoriteMerchantSlide
          key="merchant"
          data={data}
          isActive={slideIndex === slides.length}
        />,
      );
    }
    slides.push(
      <SpendingPatternSlide
        key="pattern"
        data={data}
        isActive={slideIndex === slides.length}
      />,
    );
    slides.push(
      <FunFactsSlide
        key="facts"
        data={data}
        isActive={slideIndex === slides.length}
      />,
    );
    slides.push(
      <SummarySlide
        key="summary"
        data={data}
        isActive={slideIndex === slides.length}
      />,
    );
  }

  const totalSlides = slides.length;
  const canPrev = slideIndex > 0;
  const canNext = slideIndex < totalSlides - 1;

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(i + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const isEmpty = data && data.transactionCount === 0;

  // Auto-advance timer (6 seconds per slide)
  const SLIDE_DURATION = 6000;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open || loading || isEmpty || totalSlides === 0) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        // Auto-advance or close on last slide
        if (slideIndex < totalSlides - 1) {
          setSlideIndex((i) => i + 1);
        } else {
          onOpenChange(false);
        }
      }
    }, 30);
    return () => clearInterval(tick);
  }, [open, loading, isEmpty, slideIndex, totalSlides, onOpenChange, SLIDE_DURATION]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goNext, goPrev, onOpenChange]);

  // Swipe gesture
  const bind = useDrag(
    ({ swipe: [swipeX] }) => {
      if (swipeX === -1) goNext();
      if (swipeX === 1) goPrev();
    },
    { axis: "x", swipe: { distance: 50 } },
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Story container */}
      <div className="relative z-10 w-full h-full sm:h-[600px] sm:max-w-sm sm:rounded-2xl overflow-hidden bg-black flex flex-col select-none">
        {/* Progress bars (Instagram-style) */}
        {totalSlides > 0 && !loading && !isEmpty && (
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30"
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: i < slideIndex ? "100%" : i === slideIndex ? `${progress * 100}%` : "0%",
                    transition: i === slideIndex ? "none" : "width 300ms",
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 pt-7 pb-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[160px] h-8 border-white/20 bg-black/30 text-white text-sm backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Slide area */}
        <div className="flex-1 relative" {...bind()}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="text-6xl">📭</span>
              <p className="text-white/70 text-lg">
                No spending data for this month
              </p>
            </div>
          ) : (
            <div className="relative h-full overflow-hidden">
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {slides.map((slide, i) => (
                  <div key={i} className="w-full h-full shrink-0">
                    {slide}
                  </div>
                ))}
              </div>

              {/* Tap zones (left/right like Instagram) */}
              {canPrev && (
                <div
                  className="absolute inset-y-0 left-0 w-1/4 cursor-pointer"
                  onClick={goPrev}
                />
              )}
              {canNext && (
                <div
                  className="absolute inset-y-0 right-0 w-1/4 cursor-pointer"
                  onClick={goNext}
                />
              )}

              {/* Navigation arrows (desktop hover) */}
              {canPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden sm:flex"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {canNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 hidden sm:flex"
                  onClick={goNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
