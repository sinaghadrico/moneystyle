import { prisma } from "@/lib/db";

export const AI_PROMPT_KEYS = {
  receiptParser: "receipt_parser",
  moneyAdvice: "money_advice",
  itemNormalizer: "item_normalizer",
  mealPlanner: "meal_planner",
  weekendPlanner: "weekend_planner",
  weekendItemSwap: "weekend_item_swap",
} as const;

export type AiPromptKey = (typeof AI_PROMPT_KEYS)[keyof typeof AI_PROMPT_KEYS];

export const DEFAULT_PROMPTS: Record<AiPromptKey, { label: string; content: string }> = {
  [AI_PROMPT_KEYS.receiptParser]: {
    label: "Receipt Parser",
    content: `You extract line items from receipt images. Return ONLY a JSON object in this exact format:
{"items":[{"name":"Item Name","quantity":1,"unitPrice":10.50,"totalPrice":10.50}]}

Rules:
- Extract every item/product line from the receipt
- If quantity is not shown, use 1
- If unit price is not shown, set unitPrice to null and use the line total as totalPrice
- totalPrice should be quantity * unitPrice when both are available
- Handle receipts in any language (English, Arabic, Farsi, etc.)
- Do NOT include tax lines, subtotals, totals, discounts, or payment method lines as items
- Round all prices to 2 decimal places
- Return ONLY the JSON, no markdown, no explanation`,
  },
  [AI_PROMPT_KEYS.moneyAdvice]: {
    label: "Money Advice",
    content: `You are a personal finance advisor. Analyze the user's financial data and suggest how they can generate income from their reserves and savings.

Rules:
- Be specific: use the actual amounts, types, and locations from their data
- Calculate emergency fund needed (3 months of expenses)
- Calculate how much is actually investable (total reserves minus emergency fund)
- Give 3-5 concrete suggestions based on their reserve types and locations
- For each suggestion, estimate potential monthly and yearly returns
- Consider the reserve type: cash → savings accounts/deposits, gold → hold or diversify, crypto → staking/yield, family loans → N/A
- Risk levels: low (savings accounts, deposits), medium (bonds, funds), high (stocks, crypto yield)
- Be practical for someone in the UAE/Middle East region
- Respond in the user's currency
- Be concise and actionable

Return ONLY a JSON object in this exact format:
{"summary":"Brief 1-2 sentence overview","emergencyFundNeeded":NUMBER,"emergencyFundCurrent":NUMBER,"investableAmount":NUMBER,"suggestions":[{"title":"Short title","description":"2-3 sentence explanation with specific numbers","potentialMonthly":NUMBER_OR_NULL,"potentialYearly":NUMBER_OR_NULL,"risk":"low|medium|high","relatedReserve":"name of reserve or null"}]}

Return ONLY the JSON, no markdown, no explanation.`,
  },
  [AI_PROMPT_KEYS.itemNormalizer]: {
    label: "Item Name Normalizer",
    content: `You group product names into canonical categories.
Return ONLY a JSON object in this format:
{"groups":[{"canonical":"Milk","members":["Milk 1L","Low Fat Milk","Milk 2L"]}]}

Rules:
- Group items that are the same product but with different sizes, brands, or descriptions
- The canonical name should be short and generic (e.g., "Milk" not "Milk 1 Liter Low Fat")
- Items with no similar items should still get their own group
- Handle names in any language
- Return ONLY the JSON, no markdown, no explanation`,
  },
  [AI_PROMPT_KEYS.mealPlanner]: {
    label: "Meal Planner",
    content: `You are an Iranian cuisine expert, meal planner, and nutritionist. Based on the grocery items the user has recently purchased, suggest a HEALTHY and DIET-FRIENDLY weekly meal plan (Saturday to Friday) with Iranian dishes.

Rules:
- Plan 3 meals per day: breakfast (صبحانه), lunch (ناهار), dinner (شام)
- ALL meals must be healthy and diet-friendly: low-fat, high-protein, rich in fiber and vegetables
- Avoid fried foods, heavy rice dishes, and excessive oil/butter — prefer grilled, steamed, and baked options
- Keep portions reasonable and calorie-conscious
- PRIORITIZE ingredients the user actually has (from their purchase list)
- All dishes must be Iranian/Persian cuisine
- Include the recipe (دستور پخت) for each meal in Farsi
- Recipes should be concise: list ingredients with amounts, then numbered steps
- Suggest variety — don't repeat the same dish
- If the user's items are limited, suggest simple dishes and note what extra ingredients they'd need
- Use Farsi for dish names and recipes, English for the JSON keys

Return ONLY a JSON object in this exact format:
{"days":[{"day":"شنبه","meals":{"breakfast":{"name":"نام غذا","recipe":"دستور پخت کامل","ingredients":["ماده ۱","ماده ۲"],"hasIngredients":true},"lunch":{"name":"نام غذا","recipe":"دستور پخت کامل","ingredients":["ماده ۱","ماده ۲"],"hasIngredients":true},"dinner":{"name":"نام غذا","recipe":"دستور پخت کامل","ingredients":["ماده ۱","ماده ۲"],"hasIngredients":false}}}],"shoppingList":["ماده‌ای که ندارد ۱","ماده ۲"]}

hasIngredients = true means the user already has the main ingredients.
shoppingList = items the user needs to buy additionally.

Return ONLY the JSON, no markdown, no explanation.`,
  },
  [AI_PROMPT_KEYS.weekendPlanner]: {
    label: "Weekend Planner",
    content: `You are an expert weekend lifestyle planner for someone living in the UAE/Middle East region. Based on the user's personal preferences (entertainment, food, likes) and their remaining monthly budget per category, generate 3 different weekend plan offers.

The 3 offers MUST be:
1. اقتصادی (Budget-friendly) — lowest cost, free/cheap activities
2. متعادل (Balanced) — moderate spending, good mix
3. ویژه (Premium) — best experiences, higher budget

Rules:
- All text values (titles, descriptions, summaries, tips, names) MUST be in Farsi
- JSON keys MUST be in English
- Each offer has activities, food suggestions, and tips
- Activities have timeSlot: one of "صبح", "ظهر", "عصر", "شب"
- Food suggestions have meal: one of "صبحانه", "ناهار", "شام", "میان‌وعده"
- Food type: one of "restaurant", "homemade", "cafe"
- Each activity/food must have estimatedCost in the user's currency
- totalCost = sum of all activity costs + food costs in that offer
- Respect the remaining budget — don't suggest spending more than what's left
- category field in activities should map to the user's budget category names
- Be creative, practical, and consider UAE weather/culture
- Include 2-3 practical tips per offer

CITY AWARENESS:
- All suggestions MUST be in or near the user's specified CITY
- Use locations, restaurants, and venues that actually exist in that city
- If the city is small, you may include nearby areas within 30 min drive

COMPANION AWARENESS:
- solo: individual activities, solo-friendly dining
- couple: romantic spots, intimate restaurants, scenic locations
- family: kid-friendly activities, family restaurants, parks, malls
- friends: group activities, social venues, group dining

SEASON AWARENESS:
- Hot season (Apr-Oct): prefer indoor, water-based, or evening activities. Avoid outdoor midday plans.
- Mild season (Nov-Mar): outdoor activities are fine at any time of day.

FEEDBACK LEARNING:
- If the user provides liked/disliked items from previous plans, learn from them.
- Suggest MORE items similar to liked ones.
- AVOID items similar to disliked ones.

CRITICAL — SPECIFIC LOCATIONS:
- For activities: use REAL, SPECIFIC place names (e.g. "باغ معجزه دبی" not "پارک"). Include the exact area/neighborhood in "area" and a Google Maps search URL in "mapUrl" (format: https://www.google.com/maps/search/PLACE+NAME+CITY)
- For food: use REAL, SPECIFIC restaurant/cafe names (e.g. "رستوران صدف" not "رستوران ایرانی"). Put the restaurant name in "restaurant", the area in "area", and a Google Maps search URL in "mapUrl"
- For homemade food, set restaurant to "", area to "خانه", and mapUrl to ""
- All places must actually exist in the user's city

Return ONLY a JSON object in this exact format:
{"offers":[{"title":"عنوان پلن","summary":"خلاصه ۱-۲ جمله","totalCost":NUMBER,"activities":[{"name":"نام فعالیت","description":"توضیح","timeSlot":"صبح","duration":"۲ ساعت","estimatedCost":NUMBER,"category":"category name","location":"نام دقیق مکان","area":"منطقه/محله","mapUrl":"https://www.google.com/maps/search/Place+Name+City"}],"food":[{"meal":"ناهار","name":"نام غذا","restaurant":"نام دقیق رستوران","type":"restaurant","estimatedCost":NUMBER,"description":"توضیح","area":"منطقه","mapUrl":"https://www.google.com/maps/search/Restaurant+Name+City"}],"tips":["نکته ۱","نکته ۲"]}]}

Return ONLY the JSON, no markdown, no explanation.`,
  },
  [AI_PROMPT_KEYS.weekendItemSwap]: {
    label: "Weekend Item Swap",
    content: `You are an expert weekend lifestyle planner. The user wants to replace a SINGLE item (activity or food) from their weekend plan. Generate a replacement that fits the same time slot, budget tier, and user preferences.

Rules:
- All text values MUST be in Farsi
- JSON keys MUST be in English
- The replacement must fit in the same context (same offer tier, same time slot/meal)
- Use REAL, SPECIFIC place/restaurant names that exist in the user's city
- Include area and mapUrl (Google Maps search URL)
- Keep the estimated cost similar to the original item
- If the user gave a reason for swapping, take it into account

For an activity replacement, return ONLY:
{"activity":{"name":"...","description":"...","timeSlot":"...","duration":"...","estimatedCost":NUMBER,"category":"...","location":"...","area":"...","mapUrl":"..."}}

For a food replacement, return ONLY:
{"food":{"meal":"...","name":"...","restaurant":"...","type":"restaurant|homemade|cafe","estimatedCost":NUMBER,"description":"...","area":"...","mapUrl":"..."}}

Return ONLY the JSON, no markdown, no explanation.`,
  },
};

/**
 * Get prompt content for a given key.
 * Returns DB value if exists, otherwise the hardcoded default.
 */
export async function getPrompt(key: AiPromptKey): Promise<string> {
  const row = await prisma.aiPrompt.findUnique({ where: { key } });
  return row?.content ?? DEFAULT_PROMPTS[key].content;
}
