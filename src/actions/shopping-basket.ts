"use server";

import { prisma } from "@/lib/db";
import { basicNormalize, resolveItemName } from "@/lib/item-normalization";
import { shoppingListSchema, shoppingListItemSchema } from "@/lib/validators";
import type {
  ShoppingListData,
  ShoppingListDetail,
  BasketAnalysis,
  BasketMerchantResult,
  BasketItemResult,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function buildGroupMap(): Promise<Map<string, string>> {
  const groups = await prisma.itemGroup.findMany();
  const map = new Map<string, string>();
  for (const g of groups) {
    for (const raw of g.rawNames) {
      map.set(basicNormalize(raw), g.canonicalName);
    }
  }
  return map;
}

function getEffectivePrice(
  unitPrice: number | null,
  totalPrice: number,
  quantity: number,
): number {
  if (unitPrice != null && unitPrice > 0) return unitPrice;
  return quantity > 0 ? totalPrice / quantity : totalPrice;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getShoppingLists(): Promise<ShoppingListData[]> {
  const lists = await prisma.shoppingList.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    itemCount: l._count.items,
    createdAt: l.createdAt.toISOString(),
  }));
}

export async function getShoppingListDetail(
  id: string,
): Promise<ShoppingListDetail | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!list) return null;
  return {
    id: list.id,
    name: list.name,
    items: list.items.map((i) => ({
      id: i.id,
      itemName: i.itemName,
      normalizedName: i.normalizedName,
      quantity: i.quantity,
    })),
  };
}

export async function createShoppingList(
  name: string,
): Promise<{ id: string } | { error: string }> {
  const parsed = shoppingListSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const list = await prisma.shoppingList.create({
    data: { name: parsed.data.name },
  });
  revalidatePath("/price-analysis");
  return { id: list.id };
}

export async function deleteShoppingList(
  id: string,
): Promise<{ success: true }> {
  await prisma.shoppingList.delete({ where: { id } });
  revalidatePath("/price-analysis");
  return { success: true };
}

