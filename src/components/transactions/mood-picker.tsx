"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { setTransactionMood } from "@/actions/transactions";
import { toast } from "sonner";

const MOODS = [
  { value: "great", emoji: "\ud83d\ude04", label: "Great" },
  { value: "good", emoji: "\ud83d\ude42", label: "Good" },
  { value: "okay", emoji: "\ud83d\ude10", label: "Okay" },
  { value: "bad", emoji: "\ud83d\ude1f", label: "Bad" },
  { value: "terrible", emoji: "\ud83d\ude2b", label: "Terrible" },
] as const;

interface MoodPickerProps {
  transactionId: string;
  currentMood?: string;
  onMoodSet?: () => void;
}

export function MoodPicker({
  transactionId,
  currentMood,
  onMoodSet,
}: MoodPickerProps) {
  const [selected, setSelected] = useState<string | undefined>(currentMood);
  const [isPending, startTransition] = useTransition();

  function handleSelect(mood: string) {
    setSelected(mood);
    startTransition(async () => {
      const result = await setTransactionMood(transactionId, mood);
      if ("error" in result) {
        toast.error(result.error);
        setSelected(currentMood);
        return;
      }
      toast.success("Mood saved");
      onMoodSet?.();
    });
  }

  return (
    <div className="flex items-center gap-0.5">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(mood.value);
          }}
          title={mood.label}
          className={cn(
            " rounded-b md:rounded-md px-1 py-0.5 text-base transition-all hover:bg-muted",
            "disabled:opacity-50",
            selected === mood.value &&
              "ring-2 ring-emerald-500 bg-emerald-500/10",
          )}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}
