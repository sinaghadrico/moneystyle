export type ParsedTransaction = {
  id: string;
  date: string;
  amount: number;
  description: string;
  category?: string;
  type: "income" | "expense";
};

export type ParsedReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
};

export type ParsedReceipt = {
  merchant: string;
  date: string;
  total: number;
  items: ParsedReceiptItem[];
};

export type AIParseResult =
  | { kind: "receipt"; receipt: ParsedReceipt }
  | { kind: "transactions"; transactions: ParsedTransaction[] };