export async function addItemToList(
  listId: string,
  itemName: string,
  quantity: number = 1,
): Promise<{ id: string } | { error: string }> {
  const parsed = shoppingListItemSchema.safeParse({ itemName, quantity });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const groupMap = await buildGroupMap();
  const normalizedName = resolveItemName(parsed.data.itemName, groupMap, false);

  const maxOrder = await prisma.shoppingListItem.findFirst({
    where: { listId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const item = await prisma.shoppingListItem.create({
    data: {
      listId,
      itemName: parsed.data.itemName,
      normalizedName,
      quantity: parsed.data.quantity,
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
    },
  });

  // Touch the list updatedAt
  await prisma.shoppingList.update({
    where: { id: listId },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/price-analysis");
  return { id: item.id };
}

export async function removeItemFromList(
  itemId: string,
): Promise<{ success: true }> {
  await prisma.shoppingListItem.delete({ where: { id: itemId } });
  revalidatePath("/price-analysis");
  return { success: true };
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<{ success: true } | { error: string }> {
  if (quantity <= 0) return { error: "Quantity must be positive" };
  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { quantity },
  });
  revalidatePath("/price-analysis");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Analyze Basket
// ---------------------------------------------------------------------------

export async function analyzeBasket(
  listId: string,
): Promise<BasketAnalysis | { error: string }> {
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    include: { items: true },
  });

  if (!list || list.items.length === 0) {
    return { error: "List is empty or not found" };
  }

  const groupMap = await buildGroupMap();

  // Build set of all normalized names for basket items (considering groups)
  const basketItems = list.items.map((item) => {
    const normalized = resolveItemName(item.itemName, groupMap, false);
    return { ...item, resolvedName: normalized };
  });

  // Collect all group member names for each resolved name
  const groups = await prisma.itemGroup.findMany();
  const groupMembersMap = new Map<string, string[]>();
  for (const g of groups) {
    groupMembersMap.set(
      g.canonicalName,
      g.rawNames.map((r) => basicNormalize(r)),
    );
  }

  // Build all normalizedNames to search for
  const allNormalizedNames = new Set<string>();
  for (const bi of basketItems) {
    // If the resolved name is a group canonical name, add all its member names
    const members = groupMembersMap.get(bi.resolvedName);
    if (members) {
      for (const m of members) allNormalizedNames.add(m);
    }
    // Also add the resolved name itself (covers non-grouped items)
    allNormalizedNames.add(bi.resolvedName);
  }

  // Fetch all matching TransactionItems
  const transactionItems = await prisma.transactionItem.findMany({
    where: { normalizedName: { in: Array.from(allNormalizedNames) } },
    include: {
      transaction: { select: { merchant: true } },
    },
  });

  // Map each transaction item back to the basket resolved name
  const reverseGroupMap = new Map<string, string>();
  for (const bi of basketItems) {
    const members = groupMembersMap.get(bi.resolvedName);
    if (members) {
      for (const m of members) reverseGroupMap.set(m, bi.resolvedName);
    }
    reverseGroupMap.set(bi.resolvedName, bi.resolvedName);
  }

  // Group by merchant → resolvedName → prices
  const merchantData = new Map<
    string,
    Map<string, number[]>
  >();

  for (const ti of transactionItems) {
    const merchant = ti.transaction.merchant || "Unknown";
    const resolvedName =
      reverseGroupMap.get(ti.normalizedName) ?? ti.normalizedName;

    // Only consider items that are actually in our basket
    if (!basketItems.some((bi) => bi.resolvedName === resolvedName)) continue;

    if (!merchantData.has(merchant)) {
      merchantData.set(merchant, new Map());
    }
    const mMap = merchantData.get(merchant)!;
    if (!mMap.has(resolvedName)) {
      mMap.set(resolvedName, []);
    }

    const price = getEffectivePrice(ti.unitPrice, ti.totalPrice, ti.quantity);
    mMap.get(resolvedName)!.push(price);
  }

  // Build results per merchant
  const results: BasketMerchantResult[] = [];

  for (const [merchant, itemPrices] of merchantData) {
    const items: BasketItemResult[] = [];
    let availableTotal = 0;
    let availableCount = 0;
    let unavailableCount = 0;

    for (const bi of basketItems) {
      const prices = itemPrices.get(bi.resolvedName);
      if (prices && prices.length > 0) {
        const avgPrice =
          Math.round(
            (prices.reduce((a, b) => a + b, 0) / prices.length) * 100,
          ) / 100;
        const totalPrice = Math.round(avgPrice * bi.quantity * 100) / 100;
        availableTotal += totalPrice;
        availableCount++;
        items.push({
          itemName: bi.itemName,
          quantity: bi.quantity,
          avgPrice,
          totalPrice,
          purchaseCount: prices.length,
        });
      } else {
        unavailableCount++;
        items.push({
          itemName: bi.itemName,
          quantity: bi.quantity,
          avgPrice: null,
          totalPrice: null,
          purchaseCount: 0,
        });
      }
    }

    results.push({
      merchant,
      items,
      availableTotal: Math.round(availableTotal * 100) / 100,
      availableCount,
      unavailableCount,
    });
  }

  // Sort: merchants with all items first, then by total ascending
  results.sort((a, b) => {
    // Prefer merchants with more available items
    if (a.unavailableCount !== b.unavailableCount) {
      return a.unavailableCount - b.unavailableCount;
    }
    return a.availableTotal - b.availableTotal;
  });

  // Cheapest = first merchant with all items available, or just first
  const fullCoverage = results.find((r) => r.unavailableCount === 0);
  const cheapest = fullCoverage ?? results[0] ?? null;

  return {
    merchants: results,
    cheapestMerchant: cheapest?.merchant ?? null,
    cheapestTotal: cheapest?.availableTotal ?? null,
  };
}
