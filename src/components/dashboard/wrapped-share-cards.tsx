"use client";

import { useState, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import html2canvas from "html2canvas";
import { toast } from "sonner";

type Props = {
  data: WrappedData;
  onClose: () => void;
};

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

const GRADIENTS = [
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f97316)",
];

async function captureCard(element: HTMLDivElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  });
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );
}

async function shareOrDownload(element: HTMLDivElement, cardName: string) {
  try {
    const blob = await captureCard(element);
    const fileName = `moneystyle-wrapped-${cardName}.png`;

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: "image/png" });
      const shareData = { files: [file], title: "My MoneyStyle Wrapped" };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }

    // Download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Card downloaded!");
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      toast.error("Failed to share card");
    }
  }
}

function Watermark() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        opacity: 0.6,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          background: "rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        M
      </div>
      <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>
        MoneyStyle
      </span>
    </div>
  );
}

// --- Card Components (using inline styles for html2canvas compatibility) ---

function OverviewCard({ data }: { data: WrappedData }) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: GRADIENTS[0],
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <span style={{ fontSize: 48, marginBottom: 12 }}>💸</span>
      <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 4 }}>
        {data.monthLabel}
      </p>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: -0.5,
        }}
      >
        Your Month at a Glance
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 280,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 20px",
            backdropFilter: "blur(8px)",
          }}
        >
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
            Total Spent
          </p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>
            {formatCurrency(data.totalSpent)}
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
            Total Earned
          </p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>
            {formatCurrency(data.totalIncome)}
          </p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 20px",
          }}
        >
          <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Net</p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: data.netBalance >= 0 ? "#bbf7d0" : "#fecaca",
            }}
          >
            {data.netBalance >= 0 ? "+" : ""}
            {formatCurrency(data.netBalance)}
          </p>
        </div>
      </div>

      <Watermark />
    </div>
  );
}

function TopCategoryCard({ data }: { data: WrappedData }) {
  const cat = data.topCategory;
  if (!cat) return null;

  const CATEGORY_EMOJIS: Record<string, string> = {
    Food: "🍔",
    Groceries: "🛒",
    Transport: "🚗",
    Shopping: "🛍",
    Entertainment: "🎬",
    Health: "💊",
    Education: "📚",
    Bills: "📄",
    Travel: "✈️",
    Rent: "🏠",
    Subscriptions: "📱",
  };

  const emoji = CATEGORY_EMOJIS[cat.name] || "📊";

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: GRADIENTS[1],
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <span style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</span>
      <p
        style={{
          fontSize: 16,
          opacity: 0.9,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        Top Category
      </p>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 24,
          letterSpacing: -0.5,
        }}
      >
        {cat.name}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: 16,
          padding: "20px 28px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
          {formatCurrency(cat.amount)}
        </p>
        <p style={{ fontSize: 14, opacity: 0.8 }}>
          {cat.count} transactions
        </p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: 24,
          padding: "8px 20px",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        That&apos;s {cat.percentOfTotal}% of your spending
      </div>

      <Watermark />
    </div>
  );
}

function FavoriteMerchantCard({ data }: { data: WrappedData }) {
  const merchant = data.favoriteMerchant;
  if (!merchant) return null;

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: GRADIENTS[2],
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />

      <span style={{ fontSize: 56, marginBottom: 16 }}>⭐</span>
      <p
        style={{
          fontSize: 16,
          opacity: 0.9,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        Your Favorite Spot
      </p>
      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: -0.5,
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        {merchant.merchant}
      </h2>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 32, fontWeight: 700 }}>
            {merchant.visitCount}
          </p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>visits</p>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 24, fontWeight: 700 }}>
            {formatCurrency(merchant.totalSpent)}
          </p>
          <p style={{ fontSize: 13, opacity: 0.8 }}>total spent</p>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: 24,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        You visited here {merchant.visitCount > 4 ? "a lot" : "regularly"} this
        month!
      </div>

      <Watermark />
    </div>
  );
}

function SpendingPatternCard({ data }: { data: WrappedData }) {
  const { busiestDay, dailyAmounts } = data.spendingPattern;
  const { noSpendDays, avgDailySpend, longestNoSpendStreak } = data.funFacts;
  const maxAmount = Math.max(...dailyAmounts, 1);
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: GRADIENTS[3],
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      <span style={{ fontSize: 48, marginBottom: 12 }}>📊</span>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 28,
          letterSpacing: -0.5,
        }}
      >
        Spending Pattern
      </h2>

      {/* Mini bar chart */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          marginBottom: 28,
          height: 120,
        }}
      >
        {dailyAmounts.map((amount, i) => {
          const height = Math.max((amount / maxAmount) * 100, 6);
          const isBusiest = DAY_LABELS[i] === busiestDay;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height,
                  borderRadius: "6px 6px 0 0",
                  background: isBusiest
                    ? "#fff"
                    : "rgba(255,255,255,0.4)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isBusiest ? 700 : 400,
                  opacity: isBusiest ? 1 : 0.7,
                }}
              >
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 280,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <span style={{ fontSize: 14, opacity: 0.8 }}>Most expensive day</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{busiestDay}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <span style={{ fontSize: 14, opacity: 0.8 }}>No-spend days</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{noSpendDays}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <span style={{ fontSize: 14, opacity: 0.8 }}>Longest streak</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {longestNoSpendStreak} days
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <span style={{ fontSize: 14, opacity: 0.8 }}>Daily average</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {formatCurrency(avgDailySpend)}
          </span>
        </div>
      </div>

      <Watermark />
    </div>
  );
}

