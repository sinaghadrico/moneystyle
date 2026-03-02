"use server";

import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import OpenAI from "openai";
import { getPrompt, AI_PROMPT_KEYS } from "@/lib/ai-prompts";

export type ParsedItem = {
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
};

function isImage(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(path);
}

export async function parseReceiptFromUpload(
  transactionId: string,
): Promise<{ items: ParsedItem[] } | { error: string }> {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { mediaFiles: true },
  });
  if (!tx) return { error: "Transaction not found" };

  const images = (tx.mediaFiles ?? []).filter(isImage);
  if (images.length === 0) return { error: "No image files to extract from" };

  const latestImage = images[images.length - 1];

  try {
    const buffer = await storage.getBuffer(latestImage);
    const ext = latestImage.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      gif: "image/gif",
    };
    const mime = mimeMap[ext] || "image/jpeg";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    return parseReceiptImage(dataUrl);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `Failed to fetch image from storage: ${msg}` };
  }
}

export async function parseReceiptImage(
  imageUrl: string,
): Promise<{ items: ParsedItem[] } | { error: string }> {
  const settings = await prisma.appSettings.findFirst({
    where: { id: "default" },
  });

  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = await getPrompt(AI_PROMPT_KEYS.receiptParser);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all line items from this receipt image.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return { error: "No response from AI" };
    }

    // Strip markdown fences if present
    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

    const parsed = JSON.parse(jsonStr) as { items: ParsedItem[] };

    if (!Array.isArray(parsed.items)) {
      return { error: "AI returned an unexpected format" };
    }

    // Normalize items
    const items: ParsedItem[] = parsed.items
      .filter((item) => item.name && item.totalPrice > 0)
      .map((item) => ({
        name: String(item.name).trim(),
        quantity: Number(item.quantity) || 1,
        unitPrice:
          item.unitPrice != null ? Math.round(Number(item.unitPrice) * 100) / 100 : null,
        totalPrice: Math.round(Number(item.totalPrice) * 100) / 100,
      }));

    return { items };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid JSON. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI parsing failed: ${msg}` };
  }
}
