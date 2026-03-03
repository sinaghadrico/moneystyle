"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";

export type FeatureInfoContent = {
  title: string;
  description: string;
  sections: {
    heading: string;
    body: string;
  }[];
};

export function FeatureInfo({ content }: { content: FeatureInfoContent }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={`Info about ${content.title}`}
      >
        <Info className="h-3 w-3" />
      </button>

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{content.title}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {content.description}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4 text-sm">
            {content.sections.map((section) => (
              <div key={section.heading} className="space-y-1.5">
                <h4 className="font-semibold">{section.heading}</h4>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <ResponsiveDialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Got it
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
