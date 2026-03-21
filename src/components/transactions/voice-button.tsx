"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppSettings } from "@/components/settings/settings-provider";

export interface VoiceParsedData {
  amount?: number;
  type?: string;
  categoryId?: string;
  merchant?: string;
  description?: string;
}

interface VoiceButtonProps {
  onParsed: (data: VoiceParsedData) => void;
}

type VoiceState = "idle" | "recording" | "processing";

export function VoiceButton({ onParsed }: VoiceButtonProps) {
  const { settings } = useAppSettings();
  const [state, setState] = useState<VoiceState>("idle");
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startRecording = useCallback(async () => {
    if (!settings.hasOpenaiKey) {
      toast.error("OpenAI API key not set. Go to Settings → Integrations to add it.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setDuration(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        await processAudio(blob);
      };

      mediaRecorder.start();
      setState("recording");
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processAudio = async (blob: Blob) => {
    setState("processing");
    try {
      const formData = new FormData();
      const ext = blob.type.includes("webm") ? "webm" : "m4a";
      formData.append("audio", blob, `recording.${ext}`);

      const res = await fetch("/api/voice-transaction", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to process audio");
      }

      const data = await res.json();
      toast.info(`🎤 "${data.transcription}"`);

      onParsed({
        amount: data.amount || undefined,
        type: data.type || undefined,
        categoryId: data.categoryId || undefined,
        merchant: data.merchant || undefined,
        description: data.description || data.transcription,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process audio",
      );
    }
    setState("idle");
    setDuration(0);
    clearInterval(timerRef.current);
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (state === "processing") {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (state === "recording") {
    return (
      <Button
        variant="outline"
        onClick={stopRecording}
        className="gap-2 border-red-500/50 text-red-500 hover:text-red-600 hover:border-red-500"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
        {formatDuration(duration)}
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startRecording}
      title="Voice transaction"
      className={cn(
        "shrink-0 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50",
      )}
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
}
