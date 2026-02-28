/**
 * Import transactions from Sina Mashreq Telegram export into the database.
 *
 * Usage: npx tsx scripts/import-sina-mashreq.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const EXPORT_DIR =
  "/Users/sinaghadri/Downloads/Telegram Desktop/sina-mashreq/ChatExport_2026-02-28";
const HTML_PATH = path.join(EXPORT_DIR, "messages.html");
const MEDIA_DEST = path.join(
  process.cwd(),
  "public/media-sina"
);

// --- Persian/Arabic numeral conversion ---
const PERSIAN_DIGITS: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

function persianToWestern(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS[d] ?? d);
}

function parseAmount(s: string): number | null {
  const western = persianToWestern(s).replace(/,/g, "");
  const num = parseFloat(western);
  return isNaN(num) ? null : num;
}

// --- Date parsing ---
const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", Jun: "06", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

function parseTextDate(text: string): { date: string; time: string } | null {
  // Pattern: "27th March 2025\n10:42 PM" or "20th March\n11:06 AM"
  // Also handles: "11th April\n08:48 AM", "2nd November\n07:57 AM"
  const datePatterns = [
    // With year: "27th March 2025"
    /(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|Jun|June|July|August|September|October|November|December)\s+(\d{4})/,
    // Without year: "27th March"
    /(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|Jun|June|July|August|September|October|November|December)(?!\s+\d{4})/,
    // "3rd December"
    /(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|Jun|June|July|August|September|October|November|December)/,
  ];

  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;

  let day: string | null = null;
  let month: string | null = null;
  let year: string | null = null;

  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) {
      day = m[1].padStart(2, "0");
      month = MONTH_MAP[m[2]];
      year = m[3] || null;
      break;
    }
  }

  if (!day || !month) return null;

  // Try to extract time
  let time = "12:00";
  const tm = text.match(timePattern);
  if (tm) {
    let h = parseInt(tm[1]);
    const min = tm[2];
    const ampm = tm[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    time = `${h.toString().padStart(2, "0")}:${min}`;
  }

  // If no year provided, infer from context (message timestamp will be used)
  if (!year) year = "2025"; // placeholder, will be overridden

  return { date: `${year}-${month}-${day}`, time };
}

// Parse timestamp from HTML: "13.04.2025 12:54:48 UTC+04:00"
function parseMsgTimestamp(title: string): { date: string; time: string } {
  const m = title.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return { date: "2025-01-01", time: "00:00" };
  return {
    date: `${m[3]}-${m[2]}-${m[1]}`,
    time: `${m[4]}:${m[5]}`,
  };
}

// --- Transaction type detection ---
function detectType(text: string): "income" | "expense" | "transfer" {
  const lower = text.toLowerCase();
  // Transfer patterns
  if (
    lower.includes("کارت به کارت") ||
    lower.includes("card to card")
  ) {
    return "transfer";
  }
  // Income patterns
  if (
    lower.includes("واریز شده") ||
    lower.includes("واریز به حساب") ||
    lower.includes("به حساب سینا واریز") ||
    lower.includes("به حساب واریز") ||
    lower.includes("سود")
  ) {
    return "income";
  }
  // Everything else is expense
  return "expense";
}

// --- Amount extraction from text ---
function extractAmount(text: string): number | null {
  const cleaned = text.replace(/<br\s*\/?>/g, "\n");

  // Pattern 1: "X درهم" with Persian or Western numerals
  // Matches: "۱۰۰ درهم", "1892.05 درهم", "۵.۲۵ درهم", "۲,۳۰۰ درهم"
  const amountPatterns = [
    // "مبلغ ۹۰۰۰ درهم"
    /مبلغ\s+([۰-۹0-9,\.]+)\s*درهم/,
    // "X درهم" at start or after space
    /([۰-۹0-9][۰-۹0-9,\.]*)\s*درهم/,
    // "X AED"
    /([۰-۹0-9][۰-۹0-9,\.]*)\s*AED/i,
    // "X دلار" (dollars, need conversion context but store as-is)
    /([۰-۹0-9][۰-۹0-9,\.]*)\s*دلار/,
  ];

  for (const pat of amountPatterns) {
    const m = cleaned.match(pat);
    if (m) {
      return parseAmount(m[1]);
    }
  }

  return null;
}

// --- Extract currency ---
function extractCurrency(text: string): string {
  if (/دلار/.test(text) || /USD/i.test(text)) return "USD";
  return "AED";
}

// --- Message interface ---
interface RawMessage {
  id: string;
  timestamp: string; // from title attr
  text: string;
  photos: string[];
  files: string[];
  isForwarded: boolean;
  forwardedFrom: string | null;
  isReplyTo: string | null; // message ID it replies to
}

interface ParsedTransaction {
  id: string;
  date: string;
  time: string;
  amount: number | null;
  currency: string;
  type: "income" | "expense" | "transfer";
  description: string;
  merchant: string | null;
  source: string | null;
  hasReceipt: boolean;
  mediaFiles: string[];
}

// --- HTML Parser ---
function parseHTML(html: string): RawMessage[] {
  const messages: RawMessage[] = [];

  // Find all message div start positions using indexOf
  const startPattern = '<div class="message default';
  const positions: { pos: number; id: string }[] = [];

  let searchFrom = 0;
  while (true) {
    const idx = html.indexOf(startPattern, searchFrom);
    if (idx === -1) break;

    // Extract id
    const idMatch = html.slice(idx, idx + 200).match(/id="(message\d+)"/);
    if (idMatch) {
      positions.push({ pos: idx, id: idMatch[1] });
    }
    searchFrom = idx + 1;
  }

  // Also find service message positions (date separators) and end of history
  const endPattern = '</div>\n\n   </div>';
  const historyEnd = html.lastIndexOf(endPattern);

  // Extract content for each message
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].pos;
    const end = i + 1 < positions.length
      ? positions[i + 1].pos
      : (historyEnd !== -1 ? historyEnd : html.length);

    // Also check for service messages between this and next
    const nextService = html.indexOf('<div class="message service"', start + 1);
    const blockEnd = (nextService !== -1 && nextService < end) ? nextService : end;

    const block = html.slice(start, blockEnd);
    const id = positions[i].id;

    // Extract timestamp
    const tsMatch = block.match(
      /class="pull_right date details" title="([^"]+)"/
    );
    const timestamp = tsMatch ? tsMatch[1] : "";

    // Extract ALL text divs (there may be multiple - one in forwarded body, one in main)
    // We want the LAST text div that's not inside forwarded body, OR if message only has forwarded text
    const textDivs: string[] = [];
    const textRegex = /<div class="text">\s*([\s\S]*?)\s*<\/div>/g;
    let tm;
    while ((tm = textRegex.exec(block)) !== null) {
      textDivs.push(tm[1].trim());
    }

    // If there's a forwarded body, the first text div might be forwarded text
    // The main message text is usually the last one
    let text = "";
    if (textDivs.length > 0) {
      // For forwarded messages with reply context, prefer the non-forwarded text
      // The forwarded text is inside <div class="forwarded body">
      const fwdBodyIdx = block.indexOf('class="forwarded body"');
      if (fwdBodyIdx !== -1 && textDivs.length > 1) {
        // Last text div is the main message text
        text = textDivs[textDivs.length - 1];
      } else if (fwdBodyIdx !== -1 && textDivs.length === 1) {
        // Only forwarded text
        text = textDivs[0];
      } else {
        // No forwarded body, take all text
        text = textDivs.join("\n");
      }
    }

    // Clean HTML entities and tags
    text = text
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&laquo;/g, "\u00ab")
      .replace(/&raquo;/g, "\u00bb")
      .trim();

    // Extract photos (non-thumb)
    const photos: string[] = [];
    const photoRegex = /href="(photos\/[^"]+)"/g;
    let pm;
    while ((pm = photoRegex.exec(block)) !== null) {
      if (!pm[1].includes("_thumb")) {
        photos.push(pm[1]);
      }
    }

    // Extract files
    const files: string[] = [];
    const fileRegex = /href="(files\/[^"]+)"/g;
    let fm;
    while ((fm = fileRegex.exec(block)) !== null) {
      files.push(fm[1]);
    }

    // Check if forwarded
    const isForwarded = block.includes('class="forwarded body"');
    const fwdMatch = block.match(
      /<div class="forwarded body">[\s\S]*?<div class="from_name">\s*([^<]+)/
    );
    const forwardedFrom = fwdMatch ? fwdMatch[1].trim() : null;

    // Check if reply
    const replyMatch = block.match(/GoToMessage\((\d+)\)/);
    const isReplyTo = replyMatch ? `message${replyMatch[1]}` : null;

    messages.push({
      id,
      timestamp,
      text,
      photos,
      files,
      isForwarded,
      forwardedFrom,
      isReplyTo,
    });
  }

  return messages;
}

// --- Merchant detection ---
function detectMerchant(text: string): string | null {
  const merchants: Record<string, string[]> = {
    Geant: ["geant", "ژیان"],
    Spinneys: ["spinneys", "اسپینی"],
    Carrefour: ["carrefour", "کارفور"],
    "Day To Day": ["day to day", "دی تو دی"],
    "Food Bazaar": ["food bazaar"],
    "McDonald's": ["مکدونالد", "mcdonalds"],
    MMI: ["mmi"],
    Tamara: ["تامارا", "tamara"],
    Tabby: ["tabby", "تبی"],
    "Mashreq ATM": ["واریز به حساب از طریق دستگاه atm", "واریز به حساب از دستگاه atm"],
    OpenAI: ["openai"],
    "Express VPN": ["express vpn"],
    DU: ["du ", "اینترنت du", "اینترنت خط", "شارژ du"],
    Eataly: ["eataly"],
    Moov: ["moov"],
    Cursor: ["cursor"],
    Amazon: ["آمازون", "amazon"],
    Zed: ["zed"],
  };

  const lower = text.toLowerCase();
  for (const [name, patterns] of Object.entries(merchants)) {
    for (const p of patterns) {
      if (lower.includes(p.toLowerCase())) {
        return name;
      }
    }
  }

  // Check for specific merchant names in text
  if (/سوپرمارکت پایین/.test(text)) return "سوپرمارکت محل";
  if (/سوپرمارکت لیمو/.test(text)) return "سوپرمارکت لیمو";
  if (/choithram/i.test(text)) return "Choithram";
  if (/سیرمونی/.test(text)) return "Sirmoni";
  if (/خودمونی/.test(text)) return "Khodemoni";
  if (/butterfly garden|باترفلای/.test(text)) return "Butterfly Garden";
  if (/the view of the palm/i.test(text)) return "The View of The Palm";
  if (/سید کاظم/.test(text)) return "Seyed Kazem";
  if (/gitex/i.test(text)) return "Gitex";
  if (/Token 2049/i.test(text)) return "Token 2049";

  return null;
}

// --- Process messages into transactions ---
function processMessages(messages: RawMessage[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const msgMap = new Map(messages.map((m) => [m.id, m]));

  for (const msg of messages) {
    // Skip messages that are just "فایل عکس بالایی" (HEIC file of photo above)
    if (msg.text.includes("فایل عکس بالایی")) continue;

    // Skip empty text + no media messages
    if (!msg.text && msg.photos.length === 0 && msg.files.length === 0) continue;

    // Skip separator messages (just "--------")
    if (msg.text === "--------") continue;

    // Skip forwarded messages that are just bank transfer PDFs without context
    // These typically get context from a reply message
    if (msg.isForwarded && !msg.text && msg.files.length > 0) {
      // This is just a forwarded PDF, context comes from reply
      // We'll still create a transaction from the reply message
      continue;
    }

    // Parse message timestamp for fallback date/time
    const msgTs = parseMsgTimestamp(msg.timestamp);

    // Try to extract date from text (many messages contain inline dates)
    const textDateInfo = msg.text ? parseTextDate(msg.text) : null;

    let txDate = msgTs.date;
    let txTime = msgTs.time;

    if (textDateInfo) {
      // Use the date from text (actual transaction date)
      let textYear = textDateInfo.date.slice(0, 4);
      // If year is the placeholder "2025", infer from message timestamp
      if (
        textDateInfo.date.startsWith("2025-") &&
        !msg.text.match(/\b2025\b/)
      ) {
        // Try to infer: if message was sent in 2026, and text says January,
        // it's probably 2026. If message is in 2025 and text says March, it's 2025.
        const msgYear = parseInt(msgTs.date.slice(0, 4));
        const msgMonth = parseInt(msgTs.date.slice(5, 7));
        const textMonth = parseInt(textDateInfo.date.slice(5, 7));

        if (msgYear === 2026) {
          // Messages posted in 2026 about dates without year
          // If text month > msg month, it was probably the previous year
          if (textMonth > msgMonth + 2) {
            textYear = "2025";
          } else {
            textYear = "2026";
          }
        } else {
          textYear = String(msgYear);
          // If text month is much larger than msg month, could be previous year
          if (textMonth > msgMonth + 2) {
            textYear = String(msgYear - 1);
          }
        }
      }
      txDate = `${textYear}-${textDateInfo.date.slice(5)}`;
      txTime = textDateInfo.time;
    }

    // For forwarded messages with text (e.g., "کارت به کارت سینا به فرنوش - ۵۰۰۰ درهم")
    const fullText = msg.text;

    // Detect transaction type
    const type = detectType(fullText);

    // Extract amount
    let amount = extractAmount(fullText);

    // Extract currency
    const currency = extractCurrency(fullText);

    // Detect merchant
    const merchant = detectMerchant(fullText);

    // Determine source type
    let source: string | null = null;
    if (msg.photos.length > 0) source = "image";
    else if (msg.files.length > 0) source = "file";

    // Collect media files
    const mediaFiles = [...msg.photos, ...msg.files];

    // If this is a reply providing context to a forwarded message
    if (msg.isReplyTo) {
      const replyTarget = msgMap.get(msg.isReplyTo);
      if (replyTarget) {
        // Add the forwarded message's media files
        mediaFiles.push(...replyTarget.photos, ...replyTarget.files);
        if (!source && (replyTarget.photos.length > 0 || replyTarget.files.length > 0)) {
          source = replyTarget.photos.length > 0 ? "image" : "file";
        }
      }
    }

    const hasReceipt = mediaFiles.length > 0;

    // Clean description - remove the date/time part
    let description = fullText
      .replace(
        /\n?\d{1,2}(?:st|nd|rd|th)\s+(?:January|February|March|April|May|Jun|June|July|August|September|October|November|December)(?:\s+\d{4})?\s*\n?\d{1,2}:\d{2}\s*(?:AM|PM)/gi,
        ""
      )
      .trim();

    transactions.push({
      id: msg.id,
      date: txDate,
      time: txTime,
      amount,
      currency,
      type,
      description,
      merchant,
      source,
      hasReceipt,
      mediaFiles,
    });
  }

  return transactions;
}

// --- Copy media files ---
function copyMediaFiles(transactions: ParsedTransaction[]) {
  // Create destination directories
  const photosDir = path.join(MEDIA_DEST, "photos");
  const filesDir = path.join(MEDIA_DEST, "files");
  fs.mkdirSync(photosDir, { recursive: true });
  fs.mkdirSync(filesDir, { recursive: true });

  let copied = 0;
  for (const tx of transactions) {
    for (const file of tx.mediaFiles) {
      const src = path.join(EXPORT_DIR, file);
      const dest = path.join(MEDIA_DEST, file);

      // Also copy thumbnail if exists
      const thumbSrc = src.replace(/(\.\w+)$/, "_thumb$1");
      const thumbSrcJpg = src + "_thumb.jpg";

      if (fs.existsSync(src)) {
        const destDir = path.dirname(dest);
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, dest);
        copied++;

        // Try to copy thumbnail
        if (fs.existsSync(thumbSrcJpg)) {
          fs.copyFileSync(thumbSrcJpg, dest + "_thumb.jpg");
        } else if (fs.existsSync(thumbSrc)) {
          fs.copyFileSync(thumbSrc, path.join(destDir, path.basename(thumbSrc)));
        }
      }
    }
  }
  console.log(`Copied ${copied} media files to ${MEDIA_DEST}`);
}

// --- Main import ---
async function main() {
  console.log("Reading HTML export...");
  const html = fs.readFileSync(HTML_PATH, "utf-8");

  console.log("Parsing messages...");
  const messages = parseHTML(html);
  console.log(`Found ${messages.length} messages`);

  console.log("Processing transactions...");
  const transactions = processMessages(messages);
  console.log(`Extracted ${transactions.length} transactions`);

  // Print summary
  const withAmount = transactions.filter((t) => t.amount !== null).length;
  const income = transactions.filter((t) => t.type === "income");
  const expense = transactions.filter((t) => t.type === "expense");
  const transfer = transactions.filter((t) => t.type === "transfer");
  console.log(`  - With amount: ${withAmount}`);
  console.log(`  - Without amount: ${transactions.length - withAmount}`);
  console.log(`  - Income: ${income.length}`);
  console.log(`  - Expense: ${expense.length}`);
  console.log(`  - Transfer: ${transfer.length}`);

  // Print first 10 for verification
  console.log("\nFirst 10 transactions:");
  for (const tx of transactions.slice(0, 10)) {
    console.log(
      `  ${tx.id}: ${tx.date} ${tx.time} | ${tx.type} | ${tx.amount ?? "?"} ${tx.currency} | ${tx.merchant ?? "-"} | ${tx.description.slice(0, 60)}`
    );
  }

  // Copy media files
  console.log("\nCopying media files...");
  copyMediaFiles(transactions);

  // Create/find Sina Mashreq account
  console.log("\nCreating/finding Sina Mashreq account...");
  const account = await prisma.account.upsert({
    where: { name: "Sina Mashreq" },
    update: {},
    create: {
      name: "Sina Mashreq",
      bank: "Mashreq",
      color: "#10b981",
    },
  });
  console.log(`Account ID: ${account.id}`);

  // Look up categories
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  // Insert transactions
  console.log(`\nInserting ${transactions.length} transactions...`);
  let inserted = 0;

  for (const tx of transactions) {
    // Try to match a category based on merchant/description
    let categoryId: string | null = null;
    const desc = (tx.description + " " + (tx.merchant ?? "")).toLowerCase();

    if (tx.type === "income") {
      if (desc.includes("واریز") || desc.includes("atm") || desc.includes("deposit")) {
        categoryId = catMap.get("deposit") ?? null;
      }
    } else if (tx.type === "transfer") {
      categoryId = catMap.get("transfer") ?? null;
    } else {
      // Expense category detection
      if (desc.includes("سوپرمارکت") || desc.includes("geant") || desc.includes("spinneys") ||
          desc.includes("carrefour") || desc.includes("choithram") || desc.includes("day to day") ||
          desc.includes("نون") || desc.includes("تخم مرغ") || desc.includes("میوه") ||
          desc.includes("ریواس") || desc.includes("آب")) {
        categoryId = catMap.get("groceries") ?? null;
      } else if (desc.includes("غذا") || desc.includes("رستوران") || desc.includes("بستنی") ||
                 desc.includes("food") || desc.includes("کباب") || desc.includes("نوشیدنی") ||
                 desc.includes("آبجو") || desc.includes("mcdonald") || desc.includes("eataly") ||
                 desc.includes("sirmoni") || desc.includes("khodemoni")) {
        categoryId = catMap.get("food") ?? null;
      } else if (desc.includes("تاکسی") || desc.includes("uber") || desc.includes("zed") ||
                 desc.includes("بلیت هواپیما") || desc.includes("پارکینگ")) {
        categoryId = catMap.get("transport") ?? null;
      } else if (desc.includes("اینترنت") || desc.includes("du ") || desc.includes("شارژ")) {
        categoryId = catMap.get("utilities") ?? null;
      } else if (desc.includes("عینک") || desc.includes("موها") || desc.includes("لوازم")) {
        categoryId = catMap.get("clothing") ?? null;
      } else if (desc.includes("openai") || desc.includes("vpn") || desc.includes("cursor") ||
                 desc.includes("بازی") || desc.includes("ps")) {
        categoryId = catMap.get("subscription") ?? null;
      } else if (desc.includes("کلاس رانندگی") || desc.includes("رانندگی")) {
        categoryId = catMap.get("education") ?? null;
      } else if (desc.includes("اجاره ماشین") || desc.includes("خونه")) {
        categoryId = catMap.get("housing") ?? null;
      } else if (desc.includes("token 2049") || desc.includes("gitex") || desc.includes("باترفلای") ||
                 desc.includes("butterfly") || desc.includes("the view")) {
        categoryId = catMap.get("entertainment") ?? null;
      } else if (desc.includes("رزومه") || desc.includes("شرکت") || desc.includes("moov")) {
        categoryId = catMap.get("other") ?? null;
      } else if (desc.includes("tabby") || desc.includes("تامارا") || desc.includes("tamara")) {
        categoryId = catMap.get("other") ?? null;
      } else if (desc.includes("گل ")) {
        categoryId = catMap.get("other") ?? null;
      }
    }

    // Prefix media paths with media-sina/ for the app
    const mediaFiles = tx.mediaFiles.map((f) => `media-sina/${f}`);

    try {
      await prisma.transaction.create({
        data: {
          date: new Date(tx.date),
          time: tx.time,
          amount: tx.amount,
          currency: tx.currency,
          type: tx.type,
          categoryId,
          accountId: account.id,
          merchant: tx.merchant,
          description: tx.description,
          source: tx.source,
          hasReceipt: tx.hasReceipt,
          mediaFiles,
        },
      });
      inserted++;
    } catch (err) {
      console.error(`Failed to insert ${tx.id}:`, err);
    }
  }

  console.log(`\nInserted ${inserted}/${transactions.length} transactions`);

  // Final count
  const totalCount = await prisma.transaction.count({
    where: { accountId: account.id },
  });
  console.log(`Total Sina Mashreq transactions in DB: ${totalCount}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
