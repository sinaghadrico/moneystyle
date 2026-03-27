"use client";

import { Input } from "@/components/ui/input";
import { PRESET_COLORS } from "@/lib/colors";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            className={`h-7 w-7 rounded-full border-2 transition-transform ${
              color === c
                ? "border-foreground scale-110"
                : "border-transparent"
            }`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            type="button"
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 cursor-pointer p-0.5"
        />
        <Input
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 font-mono text-sm"
          maxLength={7}
        />
      </div>
    </div>
  );
}
