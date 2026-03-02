"use client";

import { useState, useEffect, useCallback } from "react";
import { useDrag } from "@use-gesture/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goNext, goPrev]);

  // Swipe gesture
  const bind = useDrag(
    ({ swipe: [swipeX] }) => {
      if (swipeX === -1) goNext();
      if (swipeX === 1) goPrev();
    },
    { axis: "x", swipe: { distance: 50 } },
  );

  const isEmpty = data && data.transactionCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-sm max-h-[470px]"
      >
        <DialogTitle className="sr-only">Spending Wrapped</DialogTitle>
        <DialogDescription className="sr-only">
          Monthly spending summary with animated slides
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]">
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
            size="icon-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide area */}
        <div className="relative" {...bind()}>
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : isEmpty ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 p-8 text-center">
              <span className="text-5xl">📭</span>
              <p className="text-muted-foreground text-lg">
                No spending data for this month
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {slides.map((slide, i) => (
                  <div key={i} className="w-full shrink-0">
                    {slide}
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              {canPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {canNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
                  onClick={goNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress dots */}
        {totalSlides > 0 && !loading && !isEmpty && (
          <div className="flex items-center justify-center gap-1.5 border-t py-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === slideIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 w-2",
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
