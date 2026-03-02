export interface SmsPatternRow {
  id: string;
  regex: string;
  type: string; // "income" | "expense" | "auto"
  priority: number;
  amountCaptureGroup: number;
  merchantCaptureGroup: number | null;
  enabled: boolean;
  creditKeywords: string | null;
}

export interface ParsedSMS {
  amount: number;
  type: "income" | "expense";
  merchant?: string;
  date?: Date;
  description?: string;
  cardEnding?: string;
  balance?: number;
}

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/**
 * Parse Mashreq bank SMS messages.
 *
 * Purchase format:
 *   "Thank you for using NEO VISA Debit Card Card ending 5707
 *    for AED 127.48 at TABBY FZ LLC on 01-MAR-2026 01:42 PM.
 *    Available Balance is AED 4,997.14"
 *
 * Deposit format:
 *   "AED 1000.00 has been deposited to your account no. XXXXXXXX8897."
 */
export function parseMashreqSMS(text: string): ParsedSMS | null {
  const cleaned = text.replace(/\s+/g, " ").trim();

  // --- Purchase / POS / Card transaction ---
  const purchaseMatch = cleaned.match(
    /for\s+AED\s+([\d,]+\.?\d*)\s+at\s+(.+?)\s+on\s+(\d{2})-([A-Z]{3})-(\d{4})\s+(\d{2}:\d{2}\s*[AP]M)/i,
  );
  if (purchaseMatch) {
    const amount = parseFloat(purchaseMatch[1].replace(/,/g, ""));
    const merchant = purchaseMatch[2].trim();
    const day = parseInt(purchaseMatch[3], 10);
    const monthStr = purchaseMatch[4].toUpperCase();
    const year = parseInt(purchaseMatch[5], 10);
    const month = MONTH_MAP[monthStr] ?? 0;
    const date = new Date(year, month, day);

    // Extract card ending
    const cardMatch = cleaned.match(/Card ending\s+(\d+)/i);
    const cardEnding = cardMatch?.[1];

    // Extract balance
    const balMatch = cleaned.match(/Available Balance is AED\s+([\d,]+\.?\d*)/i);
    const balance = balMatch ? parseFloat(balMatch[1].replace(/,/g, "")) : undefined;

    return {
      amount,
      type: "expense",
      merchant,
      date,
      cardEnding,
      balance,
      description: `Card *${cardEnding || "****"}`,
    };
  }

  // --- Deposit / Credit ---
  const depositMatch = cleaned.match(
    /AED\s+([\d,]+\.?\d*)\s+has been deposited/i,
  );
  if (depositMatch) {
    const amount = parseFloat(depositMatch[1].replace(/,/g, ""));

    // Extract account number
    const accMatch = cleaned.match(/account no\.\s*(\S+)/i);
    const accNum = accMatch?.[1];

    return {
      amount,
      type: "income",
      description: accNum ? `Deposit to ${accNum}` : "Deposit",
      date: new Date(),
    };
  }

  // --- Salary credit ---
  const salaryMatch = cleaned.match(
    /salary.*?AED\s+([\d,]+\.?\d*)/i,
  ) || cleaned.match(
    /AED\s+([\d,]+\.?\d*)\s+.*?(?:salary|credited)/i,
  );
  if (salaryMatch) {
    const amount = parseFloat(salaryMatch[1].replace(/,/g, ""));
    return {
      amount,
      type: "income",
      merchant: "Salary",
      description: "Salary credit",
      date: new Date(),
    };
  }

  // --- ATM Withdrawal ---
  const atmMatch = cleaned.match(
    /AED\s+([\d,]+\.?\d*)\s+.*?(?:withdrawn|ATM|cash)/i,
  );
  if (atmMatch) {
    const amount = parseFloat(atmMatch[1].replace(/,/g, ""));
    return {
      amount,
      type: "expense",
      merchant: "ATM Withdrawal",
      date: new Date(),
    };
  }

  // --- Generic: try to find any AED amount ---
  const genericMatch = cleaned.match(/AED\s+([\d,]+\.?\d*)/i);
  if (genericMatch) {
    const amount = parseFloat(genericMatch[1].replace(/,/g, ""));
    if (amount > 0) {
      const isCredit = /deposit|credit|receiv|salary|transfer.*?to your/i.test(cleaned);
      return {
        amount,
        type: isCredit ? "income" : "expense",
        description: cleaned.slice(0, 80),
        date: new Date(),
      };
    }
  }

  return null;
}

/**
 * Parse SMS using configurable DB patterns.
 * Falls back to hardcoded parseMashreqSMS if no patterns match.
 */
export function parseSMSWithPatterns(
  text: string,
  patterns: SmsPatternRow[],
): ParsedSMS | null {
  const cleaned = text.replace(/\s+/g, " ").trim();

  for (const pattern of patterns) {
    if (!pattern.enabled) continue;

    let re: RegExp;
    try {
      re = new RegExp(pattern.regex, "i");
    } catch {
      continue; // skip invalid regex
    }

    const match = cleaned.match(re);
    if (!match) continue;

    const amountStr = match[pattern.amountCaptureGroup];
    if (!amountStr) continue;

    const amount = parseFloat(amountStr.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) continue;

    // Determine type
    let type: "income" | "expense";
    if (pattern.type === "auto") {
      const keywords = (pattern.creditKeywords ?? "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const isCredit = keywords.some((kw) =>
        cleaned.toLowerCase().includes(kw.toLowerCase()),
      );
      type = isCredit ? "income" : "expense";
    } else {
      type = pattern.type as "income" | "expense";
    }

    // Extract merchant
    const merchant =
      pattern.merchantCaptureGroup && match[pattern.merchantCaptureGroup]
        ? match[pattern.merchantCaptureGroup].trim()
        : undefined;

    return {
      amount,
      type,
      merchant,
      description: cleaned.slice(0, 80),
      date: new Date(),
    };
  }

  // Fallback to hardcoded parser
  return parseMashreqSMS(text);
}
