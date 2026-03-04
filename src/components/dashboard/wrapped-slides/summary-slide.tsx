"use client";

import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AnimatedValue } from "./slide-layout";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = { data: WrappedData; isActive: boolean };

function shortAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1000) return `${amount < 0 ? "-" : ""}AED ${(abs / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function SummarySlide({ data, isActive }: Props) {
  const donutData = data.categoryBreakdown.slice(0, 6).map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  const stats = [
    { label: "Total Spent", value: shortAmount(data.totalSpent), color: "text-white" },
    {
      label: "Net Balance",
      value: shortAmount(data.netBalance),
      color: data.netBalance >= 0 ? "text-green-400" : "text-red-400",
    },
    { label: "Top Category", value: data.topCategory?.name ?? "N/A", color: "text-white" },
    { label: "Transactions", value: String(data.transactionCount), color: "text-white" },
  ];

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-slate-800 to-slate-900 text-white flex h-full w-full shrink-0 flex-col items-center justify-center px-5 py-8 transition-opacity duration-500",
        isActive ? "opacity-100" : "opacity-0",
      )}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-5 text-xl font-bold">{data.monthLabel} Wrapped</p>
      </AnimatedValue>

      <div className="grid w-full grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <AnimatedValue key={s.label} delay={200 + i * 100} isActive={isActive}>
            <div className="bg-white/10 rounded-xl px-3 py-3 text-center">
              <p className="text-white/60 text-xs">{s.label}</p>
              <p className={cn("text-base font-bold truncate", s.color)}>
                {s.value}
              </p>
            </div>
          </AnimatedValue>
        ))}
      </div>

      {donutData.length > 0 && (
        <AnimatedValue delay={700} isActive={isActive}>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-28 w-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={28}
                    outerRadius={50}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5">
              {donutData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-white/70">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedValue>
      )}
    </div>
  );
}
