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
  // MinIO paths contain "/" like "txId/uuid.jpg" -> route through API proxy

  // Legacy paths (e.g. Telegram bot files)
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

  // Reset when files prop changes
  if (files !== localFiles && files.length !== localFiles.length) {
    setLocalFiles(files);
    if (index >= files.length) setIndex(Math.max(0, files.length - 1));
  }

  if (localFiles.length === 0) return null;

  const current = localFiles[index];
  const url = toPublicUrl(current);
  const filename = current.split("/").pop() ?? current;

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

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center justify-between pr-6">
            <span className="truncate text-sm font-medium">{filename}</span>
            <div className="flex items-center gap-2 shrink-0">
              {localFiles.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {index + 1} / {localFiles.length}
                </span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <a href={url} download={filename} target="_blank">
                  <Download className="h-3.5 w-3.5" />
                </a>
              </Button>
              {transactionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          {localFiles.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-8 w-8"
              onClick={() =>
                setIndex((i) => (i - 1 + localFiles.length) % localFiles.length)
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

          {localFiles.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 h-8 w-8"
              onClick={() => setIndex((i) => (i + 1) % localFiles.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {localFiles.length > 1 && (
          <div className="flex justify-center gap-1 pt-2">
            {localFiles.map((f, i) => (
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
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
