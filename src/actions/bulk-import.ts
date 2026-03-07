"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import OpenAI from "openai";
import type { ParsedTransaction, ParsedReceipt, AIParseResult } from "@/lib/bulk-import-types";
import { revalidatePath } from "next/cache";
import { basicNormalize } from "@/lib/item-normalization";
// @ts-expect-error no type declarations
import heicConvert from "heic-convert";

// AI mode: parse file — auto-detects single receipt vs list of transactions
export async function parseWithAI(
  fileContent: string,
  fileType: string,
): Promise<{ result: AIParseResult } | { error: string }> {
  const userId = await requireAuth();
  const settings = await prisma.appSettings.findUnique({ where: { userId } });

  if (!settings?.aiEnabled) {
    return { error: "AI is not enabled. Enable it in Settings." };
  }

  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OpenAI API key is not configured." };
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are a financial document parser. Analyze the input and determine what it contains:

CASE 1 — Single receipt/invoice (one purchase with line items):
Return: {"type":"receipt","merchant":"Store Name","date":"YYYY-MM-DD","total":123.45,"items":[{"name":"Item","quantity":1,"unitPrice":10.00,"totalPrice":10.00}]}

CASE 2 — Multiple transactions (bank statement, transaction list, expense list):
Return: {"type":"transactions","transactions":[{"date":"YYYY-MM-DD","amount":45.50,"description":"Merchant Name","type":"expense","category":"Food"}]}

Rules:
- Dates in ISO YYYY-MM-DD format
- Amounts as positive numbers
- For receipts: do NOT include tax, subtotals, totals, or discounts as items
- For transactions: type is "income" or "expense", category is best guess (Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other)
- Return ONLY the JSON object, no other text`;

  try {
    const textFormats = new Set(["csv", "tsv", "txt", "json"]);
    const imageFormats = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
    const heicFormats = new Set(["heic", "heif"]);

    // Convert HEIC/HEIF to JPEG
    let actualContent = fileContent;
    let actualType = fileType;
    if (heicFormats.has(fileType)) {
      const inputBuf = Buffer.from(fileContent, "base64");
      const outputBuf = await heicConvert({
        buffer: new Uint8Array(inputBuf),
        format: "JPEG",
        quality: 0.9,
      });
      actualContent = Buffer.from(outputBuf).toString("base64");
      actualType = "jpeg";
    }

    const isPdf = actualType === "pdf";
    const isText = textFormats.has(actualType);
    const isImage = imageFormats.has(actualType);

    let rawContent: string | undefined;

    if (isText) {
      const textContent = Buffer.from(actualContent, "base64").toString("utf-8");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this financial document:\n\n${textContent}` },
        ],
      });
      rawContent = response.choices[0]?.message?.content?.trim();
    } else if (isPdf) {
      const dataUrl = `data:application/pdf;base64,${actualContent}`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 4096,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: "Parse this financial document." },
                { type: "file", file: { filename: "document.pdf", file_data: dataUrl } },
              ],
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error?.message || "AI request failed" };
      rawContent = json.choices?.[0]?.message?.content?.trim();
    } else {
      const mime = isImage ? `image/${actualType === "jpg" ? "jpeg" : actualType}` : "image/jpeg";
      const dataUrl = `data:${mime};base64,${actualContent}`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Parse this financial document." },
              { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            ],
          },
        ],
      });
      rawContent = response.choices[0]?.message?.content?.trim();
    }

    if (!rawContent) return { error: "No response from AI" };

    const jsonStr = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr);

    // Detect which type AI returned
    if (parsed.type === "transactions" && Array.isArray(parsed.transactions) && parsed.transactions.length > 0) {
      const transactions: ParsedTransaction[] = parsed.transactions.map(
        (tx: Record<string, unknown>, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          date: String(tx.date || new Date().toISOString().slice(0, 10)),
          amount: Math.abs(Number(tx.amount) || 0),
          description: String(tx.description || "Unknown"),
          type: tx.type === "income" ? "income" as const : "expense" as const,
          category: tx.category ? String(tx.category) : undefined,
        }),
      );
      return { result: { kind: "transactions", transactions } };
    }

    // Default: treat as receipt
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (items.length === 0 && (!parsed.transactions || parsed.transactions.length === 0)) {
      return { error: "No items or transactions found in the file." };
    }

    const receipt: ParsedReceipt = {
      merchant: String(parsed.merchant || "Unknown"),
      date: String(parsed.date || new Date().toISOString().slice(0, 10)),
      total: Math.abs(Number(parsed.total) || items.reduce((s: number, i: { totalPrice?: number }) => s + Math.abs(Number(i.totalPrice) || 0), 0)),
      items: items.map((item: Record<string, unknown>, i: number) => ({
        id: `item-${Date.now()}-${i}`,
        name: String(item.name || "Unknown"),
        quantity: Number(item.quantity) || 1,
        unitPrice: item.unitPrice != null ? Math.round(Number(item.unitPrice) * 100) / 100 : null,
        totalPrice: Math.round(Math.abs(Number(item.totalPrice) || 0) * 100) / 100,
      })),
    };

    return { result: { kind: "receipt", receipt } };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { error: "AI returned invalid data. Please try again." };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: `AI parsing failed: ${msg}` };
  }
}

