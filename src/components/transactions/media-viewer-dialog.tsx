"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { removeTransactionMedia } from "@/actions/transactions";
import { toast } from "sonner";

function toPublicUrl(path: string): string {
  if (path.includes("photos/") || path.includes("files/")) {
    return `/media/${path}`;
  }
  return `/api/media/${path}`;
}

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
}

export function MediaViewerDialog({
  files,
  transactionId,
  open,
  onOpenChange,
  onFileDeleted,
}: {
  files: string[];
  transactionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileDeleted?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [localFiles, setLocalFiles] = useState(files);

  if (files !== localFiles && files.length !== localFiles.length) {
    setLocalFiles(files);
    if (index >= files.length) setIndex(Math.max(0, files.length - 1));
  }

  if (localFiles.length === 0) return null;

  const current = localFiles[index];
  const url = toPublicUrl(current);
  const filename = current.split("/").pop() ?? current;
  const multi = localFiles.length > 1;

  const handleDelete = async () => {
    if (!transactionId) return;
    setDeleting(true);
    const result = await removeTransactionMedia(transactionId, current);
    if ("error" in result) {
      toast.error(`❌ ${result.error}`);
    } else {
      toast.success("🗑️ File deleted");
      const newFiles = localFiles.filter((f) => f !== current);
      setLocalFiles(newFiles);
      if (newFiles.length === 0) {
        onOpenChange(false);
      } else {
        setIndex(Math.min(index, newFiles.length - 1));
      }
      onFileDeleted?.();
    }
    setDeleting(false);
  };

  const goPrev = () =>
    setIndex((i) => (i - 1 + localFiles.length) % localFiles.length);
  const goNext = () =>
    setIndex((i) => (i + 1) % localFiles.length);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-3xl flex flex-col p-0 sm:p-6 gap-0">
        {/* Header: filename + actions */}
        <ResponsiveDialogHeader className="px-4 pt-3 pb-2 sm:px-0 sm:pt-0">
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <span className="flex-1 min-w-0 truncate text-xs font-medium text-muted-foreground">
              {filename}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={url} download={filename} target="_blank">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              {transactionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {/* Image area — capped height, no scroll */}
        <div className="flex items-center justify-center px-2 sm:px-0">
          {isImage(current) ? (
            <Image
              src={url.replace("/media/media-sina/", "/media-sina/")}
              alt={filename}
              width={800}
              height={600}
              className="max-h-[50vh] w-full object-contain rounded-lg"
              unoptimized
            />
          ) : (
            <iframe
              src={url.replace("/media/media-sina/", "/media-sina/")}
              className="w-full h-[50vh] rounded-lg border"
              title={filename}
            />
          )}
        </div>

        {/* Navigation bar — always visible below image */}
        {multi && (
          <div className="flex items-center justify-center gap-4 py-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground active:scale-95 transition-transform"
              onClick={goPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              {localFiles.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-5 bg-foreground"
                      : "w-1.5 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground active:scale-95 transition-transform"
              onClick={goNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
