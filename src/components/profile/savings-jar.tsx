"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { SavingsProgress } from "@/lib/types";
import { Plus, X } from "lucide-react";

function JarSvg({ percentage, color }: { percentage: number; color: string }) {
  const fillPct = Math.min(percentage, 100);
  // Jar dimensions: body from y=30 to y=130, neck from y=10 to y=30
  // Fill level goes from bottom (130) up
  const bodyHeight = 100;
  const fillHeight = (fillPct / 100) * bodyHeight;
  const fillY = 130 - fillHeight;

  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-full"
      style={{ maxWidth: 120, maxHeight: 180 }}
    >
      <defs>
        <clipPath id={`jar-clip-${fillPct}`}>
          {/* Jar body */}
          <rect x="15" y="30" width="70" height="100" rx="10" />
          {/* Jar neck */}
          <rect x="30" y="12" width="40" height="22" rx="4" />
        </clipPath>
        <linearGradient id={`liquid-grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Jar outline */}
      <rect
        x="15"
        y="30"
        width="70"
        height="100"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground/30"
      />
      {/* Neck */}
      <rect
        x="30"
        y="12"
        width="40"
        height="22"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground/30"
      />
      {/* Lid */}
      <rect
        x="26"
        y="6"
        width="48"
        height="8"
        rx="4"
        fill="currentColor"
        className="text-muted-foreground/40"
      />

      {/* Liquid fill with wave animation */}
      <g clipPath={`url(#jar-clip-${fillPct})`}>
        <rect
          x="10"
          y={fillY}
          width="80"
          height={fillHeight + 10}
          fill={`url(#liquid-grad-${color.replace("#", "")})`}
          className="savings-jar-fill"
        />
        {/* Wave surface */}
        {fillPct > 0 && fillPct < 100 && (
          <g className="savings-jar-wave">
            <path
              d={`M10,${fillY} Q25,${fillY - 4} 40,${fillY} T70,${fillY} T100,${fillY} V${fillY + 6} H10 Z`}
              fill={color}
              opacity="0.5"
            />
            <path
              d={`M10,${fillY + 2} Q30,${fillY - 2} 50,${fillY + 2} T90,${fillY + 2} V${fillY + 6} H10 Z`}
              fill={color}
              opacity="0.3"
              className="savings-jar-wave-2"
            />
          </g>
        )}
      </g>

      {/* Percentage text */}
      <text
        x="50"
        y="85"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-[14px] font-bold"
        style={{ fontSize: 14, fontWeight: 700 }}
      >
        {fillPct}%
      </text>
    </svg>
  );
}

export function SavingsJar({
  goal,
  onDeposit,
}: {
  goal: SavingsProgress;
  onDeposit: (amount: number) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [amount, setAmount] = useState("");
  const [coinDrop, setCoinDrop] = useState(false);

  const handleAdd = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    setCoinDrop(true);
    setTimeout(() => {
      onDeposit(num);
      setAmount("");
      setShowInput(false);
      setCoinDrop(false);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Coin drop animation */}
      {coinDrop && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 savings-coin-drop">
          <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-500 flex items-center justify-center text-[10px] font-bold text-yellow-800 shadow-md">
            $
          </div>
        </div>
      )}

      {/* Jar */}
      <div className="w-24 h-36 relative">
        <JarSvg percentage={goal.percentage} color={goal.color} />
      </div>

      {/* Info */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold truncate max-w-[120px]">
          {goal.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(goal.currentAmount, goal.currency)} /{" "}
          {formatCurrency(goal.targetAmount, goal.currency)}
        </p>
      </div>

      {/* Add money */}
      {showInput ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-7 w-20 text-xs"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleAdd}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => {
              setShowInput(false);
              setAmount("");
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowInput(true)}
        >
          <Plus className="h-3 w-3" />
          Add Money
        </Button>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes wave-drift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        @keyframes wave-drift-2 {
          0% { transform: translateX(0); }
          50% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        @keyframes coin-drop {
          0% { transform: translate(-50%, -30px) scale(1); opacity: 1; }
          60% { transform: translate(-50%, 60px) scale(0.9); opacity: 1; }
          80% { transform: translate(-50%, 55px) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-50%, 60px) scale(0); opacity: 0; }
        }
        @keyframes fill-rise {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        :global(.savings-jar-wave) {
          animation: wave-drift 3s ease-in-out infinite;
        }
        :global(.savings-jar-wave-2) {
          animation: wave-drift-2 2.5s ease-in-out infinite;
        }
        :global(.savings-coin-drop) {
          animation: coin-drop 0.6s ease-in forwards;
        }
        :global(.savings-jar-fill) {
          transform-origin: bottom;
          animation: fill-rise 1s ease-out;
        }
      `}</style>
    </div>
  );
}
