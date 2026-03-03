import type { FeatureInfoContent } from "@/components/ui/feature-info";

export const SPREAD_MONTHS_INFO: FeatureInfoContent = {
  title: "Spread Across Months",
  description:
    "Distribute a lump-sum payment evenly across multiple months for more accurate budgeting and analytics.",
  sections: [
    {
      heading: "When to use",
      body: "Use this when you make a single payment that covers multiple months. For example: quarterly bills, annual subscriptions, or prepaid services.",
    },
    {
      heading: "Example",
      body: "You pay 900 AED for 3 months of water.\n\nWithout spread: The full 900 AED shows up in one month, making it look like you overspent.\n\nWith spread (3 months): Each of the 3 months shows 300 AED — giving you a realistic picture of your monthly spending.",
    },
    {
      heading: "How it affects your data",
      body: "• Budget: Only the monthly portion counts against your budget\n• Monthly chart: The amount is split evenly across the covered months\n• Category breakdown: Shows the proportional amount for the selected period\n• Expense prediction: Based on the spread (monthly) amount\n• Daily spend: Divided by the number of months",
    },
    {
      heading: "Good to know",
      body: "• You can spread between 2 and 24 months\n• The original transaction stays on its original date\n• A purple badge (e.g. \"3mo\") appears in the transaction list\n• You can change or remove the spread anytime by editing the transaction",
    },
  ],
};
