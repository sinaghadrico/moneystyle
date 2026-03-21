"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, Camera, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Expense",
    icon: Minus,
    href: "/transactions?action=add&type=expense",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    label: "Income",
    icon: Plus,
    href: "/transactions?action=add&type=income",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    label: "Scan",
    icon: Camera,
    href: "/transactions?action=add&scan=true",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "Report",
    icon: FileBarChart,
    href: "/profile/cashflow",
    color: "bg-purple-500 hover:bg-purple-600",
  },
] as const;

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="default"
          size="sm"
          className={`${action.color} text-white gap-1.5 px-2 text-xs`}
          onClick={() => router.push(action.href)}
        >
          <action.icon className="h-3.5 w-3.5 shrink-0" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
