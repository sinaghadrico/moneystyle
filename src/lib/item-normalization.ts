/**
 * Item name normalization utilities for price analysis.
 * Zero external dependencies — pure regex-based.
 */

/** Lowercase + trim + collapse whitespace */
export function basicNormalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Fuzzy normalize: basicNormalize + strip units, packaging, and parentheticals.
 *
 * Examples:
 *   "Milk 1L"            → "milk"
 *   "Coca Cola (330ml)"  → "coca cola"
 *   "Chicken Breast - 500g" → "chicken breast"
 *   "Water x2"           → "water"
 *   "Rice 1kg"           → "rice"
 *   "Eggs Pack of 6"     → "eggs"
 */
export function fuzzyNormalize(name: string): string {
  let n = basicNormalize(name);

  // Remove parenthetical content: (330ml), (large), (6-pack)
  n = n.replace(/\([^)]*\)/g, "");

  // Remove unit patterns: 500ml, 1L, 1.5l, 250g, 1kg, 2 liter, 500 ml, etc.
  n = n.replace(
    /\b\d+([.,]\d+)?\s*(ml|l|liter|litre|cl|dl|g|gr|gram|kg|kilogram|oz|lb|lbs|fl\s*oz)\b/gi,
    "",
  );

  // Remove pack patterns: x2, x 3, pack of 6, 6-pack, 12 pack
  n = n.replace(/\bx\s*\d+\b/gi, "");
  n = n.replace(/\bpack\s*(of\s*)?\d+\b/gi, "");
  n = n.replace(/\b\d+[- ]?pack\b/gi, "");

  // Remove trailing dash/hyphen (with possible whitespace)
  n = n.replace(/\s*[-–—]\s*$/, "");
  // Remove leading dash/hyphen
  n = n.replace(/^\s*[-–—]\s*/, "");

  // Collapse whitespace again and trim
  n = n.replace(/\s+/g, " ").trim();

  return n;
}

/**
 * Resolve a raw item name to a canonical name.
 * Checks ItemGroup map first, then falls back to normalize.
 */
export function resolveItemName(
  rawName: string,
  groupMap: Map<string, string>,
  fuzzy: boolean,
): string {
  const basic = basicNormalize(rawName);

  // Check if this raw name is in an item group
  const groupCanonical = groupMap.get(basic);
  if (groupCanonical) return groupCanonical;

  return fuzzy ? fuzzyNormalize(rawName) : basic;
}
