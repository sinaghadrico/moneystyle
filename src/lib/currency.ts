/** Convert an amount from one currency to another using USD as the intermediate. */
export function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: Map<string, number>
): number {
  if (fromCode === toCode) return amount;
  const fromRate = rates.get(fromCode) ?? 1;
  const toRate = rates.get(toCode) ?? 1;
  // amount in fromCode -> USD -> toCode
  return (amount * fromRate) / toRate;
}
