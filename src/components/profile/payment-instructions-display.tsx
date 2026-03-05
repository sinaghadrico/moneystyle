"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink, CreditCard } from "lucide-react";
import { toast } from "sonner";

function CopyableNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 font-mono text-xs text-foreground hover:bg-muted transition-colors"
      title="Copy"
    >
      {value}
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );
}

function renderInstructions(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const numberRegex = /(\b\d{4,}\b)/g;
  const combinedRegex = /(https?:\/\/[^\s]+|\b\d{4,}\b)/g;

  const parts = text.split(combinedRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 break-all"
        >
          {part}
          <ExternalLink className="h-3 w-3 shrink-0 inline" />
        </a>
      );
    }
    if (numberRegex.test(part)) {
      numberRegex.lastIndex = 0;
      return <CopyableNumber key={i} value={part} />;
    }
    return <span key={i}>{part}</span>;
  });
}

export function PaymentInstructionsDisplay({
  instructions,
}: {
  instructions: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        <CreditCard className="h-3.5 w-3.5 shrink-0" />
        How to pay
        {open ? (
          <ChevronUp className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0" />
        )}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap">
          {renderInstructions(instructions)}
        </div>
      )}
    </div>
  );
}
