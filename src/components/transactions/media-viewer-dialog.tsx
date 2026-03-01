"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

function toPublicUrl(path: string): string {
  // "photos/photo_1@..." -> "/media/photos/photo_1@..."
  // "files/Receipt_..." -> "/media/files/Receipt_..."
  return `/media/${path}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}

export function MediaViewerDialog({
  files,
  open,
  onOpenChange,
}: {
  files: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [index, setIndex] = useState(0);

  if (files.length === 0) return null;

  const current = files[index];
  const url = toPublicUrl(current);
  const filename = current.split("/").pop() ?? current;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span className="truncate text-sm font-medium">{filename}</span>
            <div className="flex items-center gap-2 shrink-0">
              {files.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {index + 1} / {files.length}
                </span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <a href={url} download={filename} target="_blank">
                  <Download className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          {files.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-8 w-8"
              onClick={() =>
                setIndex((i) => (i - 1 + files.length) % files.length)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {isImage(current) ? (
            <Image
              src={url.replace("/media/media-sina/", "/media-sina/")}
              alt={filename}
              width={800}
              height={600}
              className="max-h-[70vh] max-w-full object-contain rounded"
              unoptimized
            />
          ) : (
            <iframe
              src={url.replace("/media/media-sina/", "/media-sina/")}
              className="w-full h-[70vh] rounded border"
              title={filename}
            />
          )}

          {files.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 h-8 w-8"
              onClick={() => setIndex((i) => (i + 1) % files.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {files.length > 1 && (
          <div className="flex justify-center gap-1 pt-2">
            {files.map((f, i) => (
              <button
                key={f}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-4 bg-foreground"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