function FunFactsCard({ data }: { data: WrappedData }) {
  const { noSpendDays, totalDaysInMonth, avgDailySpend, longestNoSpendStreak } =
    data.funFacts;

  const facts: string[] = [];

  if (noSpendDays > totalDaysInMonth / 2) {
    facts.push(
      `You didn't spend anything on ${noSpendDays} days -- more than half the month!`
    );
  } else if (noSpendDays > 0) {
    facts.push(
      `You had ${noSpendDays} no-spend days this month.`
    );
  } else {
    facts.push("You spent money every single day this month!");
  }

  if (longestNoSpendStreak >= 3) {
    facts.push(
      `Your longest no-spend streak was ${longestNoSpendStreak} days in a row.`
    );
  }

  if (data.transactionCount > 0) {
    const avgPerTx = data.totalSpent / data.transactionCount;
    facts.push(
      `Average transaction: ${formatCurrency(avgPerTx)}`
    );
  }

  if (data.vsLastMonthPercent !== null) {
    if (data.vsLastMonthPercent < 0) {
      facts.push(
        `You spent ${Math.abs(data.vsLastMonthPercent)}% less than last month!`
      );
    } else if (data.vsLastMonthPercent > 0) {
      facts.push(
        `You spent ${data.vsLastMonthPercent}% more than last month.`
      );
    }
  }

  facts.push(`Daily average spend: ${formatCurrency(avgDailySpend)}`);

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: GRADIENTS[4],
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />

      <span style={{ fontSize: 56, marginBottom: 16 }}>🎯</span>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: -0.5,
        }}
      >
        Fun Facts
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 300,
        }}
      >
        {facts.slice(0, 4).map((fact, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "16px 20px",
              fontSize: 15,
              lineHeight: 1.4,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>
              {["✨", "🔥", "💡", "🎉"][i]}
            </span>
            <span>{fact}</span>
          </div>
        ))}
      </div>

      <Watermark />
    </div>
  );
}

// --- Main Component ---

const supportsWebShare =
  typeof window !== "undefined" &&
  "share" in navigator &&
  "canShare" in navigator;

export function WrappedShareCards({ data, onClose }: Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const [sharing, setSharing] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Build cards array based on available data
  type CardEntry = {
    name: string;
    component: React.ReactNode;
  };

  const cards: CardEntry[] = [
    { name: "overview", component: <OverviewCard data={data} /> },
  ];

  if (data.topCategory) {
    cards.push({
      name: "top-category",
      component: <TopCategoryCard data={data} />,
    });
  }

  if (data.favoriteMerchant) {
    cards.push({
      name: "favorite-spot",
      component: <FavoriteMerchantCard data={data} />,
    });
  }

  cards.push({
    name: "spending-pattern",
    component: <SpendingPatternCard data={data} />,
  });

  cards.push({
    name: "fun-facts",
    component: <FunFactsCard data={data} />,
  });

  const totalCards = cards.length;
  const canPrev = currentCard > 0;
  const canNext = currentCard < totalCards - 1;

  const goNext = useCallback(() => {
    setCurrentCard((i) => Math.min(i + 1, totalCards - 1));
  }, [totalCards]);

  const goPrev = useCallback(() => {
    setCurrentCard((i) => Math.max(i - 1, 0));
  }, []);

  const handleShare = useCallback(async () => {
    const el = cardRefs.current[currentCard];
    if (!el || sharing) return;
    setSharing(true);
    await shareOrDownload(el, cards[currentCard].name);
    setSharing(false);
  }, [currentCard, sharing, cards]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-30 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center gap-3 w-full px-4">
        {/* Card area */}
        <div className="relative flex items-center gap-2">
          {/* Prev arrow (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 hidden sm:flex"
            disabled={!canPrev}
            onClick={goPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Cards container — responsive size */}
          <div
            className="overflow-hidden rounded-3xl mx-auto"
            style={{ width: Math.min(CARD_WIDTH, window?.innerWidth ? window.innerWidth - 32 : CARD_WIDTH), height: Math.min(CARD_HEIGHT, window?.innerHeight ? window.innerHeight - 180 : CARD_HEIGHT) }}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{
                transform: `translateX(-${currentCard * 100}%)`,
              }}
            >
              {cards.map((card, i) => (
                <div
                  key={card.name}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="shrink-0 w-full h-full flex items-center justify-center"
                >
                  <div style={{ transform: `scale(${Math.min(1, (window?.innerWidth ? (window.innerWidth - 32) / CARD_WIDTH : 1), (window?.innerHeight ? (window.innerHeight - 180) / CARD_HEIGHT : 1))})`, transformOrigin: "center center" }}>
                    {card.component}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 hidden sm:flex"
            disabled={!canNext}
            onClick={goNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dot indicators + mobile nav + share — all visible */}
        <div className="flex items-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentCard
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => setCurrentCard(i)}
            />
          ))}
        </div>

        {/* Mobile navigation */}
        <div className="flex items-center gap-3 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            disabled={!canPrev}
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white/60">
            {currentCard + 1} / {totalCards}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            disabled={!canNext}
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Share / Download button — always visible */}
        <Button
          className="gap-2 rounded-full bg-white text-black hover:bg-white/90 px-6 shrink-0"
          onClick={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : supportsWebShare ? (
            <>
              <Share2 className="h-4 w-4" />
              Share Card
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Card
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
