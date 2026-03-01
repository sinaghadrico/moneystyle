"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { getTags, createTag } from "@/actions/tags";
import type { TagData } from "@/lib/types";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tagIds: string[]) => void;
}) {
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getTags().then((tags) =>
      setAllTags(tags.map((t) => ({ id: t.id, name: t.name, color: t.color })))
    );
  }, []);

  const selectedTags = allTags.filter((t) => value.includes(t.id));
  const filtered = allTags.filter(
    (t) =>
      !value.includes(t.id) &&
      t.name.toLowerCase().includes(input.toLowerCase())
  );
  const canCreate =
    input.trim() &&
    !allTags.some((t) => t.name.toLowerCase() === input.trim().toLowerCase());

  const addTag = (tagId: string) => {
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const handleCreate = async () => {
    const name = input.trim();
    if (!name) return;
    const result = await createTag({ name });
    if ("error" in result) return;
    setAllTags((prev) => [
      ...prev,
      { id: result.id, name: result.name, color: result.color },
    ]);
    addTag(result.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        addTag(filtered[0].id);
      } else if (canCreate) {
        handleCreate();
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="gap-1 text-xs"
            style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
          >
            {tag.name}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag.id)}
            />
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          placeholder="Add tag..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm"
        />
        {showSuggestions && (filtered.length > 0 || canCreate) && (
          <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {filtered.map((tag) => (
              <div
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(tag.id);
                }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </div>
            ))}
            {canCreate && (
              <div
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                + Create &quot;{input.trim()}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
