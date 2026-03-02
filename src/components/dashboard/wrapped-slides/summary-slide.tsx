"use client";

import type { WrappedData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AnimatedValue } from "./slide-layout";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = { data: WrappedData; isActive: boolean };

export function SummarySlide({ data, isActive }: Props) {
  const donutData = data.categoryBreakdown.slice(0, 6).map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex min-h-[400px] w-full shrink-0 max-w-sm flex-col items-center justify-center rounded-lg border p-8 transition-opacity duration-500",
        isActive ? "opacity-100" : "opacity-0",
      )}
    >
      <AnimatedValue isActive={isActive}>
        <p className="mb-6 text-2xl font-bold">{data.monthLabel} Wrapped</p>
      </AnimatedValue>

      <div className="grid w-full max-w-lg grid-cols-2 gap-4">
        <AnimatedValue delay={200} isActive={isActive}>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Total Spent</p>
            <p className="text-xl font-bold">
              {formatCurrency(data.totalSpent)}
            </p>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={300} isActive={isActive}>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Net Balance</p>
            <p
              className={cn(
                "text-xl font-bold",
                data.netBalance >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrency(data.netBalance)}
            </p>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={400} isActive={isActive}>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Top Category</p>
            <p className="text-lg font-bold">
              {data.topCategory?.name ?? "N/A"}
            </p>
          </div>
        </AnimatedValue>

        <AnimatedValue delay={500} isActive={isActive}>
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Transactions</p>
            <p className="text-xl font-bold">{data.transactionCount}</p>
          </div>
        </AnimatedValue>
      </div>

      {donutData.length > 0 && (
        <AnimatedValue delay={700} isActive={isActive}>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={55}
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
            <div className="flex flex-col gap-1">
              {donutData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedValue>
      )}
    </div>
  );
}