// Create a single transaction from receipt with line items
export async function createTransactionFromReceipt(
  receipt: ParsedReceipt,
  accountId: string,
  currency: string,
  categoryId: string | null,
  storedFilePath?: string,
  confirmed: boolean = false,
): Promise<{ success: true } | { error: string }> {
  const userId = await requireAuth();

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    return { error: "Invalid account." };
  }

  const tx = await prisma.transaction.create({
    data: {
      userId,
      date: new Date(receipt.date),
      amount: receipt.total,
      currency,
      type: "expense",
      categoryId,
      merchant: receipt.merchant,
      source: "import",
      accountId,
      confirmed,
    },
  });

  if (receipt.items.length > 0) {
    await prisma.transactionItem.createMany({
      data: receipt.items.map((item, idx) => ({
        transactionId: tx.id,
        name: item.name,
        normalizedName: basicNormalize(item.name),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sortOrder: idx,
      })),
    });
  }

  // Attach the already-uploaded file
  if (storedFilePath) {
    try {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { mediaFiles: { push: storedFilePath }, hasReceipt: true },
      });
    } catch {
      // File attachment failed but transaction was created
    }
  }

  revalidatePath("/transactions");
  return { success: true };
}

// CSV mode: parse multiple transactions
export async function parseTransactionsFromCSV(
  csvText: string,
): Promise<{ transactions: ParsedTransaction[] } | { error: string }> {
  await requireAuth();

  try {
    const cleaned = csvText.replace(/^\uFEFF/, "").trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = cleaned.split("\n");
    if (lines.length < 2) {
      return { error: "CSV file must have a header row and at least one data row." };
    }

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const dateIdx = header.indexOf("date");
    const amountIdx = header.indexOf("amount");
    const descIdx = header.findIndex((h) => h === "description" || h === "desc" || h === "merchant");
    const typeIdx = header.indexOf("type");
    const catIdx = header.findIndex((h) => h === "category" || h === "cat");

    if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
      return { error: "CSV must have date, amount, and description columns." };
    }

    const transactions: ParsedTransaction[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseCSVLine(line);
      const rawAmount = Number(cols[amountIdx]);
      if (isNaN(rawAmount)) continue;

      const isNegative = rawAmount < 0;
      let type: "income" | "expense" = isNegative ? "expense" : "income";
      if (typeIdx !== -1 && cols[typeIdx]) {
        const t = cols[typeIdx].toLowerCase().trim();
        if (t === "income" || t === "expense") type = t;
      }

      transactions.push({
        id: `csv-${Date.now()}-${i}`,
        date: cols[dateIdx]?.trim() || new Date().toISOString().slice(0, 10),
        amount: Math.abs(rawAmount),
        description: cols[descIdx]?.trim() || "Unknown",
        type,
        category: catIdx !== -1 ? cols[catIdx]?.trim() || undefined : undefined,
      });
    }

    if (transactions.length === 0) {
      return { error: "No valid transactions found in CSV." };
    }

    return { transactions };
  } catch {
    return { error: "Failed to parse CSV file." };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// CSV mode: bulk create multiple transactions
export async function bulkCreateTransactions(
  transactions: ParsedTransaction[],
  accountId: string,
  currency: string,
  confirmed: boolean = false,
): Promise<{ count: number } | { error: string }> {
  const userId = await requireAuth();

  if (!transactions.length) {
    return { error: "No transactions to import." };
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    return { error: "Invalid account." };
  }

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(
    categories.map((c) => [c.name.toLowerCase(), c.id]),
  );

  const data = transactions.map((tx) => ({
    userId,
    date: new Date(tx.date),
    amount: tx.amount,
    currency,
    type: tx.type,
    categoryId: tx.category ? categoryMap.get(tx.category.toLowerCase()) ?? null : null,
    merchant: tx.description,
    source: "import",
    accountId,
    confirmed,
  }));

  const result = await prisma.transaction.createMany({ data });

  revalidatePath("/transactions");
  return { count: result.count };
}
