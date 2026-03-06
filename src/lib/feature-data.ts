export type FeatureStep = {
  title: string;
  description: string;
  items: { label: string; value?: string; highlight?: boolean }[];
};

export type FeatureConfig = {
  slug: string;
  title: string;
  headline: string;
  headlineAccent: string;
  tagline: string;
  badge: string;
  color: string; // tailwind color e.g. "blue-500"
  hex: string; // main hex for OG
  hexSecondary: string; // gradient end hex for OG
  steps: [FeatureStep, FeatureStep, FeatureStep];
  benefits: { title: string; description: string }[];
  ogPhone: {
    title: string;
    items: string[];
    resultLabel: string;
    resultValue: string;
  };
};

export const FEATURES: FeatureConfig[] = [
  {
    slug: "smart-dashboard",
    title: "Smart Dashboard",
    headline: "Your Finances,",
    headlineAccent: "Crystal Clear",
    tagline:
      "Real-time spending overview with heatmaps, category breakdowns, trend charts, and AI-powered predictions — all at a glance.",
    badge: "Smart Dashboard",
    color: "blue-500",
    hex: "#3b82f6",
    hexSecondary: "#6366f1",
    steps: [
      {
        title: "See the Big Picture",
        description:
          "Open your dashboard and instantly see this month's spending, income, and balance. Visual charts show where your money flows.",
        items: [
          { label: "Total Spent", value: "$2,847" },
          { label: "Income", value: "$4,200" },
          { label: "Balance", value: "+$1,353", highlight: true },
          { label: "Savings Rate", value: "32%" },
        ],
      },
      {
        title: "Spot Trends & Patterns",
        description:
          "Spending heatmaps reveal your daily habits. Category breakdowns show exactly where money goes. Compare month-over-month instantly.",
        items: [
          { label: "Groceries", value: "$342 (-8%)" },
          { label: "Dining Out", value: "$185 (+12%)" },
          { label: "Transport", value: "$128 (-3%)" },
          { label: "Entertainment", value: "$95 (+25%)", highlight: true },
        ],
      },
      {
        title: "Predict What's Coming",
        description:
          "AI analyzes your spending pace and predicts your month-end total. Know early if you'll go over budget.",
        items: [
          { label: "Current Pace", value: "$94/day" },
          { label: "Projected Total", value: "$2,820" },
          { label: "Budget Limit", value: "$3,000" },
          { label: "Status", value: "On Track", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Real-time Updates",
        description: "Dashboard refreshes with every transaction you log.",
      },
      {
        title: "Spending Heatmap",
        description: "Visualize which days you spend the most.",
      },
      {
        title: "Category Insights",
        description: "Automatic breakdowns by category and merchant.",
      },
      {
        title: "Expense Prediction",
        description: "AI predicts your month-end spending from daily pace.",
      },
    ],
    ogPhone: {
      title: "Dashboard",
      items: ["Spent: $2,847", "Income: $4,200", "Groceries: $342", "Dining: $185", "Transport: $128"],
      resultLabel: "Savings Rate",
      resultValue: "32%",
    },
  },
  {
    slug: "transaction-tracking",
    title: "Transaction Tracking",
    headline: "Every Dollar,",
    headlineAccent: "Accounted For",
    tagline:
      "Log every transaction with categories, tags, line items, merchants, and multiple accounts. Split expenses and spread costs across months.",
    badge: "Transactions",
    color: "green-500",
    hex: "#22c55e",
    hexSecondary: "#10b981",
    steps: [
      {
        title: "Log Quickly",
        description:
          "Add transactions in seconds — amount, category, merchant. Or scan a receipt and let AI do it for you.",
        items: [
          { label: "Amount", value: "$45.80" },
          { label: "Category", value: "Groceries" },
          { label: "Merchant", value: "FreshMart" },
          { label: "Account", value: "Main Checking" },
        ],
      },
      {
        title: "Organize & Categorize",
        description:
          "Add tags, line items, notes, and media. Split a restaurant bill with friends or spread a yearly subscription across months.",
        items: [
          { label: "Whole Milk 1L", value: "$3.49" },
          { label: "Bread", value: "$4.99" },
          { label: "Eggs (12)", value: "$6.29" },
          { label: "Split: 3 people", value: "$15.27 each", highlight: true },
        ],
      },
      {
        title: "Search & Analyze",
        description:
          "Filter by date, category, merchant, tag, or amount. Find any transaction instantly. Export to CSV anytime.",
        items: [
          { label: "This Month", value: "142 transactions" },
          { label: "Top Merchant", value: "FreshMart (23x)" },
          { label: "Avg. Transaction", value: "$28.50" },
          { label: "Most Spent Day", value: "Saturday", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Multiple Accounts",
        description: "Track cash, bank accounts, and cards separately.",
      },
      {
        title: "Line Items",
        description: "Break down each transaction into individual items.",
      },
      {
        title: "Split Expenses",
        description: "Divide costs between people right in the transaction.",
      },
      {
        title: "Spread Costs",
        description: "Spread quarterly bills across months for accurate budgets.",
      },
    ],
    ogPhone: {
      title: "Transactions",
      items: ["FreshMart: $45.80", "Gas Station: $52.00", "Netflix: $15.99", "Coffee Shop: $4.50", "Pharmacy: $23.40"],
      resultLabel: "This month",
      resultValue: "142 txns",
    },
  },
  {
    slug: "receipt-scanner",
    title: "AI Receipt Scanner",
    headline: "Snap, Scan,",
    headlineAccent: "Done",
    tagline:
      "Take a photo of any receipt and AI extracts every line item, price, and total automatically. Supports English, Arabic, and Farsi.",
    badge: "Receipt Scanner",
    color: "purple-500",
    hex: "#a855f7",
    hexSecondary: "#7c3aed",
    steps: [
      {
        title: "Snap a Photo",
        description:
          "Take a photo of any receipt — crumpled, faded, or handwritten. The AI handles it all.",
        items: [
          { label: "Camera", value: "Ready" },
          { label: "Languages", value: "EN / AR / FA" },
          { label: "Format", value: "Any receipt" },
          { label: "Quality", value: "Any condition" },
        ],
      },
      {
        title: "AI Extracts Everything",
        description:
          "AI reads the receipt and extracts merchant name, date, every line item with quantities and prices, and the total.",
        items: [
          { label: "Merchant", value: "GreenGrocer" },
          { label: "Milk 1L x2", value: "$6.98" },
          { label: "Bread", value: "$4.99" },
          { label: "Total", value: "$23.76", highlight: true },
        ],
      },
      {
        title: "Review & Save",
        description:
          "Quick review, adjust if needed, pick a category, and save. The transaction is logged with all line items.",
        items: [
          { label: "Category", value: "Groceries" },
          { label: "Items", value: "5 extracted" },
          { label: "Confidence", value: "98%" },
          { label: "Status", value: "Saved", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Multi-Language",
        description: "Reads English, Arabic, and Farsi receipts natively.",
      },
      {
        title: "Line Item Detail",
        description: "Every item with quantity and price, not just the total.",
      },
      {
        title: "Auto-Categorize",
        description: "AI suggests the category based on merchant and items.",
      },
      {
        title: "Instant Processing",
        description: "Results in seconds, not minutes. Scan and move on.",
      },
    ],
    ogPhone: {
      title: "Receipt Scan",
      items: ["Milk 1L x2: $6.98", "Bread: $4.99", "Eggs (12): $6.29", "Olive Oil: $8.99", "Cheese: $4.50"],
      resultLabel: "Total extracted",
      resultValue: "$31.75",
    },
  },
  {
    slug: "budget-management",
    title: "Budget Management",
    headline: "Spend With",
    headlineAccent: "Confidence",
    tagline:
      "Set monthly budgets per category with custom alert thresholds. Get notified before you overspend — not after.",
    badge: "Budgets",
    color: "indigo-500",
    hex: "#6366f1",
    hexSecondary: "#4f46e5",
    steps: [
      {
        title: "Set Your Limits",
        description:
          "Define monthly budgets for each category. Set alert thresholds at 50%, 75%, or any percentage you want.",
        items: [
          { label: "Groceries", value: "$400/mo" },
          { label: "Dining Out", value: "$200/mo" },
          { label: "Transport", value: "$150/mo" },
          { label: "Entertainment", value: "$100/mo" },
        ],
      },
      {
        title: "Track in Real-Time",
        description:
          "Visual progress bars show exactly where you stand. Green, yellow, red — know your status at a glance.",
        items: [
          { label: "Groceries", value: "$280 / $400 (70%)" },
          { label: "Dining Out", value: "$165 / $200 (82%)", highlight: true },
          { label: "Transport", value: "$90 / $150 (60%)" },
          { label: "Entertainment", value: "$45 / $100 (45%)" },
        ],
      },
      {
        title: "Get Alerts Before It's Too Late",
        description:
          "Receive Telegram notifications when you hit your alert threshold. Adjust spending before you blow the budget.",
        items: [
          { label: "Dining Out", value: "82% used", highlight: true },
          { label: "Alert sent via", value: "Telegram" },
          { label: "Days left", value: "11 days" },
          { label: "Safe to spend", value: "$35 more" },
        ],
      },
    ],
    benefits: [
      {
        title: "Per-Category",
        description: "Different budgets for different spending categories.",
      },
      {
        title: "Custom Thresholds",
        description: "Set alerts at any percentage — 50%, 75%, or 90%.",
      },
      {
        title: "Telegram Alerts",
        description: "Get notified on your phone before you overspend.",
      },
      {
        title: "Visual Progress",
        description: "Color-coded bars show budget status at a glance.",
      },
    ],
    ogPhone: {
      title: "Budgets",
      items: ["Groceries: 70%", "Dining: 82%", "Transport: 60%", "Fun: 45%", "Shopping: 35%"],
      resultLabel: "Overall",
      resultValue: "On Track",
    },
  },
  {
    slug: "savings-goals",
    title: "Savings Goals",
    headline: "Dream It,",
    headlineAccent: "Save It",
    tagline:
      "Set savings targets with deadlines, track progress visually, add funds anytime, and celebrate when you hit your goals.",
    badge: "Savings Goals",
    color: "emerald-500",
    hex: "#10b981",
    hexSecondary: "#059669",
    steps: [
      {
        title: "Set Your Goal",
        description:
          "Name your goal, set the target amount, and pick a deadline. Vacation, emergency fund, new laptop — anything.",
        items: [
          { label: "Goal", value: "Japan Trip" },
          { label: "Target", value: "$3,000" },
          { label: "Deadline", value: "Aug 2026" },
          { label: "Monthly needed", value: "$375" },
        ],
      },
      {
        title: "Add Funds & Track",
        description:
          "Add money to your goal anytime. Visual progress bar and percentage keep you motivated.",
        items: [
          { label: "Saved so far", value: "$1,875" },
          { label: "Progress", value: "62.5%" },
          { label: "On pace?", value: "Yes", highlight: true },
          { label: "Remaining", value: "$1,125" },
        ],
      },
      {
        title: "Hit Your Target",
        description:
          "Watch the progress bar fill up. Get a notification when you've reached your goal. Time to celebrate!",
        items: [
          { label: "Status", value: "Goal Reached!", highlight: true },
          { label: "Total saved", value: "$3,000" },
          { label: "Time taken", value: "7 months" },
          { label: "Ahead by", value: "1 month" },
        ],
      },
    ],
    benefits: [
      {
        title: "Visual Progress",
        description: "Satisfying progress bars that motivate you to save.",
      },
      {
        title: "Multiple Goals",
        description: "Save for several things at once. Track each separately.",
      },
      {
        title: "Smart Pacing",
        description: "See if you're on track to hit your deadline.",
      },
      {
        title: "Flexible Deposits",
        description: "Add any amount, any time. No rigid schedules.",
      },
    ],
    ogPhone: {
      title: "Savings Goals",
      items: ["Japan Trip: 62%", "Emergency: 80%", "New Laptop: 45%", "Car Fund: 25%", "Wedding: 15%"],
      resultLabel: "Total saved",
      resultValue: "$8,450",
    },
  },
  {
    slug: "reserves",
    title: "Reserves & Net Worth",
    headline: "Know Your",
    headlineAccent: "True Worth",
    tagline:
      "Track cash, gold, crypto, stocks, and other reserves with historical snapshots. See your complete net worth at any time.",
    badge: "Reserves",
    color: "amber-500",
    hex: "#f59e0b",
    hexSecondary: "#d97706",
    steps: [
      {
        title: "Add Your Assets",
        description:
          "Log every asset — bank accounts, cash, gold, crypto, investments. Set current values in any currency.",
        items: [
          { label: "Checking Account", value: "$12,500" },
          { label: "Gold (2 oz)", value: "$4,200" },
          { label: "Bitcoin (0.15)", value: "$9,750" },
          { label: "Emergency Cash", value: "$2,000" },
        ],
      },
      {
        title: "Track Over Time",
        description:
          "Take periodic snapshots of your reserves. Watch your wealth grow (or spot when it dips) with historical data.",
        items: [
          { label: "Jan 2026", value: "$24,100" },
          { label: "Feb 2026", value: "$26,350" },
          { label: "Mar 2026", value: "$28,450" },
          { label: "Growth", value: "+18%", highlight: true },
        ],
      },
      {
        title: "See the Full Picture",
        description:
          "Your complete net worth — assets minus liabilities — in one view. Multi-currency, auto-converted.",
        items: [
          { label: "Total Assets", value: "$28,450" },
          { label: "Liabilities", value: "$5,200" },
          { label: "Net Worth", value: "$23,250", highlight: true },
          { label: "vs Last Month", value: "+$2,100" },
        ],
      },
    ],
    benefits: [
      {
        title: "All Asset Types",
        description: "Cash, gold, crypto, stocks — track it all in one place.",
      },
      {
        title: "Historical Snapshots",
        description: "See how your wealth changes over months and years.",
      },
      {
        title: "Multi-Currency",
        description: "Assets in different currencies, auto-converted.",
      },
      {
        title: "Net Worth View",
        description: "Assets minus debts = your true financial position.",
      },
    ],
    ogPhone: {
      title: "Net Worth",
      items: ["Checking: $12.5K", "Gold: $4.2K", "Bitcoin: $9.7K", "Cash: $2K", "Liabilities: -$5.2K"],
      resultLabel: "Net Worth",
      resultValue: "$23,250",
    },
  },
  {
    slug: "installments-bills",
    title: "Installments & Bills",
    headline: "Never Miss",
    headlineAccent: "A Payment",
    tagline:
      "Manage loan installments and recurring bills with progress tracking, payment history, and automatic due-date reminders via Telegram.",
    badge: "Payments",
    color: "red-500",
    hex: "#ef4444",
    hexSecondary: "#dc2626",
    steps: [
      {
        title: "Add Payment Plans",
        description:
          "Set up loans with total amount, installment count, and due dates. Add recurring bills with their cycles.",
        items: [
          { label: "Car Loan", value: "24 installments" },
          { label: "Monthly", value: "$450" },
          { label: "Internet Bill", value: "$65/mo" },
          { label: "Insurance", value: "$120/quarter" },
        ],
      },
      {
        title: "Track Progress",
        description:
          "See how many payments you've made, what's remaining, and your completion percentage for each loan.",
        items: [
          { label: "Car Loan", value: "14/24 paid (58%)" },
          { label: "Remaining", value: "$4,500" },
          { label: "Next Due", value: "Mar 15", highlight: true },
          { label: "Bills This Month", value: "3 upcoming" },
        ],
      },
      {
        title: "Get Reminders",
        description:
          "Telegram reminders before each due date. Never pay late fees again. Link payments to actual bank transactions.",
        items: [
          { label: "Reminder", value: "3 days before" },
          { label: "Via", value: "Telegram" },
          { label: "Auto-link", value: "Bank transaction" },
          { label: "Late payments", value: "0", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Loan Tracking",
        description: "Visualize progress on every installment plan.",
      },
      {
        title: "Bill Management",
        description: "Track monthly, quarterly, and yearly recurring bills.",
      },
      {
        title: "Due-Date Alerts",
        description: "Telegram reminders so you never miss a payment.",
      },
      {
        title: "Payment History",
        description: "Full record of every payment you've made.",
      },
    ],
    ogPhone: {
      title: "Payments",
      items: ["Car Loan: 58%", "Internet: Due Mar 10", "Insurance: Due Apr 1", "Phone: Due Mar 15", "Gym: Paid"],
      resultLabel: "Late payments",
      resultValue: "Zero",
    },
  },
  {
    slug: "income-tracking",
    title: "Income Tracking",
    headline: "Every Earning,",
    headlineAccent: "Captured",
    tagline:
      "Define income sources with deposit schedules, record every deposit, and link them to actual bank transactions for a complete picture.",
    badge: "Income",
    color: "cyan-500",
    hex: "#06b6d4",
    hexSecondary: "#0891b2",
    steps: [
      {
        title: "Define Your Sources",
        description:
          "Add salary, freelance income, rental income, or side hustles. Set expected amounts and deposit schedules.",
        items: [
          { label: "Salary", value: "$4,200/mo" },
          { label: "Freelance", value: "~$800/mo" },
          { label: "Rental Income", value: "$1,100/mo" },
          { label: "Total Expected", value: "$6,100/mo" },
        ],
      },
      {
        title: "Record Deposits",
        description:
          "Log each deposit as it arrives. Track actual vs. expected income. See freelance income fluctuations.",
        items: [
          { label: "Mar Salary", value: "$4,200 (received)", highlight: true },
          { label: "Mar Freelance", value: "$650 (partial)" },
          { label: "Mar Rental", value: "Pending" },
          { label: "Received so far", value: "$4,850" },
        ],
      },
      {
        title: "Link to Bank",
        description:
          "Connect income records to actual bank transactions. MoneyStyle auto-suggests matching transactions.",
        items: [
          { label: "Salary → Checking", value: "Linked", highlight: true },
          { label: "Freelance → PayPal", value: "Linked" },
          { label: "Rental → Savings", value: "Pending" },
          { label: "Unlinked", value: "1 deposit" },
        ],
      },
    ],
    benefits: [
      {
        title: "Multiple Sources",
        description: "Track salary, freelance, passive income — all separately.",
      },
      {
        title: "Deposit Schedules",
        description: "Know when to expect each income deposit.",
      },
      {
        title: "Auto-Link",
        description: "AI suggests matching bank transactions to link.",
      },
      {
        title: "Income vs. Expenses",
        description: "Clear picture of what comes in and what goes out.",
      },
    ],
    ogPhone: {
      title: "Income",
      items: ["Salary: $4,200", "Freelance: $800", "Rental: $1,100", "Side Hustle: $350", "Dividends: $75"],
      resultLabel: "Monthly total",
      resultValue: "$6,525",
    },
  },
  {
    slug: "transaction-linking",
    title: "Transaction Linking",
    headline: "Connect",
    headlineAccent: "The Dots",
    tagline:
      "Link bank transactions to installment payments, bill payments, and income deposits. AI auto-suggests matches so nothing falls through the cracks.",
    badge: "Linking",
    color: "violet-500",
    hex: "#8b5cf6",
    hexSecondary: "#7c3aed",
    steps: [
      {
        title: "Find the Match",
        description:
          "AI scans your transactions and suggests likely matches to your installments, bills, and income records.",
        items: [
          { label: "Bank: $450 Mar 15", value: "→ Car Loan?" },
          { label: "Bank: $65 Mar 10", value: "→ Internet Bill?" },
          { label: "Bank: $4,200 Mar 1", value: "→ Salary?" },
          { label: "Suggestions", value: "3 matches", highlight: true },
        ],
      },
      {
        title: "Confirm & Link",
        description:
          "Review suggestions and confirm with one tap. Or manually search and link any transaction to any payment.",
        items: [
          { label: "Car Loan Payment", value: "Linked", highlight: true },
          { label: "Internet Bill", value: "Linked", highlight: true },
          { label: "Salary Deposit", value: "Linked", highlight: true },
          { label: "Unmatched", value: "0 remaining" },
        ],
      },
      {
        title: "Complete Picture",
        description:
          "Every payment is now connected to its bank record. No orphaned transactions. No missed payments.",
        items: [
          { label: "Installments", value: "100% linked" },
          { label: "Bills", value: "100% linked" },
          { label: "Income", value: "95% linked" },
          { label: "Data integrity", value: "Verified", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "AI Suggestions",
        description: "Smart matching based on amount, date, and merchant.",
      },
      {
        title: "One-Tap Linking",
        description: "Confirm a suggested match with a single tap.",
      },
      {
        title: "Full Coverage",
        description: "Link installments, bills, and income — all in one flow.",
      },
      {
        title: "Data Integrity",
        description: "Every payment traced to its source transaction.",
      },
    ],
    ogPhone: {
      title: "Linking",
      items: ["$450 → Car Loan", "$65 → Internet", "$4,200 → Salary", "$120 → Insurance", "$15.99 → Netflix"],
      resultLabel: "Linked",
      resultValue: "100%",
    },
  },
  {
    slug: "price-analysis",
    title: "Price Analysis",
    headline: "Track Every",
    headlineAccent: "Price Change",
    tagline:
      "Compare prices across merchants from your own purchase history. Track your personal inflation rate and find the cheapest store for every item.",
    badge: "Prices",
    color: "orange-500",
    hex: "#f97316",
    hexSecondary: "#ea580c",
    steps: [
      {
        title: "Search Any Item",
        description:
          "Type any product name and see every price you've ever paid for it, at every store, over time.",
        items: [
          { label: "Whole Milk 1L", value: "14 purchases" },
          { label: "Cheapest", value: "$2.99 (Costco)" },
          { label: "Most Expensive", value: "$4.49 (Corner Shop)" },
          { label: "Average", value: "$3.45" },
        ],
      },
      {
        title: "Compare Across Stores",
        description:
          "Side-by-side comparison of the same item at different merchants. See which store consistently offers better prices.",
        items: [
          { label: "FreshMart", value: "$3.29" },
          { label: "GreenGrocer", value: "$3.49" },
          { label: "Costco", value: "$2.99", highlight: true },
          { label: "Corner Shop", value: "$4.49" },
        ],
      },
      {
        title: "Track Your Inflation",
        description:
          "See how prices change over time for your regular purchases. Your personal inflation rate based on what you actually buy.",
        items: [
          { label: "Milk (6 months)", value: "+8%" },
          { label: "Bread (6 months)", value: "+12%", highlight: true },
          { label: "Eggs (6 months)", value: "-3%" },
          { label: "Your Inflation", value: "+5.2%" },
        ],
      },
    ],
    benefits: [
      {
        title: "Real Data",
        description: "Prices from your actual receipts, not internet estimates.",
      },
      {
        title: "Price History",
        description: "Track how prices change over weeks and months.",
      },
      {
        title: "Store Comparison",
        description: "Find which store is cheapest for each item you buy.",
      },
      {
        title: "Personal Inflation",
        description: "Your real inflation rate, not the government's number.",
      },
    ],
    ogPhone: {
      title: "Prices",
      items: ["Milk: $2.99-$4.49", "Bread: $3.99-$5.49", "Eggs: $5.29-$7.99", "Oil: $7.99-$11.99", "Cheese: $3.49-$5.99"],
      resultLabel: "Your inflation",
      resultValue: "+5.2%",
    },
  },
  {
    slug: "shared-expenses",
    title: "Shared Expenses",
    headline: "Split Fair,",
    headlineAccent: "Stay Friends",
    tagline:
      "Split expenses with friends, family, or housemates. Track who owes whom and settle debts with a clear balance sheet.",
    badge: "Shared",
    color: "pink-500",
    hex: "#ec4899",
    hexSecondary: "#db2777",
    steps: [
      {
        title: "Add Shared Expense",
        description:
          "Log a group expense — dinner, trip, rent, utilities. Add who participated and how much each person's share is.",
        items: [
          { label: "Dinner at Luigi's", value: "$180" },
          { label: "Split between", value: "4 people" },
          { label: "Each person", value: "$45" },
          { label: "You paid", value: "$180 (full)" },
        ],
      },
      {
        title: "Track Balances",
        description:
          "See who owes you and who you owe. Running balance per person, automatically calculated from all shared expenses.",
        items: [
          { label: "Alex owes you", value: "$45" },
          { label: "Sam owes you", value: "$85", highlight: true },
          { label: "You owe Jordan", value: "$30" },
          { label: "Net balance", value: "+$100" },
        ],
      },
      {
        title: "Settle Up",
        description:
          "Mark debts as settled when paid. Clear history of all settlements. No awkward money conversations.",
        items: [
          { label: "Alex paid you", value: "$45", highlight: true },
          { label: "Sam", value: "Pending" },
          { label: "Jordan (you paid)", value: "Settled" },
          { label: "Outstanding", value: "$85" },
        ],
      },
    ],
    benefits: [
      {
        title: "Group Splitting",
        description: "Split equally or with custom amounts per person.",
      },
      {
        title: "Running Balances",
        description: "Always know who owes whom across all expenses.",
      },
      {
        title: "Settlement Tracking",
        description: "Mark debts as paid and keep a clear record.",
      },
      {
        title: "No Arguments",
        description: "Transparent history removes money awkwardness.",
      },
    ],
    ogPhone: {
      title: "Shared",
      items: ["Alex: +$45", "Sam: +$85", "Jordan: -$30", "Taylor: +$20", "Morgan: -$15"],
      resultLabel: "Net balance",
      resultValue: "+$105",
    },
  },
  {
    slug: "money-advice",
    title: "AI Money Advice",
    headline: "AI-Powered",
    headlineAccent: "Financial Insight",
    tagline:
      "Get personalized investment suggestions based on your actual income, expenses, and idle reserves — with real numbers, not generic tips.",
    badge: "AI Advice",
    color: "yellow-500",
    hex: "#eab308",
    hexSecondary: "#ca8a04",
    steps: [
      {
        title: "AI Analyzes Your Finances",
        description:
          "AI reviews your income, spending patterns, savings rate, and idle reserves to understand your complete financial picture.",
        items: [
          { label: "Monthly Income", value: "$6,100" },
          { label: "Monthly Expenses", value: "$4,200" },
          { label: "Savings Rate", value: "31%" },
          { label: "Idle Cash", value: "$8,500", highlight: true },
        ],
      },
      {
        title: "Get Personalized Suggestions",
        description:
          "Based on YOUR numbers, AI suggests specific actions — not generic advice. Real amounts, real timelines.",
        items: [
          { label: "Emergency Fund", value: "Add $4,100 more" },
          { label: "Invest Idle Cash", value: "$3,500 available" },
          { label: "Cut Dining Out", value: "Save $85/mo", highlight: true },
          { label: "Increase Savings", value: "To 35% possible" },
        ],
      },
      {
        title: "Take Action",
        description:
          "Follow the suggestions at your own pace. Track progress as your financial habits improve over time.",
        items: [
          { label: "Suggestion #1", value: "Done", highlight: true },
          { label: "Suggestion #2", value: "In Progress" },
          { label: "Monthly Savings", value: "+$285" },
          { label: "Projected Annual", value: "+$3,420" },
        ],
      },
    ],
    benefits: [
      {
        title: "Real Numbers",
        description: "Advice based on your actual income and spending data.",
      },
      {
        title: "Personalized",
        description: "Suggestions tailored to your specific financial situation.",
      },
      {
        title: "Actionable",
        description: "Specific steps with amounts, not vague recommendations.",
      },
      {
        title: "Evolving",
        description: "Advice updates as your financial picture changes.",
      },
    ],
    ogPhone: {
      title: "AI Advice",
      items: ["Build emergency fund", "Invest idle $3.5K", "Cut dining: $85/mo", "Auto-save: $500/mo", "Review insurance"],
      resultLabel: "Potential savings",
      resultValue: "$3,420/yr",
    },
  },
  {
    slug: "weekend-planner",
    title: "Weekend Planner",
    headline: "Plan Perfect",
    headlineAccent: "Weekends",
    tagline:
      "AI generates weekend plans based on your preferences, city, budget, and companion type. Rate activities and AI learns your taste.",
    badge: "Weekends",
    color: "rose-500",
    hex: "#f43f5e",
    hexSecondary: "#e11d48",
    steps: [
      {
        title: "Set Your Preferences",
        description:
          "Tell AI your city, budget, who you're with (solo, partner, family, friends), and what you enjoy.",
        items: [
          { label: "City", value: "Toronto" },
          { label: "Budget", value: "$80-120" },
          { label: "Companion", value: "Partner" },
          { label: "Interests", value: "Food, Nature, Art" },
        ],
      },
      {
        title: "Get AI Plans",
        description:
          "AI generates complete weekend itineraries — morning, afternoon, evening — with specific places and estimated costs.",
        items: [
          { label: "Morning", value: "Kensington Market" },
          { label: "Lunch", value: "Pai Thai ($35)" },
          { label: "Afternoon", value: "High Park Walk" },
          { label: "Evening", value: "Jazz Bar ($45)", highlight: true },
        ],
      },
      {
        title: "Rate & Improve",
        description:
          "Rate each activity after your weekend. AI learns your preferences and generates better plans each time.",
        items: [
          { label: "Market Walk", value: "4/5 stars" },
          { label: "Pai Thai", value: "5/5 stars", highlight: true },
          { label: "Park Walk", value: "3/5 stars" },
          { label: "AI accuracy", value: "Improving" },
        ],
      },
    ],
    benefits: [
      {
        title: "Budget-Aware",
        description: "Plans fit your weekend spending budget perfectly.",
      },
      {
        title: "Learning AI",
        description: "Gets better with every rating you give.",
      },
      {
        title: "Companion-Based",
        description: "Different plans for solo, date, family, or friend trips.",
      },
      {
        title: "Local & Fresh",
        description: "Suggestions based on your actual city and season.",
      },
    ],
    ogPhone: {
      title: "Weekend Plan",
      items: ["AM: Kensington Market", "Lunch: Pai Thai $35", "PM: High Park", "Eve: Jazz Bar $45", "Total: ~$110"],
      resultLabel: "Budget fit",
      resultValue: "Perfect",
    },
  },
  {
    slug: "meal-planner",
    title: "Meal Planner",
    headline: "Eat Smart,",
    headlineAccent: "Waste Less",
    tagline:
      "AI reads your purchase history, generates weekly meal plans with recipes, and creates optimized shopping lists. Cook what you already buy.",
    badge: "Meal Planner",
    color: "teal-500",
    hex: "#14b8a6",
    hexSecondary: "#0d9488",
    steps: [
      {
        title: "AI Reads Your Purchases",
        description:
          "AI analyzes your grocery receipts to understand what ingredients you regularly buy and prefer.",
        items: [
          { label: "Chicken (weekly)", value: "Regular buyer" },
          { label: "Rice & Pasta", value: "Regular buyer" },
          { label: "Vegetables", value: "Broccoli, Tomato, Onion" },
          { label: "Data from", value: "142 receipts", highlight: true },
        ],
      },
      {
        title: "Get Meal Plans & Recipes",
        description:
          "AI generates a weekly meal plan using ingredients you already buy. Full recipes with step-by-step instructions.",
        items: [
          { label: "Monday", value: "Chicken Stir-Fry" },
          { label: "Tuesday", value: "Pasta Primavera" },
          { label: "Wednesday", value: "Rice Bowl" },
          { label: "Recipes included", value: "7 meals", highlight: true },
        ],
      },
      {
        title: "Generate Shopping List",
        description:
          "AI creates a shopping list for the week's meals. Only buy what you need — reduce waste and save money.",
        items: [
          { label: "Items needed", value: "12 items" },
          { label: "Already have", value: "5 items" },
          { label: "To buy", value: "7 items" },
          { label: "Est. cost", value: "$45", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Based on Your Data",
        description: "Recipes use ingredients you actually buy and enjoy.",
      },
      {
        title: "Reduce Waste",
        description: "Plan meals around what you have. Buy only what you need.",
      },
      {
        title: "Full Recipes",
        description: "Step-by-step cooking instructions for every meal.",
      },
      {
        title: "Smart Lists",
        description: "Shopping lists that skip items you already have at home.",
      },
    ],
    ogPhone: {
      title: "Meal Plan",
      items: ["Mon: Stir-Fry", "Tue: Pasta", "Wed: Rice Bowl", "Thu: Salmon", "Fri: Tacos"],
      resultLabel: "Weekly cost",
      resultValue: "~$45",
    },
  },
  {
    slug: "multi-currency",
    title: "Multi-Currency",
    headline: "One App,",
    headlineAccent: "Every Currency",
    tagline:
      "Full support for multiple currencies with automatic conversion. Dashboard, budgets, goals, and reports — all work seamlessly in any currency.",
    badge: "Multi-Currency",
    color: "sky-500",
    hex: "#0ea5e9",
    hexSecondary: "#0284c7",
    steps: [
      {
        title: "Add Your Currencies",
        description:
          "Set up the currencies you use — USD, EUR, GBP, or any other. Set your primary display currency.",
        items: [
          { label: "Primary", value: "USD ($)" },
          { label: "Also tracking", value: "EUR, GBP" },
          { label: "Crypto", value: "BTC, ETH" },
          { label: "Auto-convert", value: "Enabled", highlight: true },
        ],
      },
      {
        title: "Track in Any Currency",
        description:
          "Log transactions in their original currency. MoneyStyle automatically converts for reports and dashboards.",
        items: [
          { label: "London Hotel", value: "£250 ($315)" },
          { label: "Paris Dinner", value: "€85 ($92)" },
          { label: "Tokyo Shopping", value: "¥15,000 ($100)" },
          { label: "All converted to", value: "USD", highlight: true },
        ],
      },
      {
        title: "Unified Dashboard",
        description:
          "See everything in your primary currency. Budgets, goals, reserves — all auto-converted and always current.",
        items: [
          { label: "Total Spending", value: "$3,247 (3 currencies)" },
          { label: "Budget Status", value: "All converted" },
          { label: "Net Worth", value: "Multi-currency" },
          { label: "Reports", value: "Unified view", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Any Currency",
        description: "Support for fiat, crypto, and custom currencies.",
      },
      {
        title: "Auto-Conversion",
        description: "Automatic rate conversion for all reports and views.",
      },
      {
        title: "Travel-Ready",
        description: "Log expenses abroad without currency math headaches.",
      },
      {
        title: "Unified View",
        description: "Everything converted to your primary currency.",
      },
    ],
    ogPhone: {
      title: "Currencies",
      items: ["USD: $12,500", "EUR: €3,200", "GBP: £1,800", "BTC: 0.15", "ETH: 2.5"],
      resultLabel: "Total (USD)",
      resultValue: "$24,150",
    },
  },
  {
    slug: "telegram-bot",
    title: "Telegram Bot",
    headline: "Alerts Where",
    headlineAccent: "You Are",
    tagline:
      "Payment reminders, budget alerts, transaction notifications, monthly reports, and weekend plans — all delivered instantly via Telegram.",
    badge: "Telegram",
    color: "blue-400",
    hex: "#60a5fa",
    hexSecondary: "#3b82f6",
    steps: [
      {
        title: "Connect Your Bot",
        description:
          "Link your Telegram account in settings. Takes 30 seconds — scan a QR code or enter your chat ID.",
        items: [
          { label: "Setup", value: "30 seconds" },
          { label: "Method", value: "QR Code / Chat ID" },
          { label: "Status", value: "Connected", highlight: true },
          { label: "Bot name", value: "@MoneyStyleBot" },
        ],
      },
      {
        title: "Configure Alerts",
        description:
          "Choose what you want to be notified about — budget thresholds, payment due dates, daily summaries, or everything.",
        items: [
          { label: "Budget Alerts", value: "At 75% & 90%" },
          { label: "Payment Reminders", value: "3 days before" },
          { label: "Daily Summary", value: "8 PM" },
          { label: "Monthly Report", value: "1st of month", highlight: true },
        ],
      },
      {
        title: "Get Notified Instantly",
        description:
          "Alerts arrive on your phone the moment they trigger. Budget warnings, payment reminders, and spending summaries.",
        items: [
          { label: "Budget: Dining 82%", value: "Just now" },
          { label: "Car Loan due", value: "In 3 days" },
          { label: "Daily: spent $64", value: "8:00 PM" },
          { label: "Alerts this week", value: "7 messages", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Instant Delivery",
        description: "Notifications arrive on Telegram within seconds.",
      },
      {
        title: "Customizable",
        description: "Choose exactly which alerts you want to receive.",
      },
      {
        title: "Monthly Reports",
        description: "Full spending summary delivered to your chat.",
      },
      {
        title: "No App Needed",
        description: "Get updates without opening MoneyStyle.",
      },
    ],
    ogPhone: {
      title: "Telegram",
      items: ["Budget: Dining 82%", "Due: Car Loan Mar 15", "Daily: $64 spent", "Tip: Save $85 on dining", "Report: Feb summary"],
      resultLabel: "Alerts",
      resultValue: "Real-time",
    },
  },
  {
    slug: "sms-import",
    title: "SMS Import",
    headline: "Bank SMS to",
    headlineAccent: "Transactions",
    tagline:
      "Parse bank SMS messages with custom regex patterns to automatically create transactions. Works with any bank, any country, any format.",
    badge: "SMS Import",
    color: "fuchsia-500",
    hex: "#d946ef",
    hexSecondary: "#c026d3",
    steps: [
      {
        title: "Set Up Patterns",
        description:
          "Define regex patterns for your bank's SMS format. MoneyStyle includes common templates for popular banks.",
        items: [
          { label: "Bank", value: "Your Bank Name" },
          { label: "Pattern", value: "Custom Regex" },
          { label: "Templates", value: "50+ banks" },
          { label: "Format", value: "Any language", highlight: true },
        ],
      },
      {
        title: "SMS Auto-Parsed",
        description:
          "When you receive a bank SMS, MoneyStyle extracts the amount, merchant, date, and account automatically.",
        items: [
          { label: "SMS received", value: "Purchase $45.80" },
          { label: "Amount", value: "$45.80" },
          { label: "Merchant", value: "FreshMart" },
          { label: "Parsed", value: "Automatically", highlight: true },
        ],
      },
      {
        title: "Transactions Created",
        description:
          "Parsed SMS messages become draft transactions. Review and confirm, or set trusted patterns to auto-approve.",
        items: [
          { label: "Draft created", value: "FreshMart $45.80" },
          { label: "Category", value: "Auto: Groceries" },
          { label: "Auto-approve", value: "Trusted patterns" },
          { label: "This month", value: "23 auto-created", highlight: true },
        ],
      },
    ],
    benefits: [
      {
        title: "Any Bank",
        description: "Custom regex means it works with any bank worldwide.",
      },
      {
        title: "Auto-Create",
        description: "Transactions appear without manual entry.",
      },
      {
        title: "Multi-Language",
        description: "Parse SMS in English, Arabic, Farsi, or any language.",
      },
      {
        title: "Privacy-First",
        description: "SMS parsed locally on your server. No third-party access.",
      },
    ],
    ogPhone: {
      title: "SMS Import",
      items: ["Purchase: $45.80", "Transfer: $500.00", "Withdrawal: $200", "Payment: $65.00", "Deposit: $4,200"],
      resultLabel: "Auto-created",
      resultValue: "23 this mo.",
    },
  },
];

export function getFeature(slug: string): FeatureConfig | undefined {
  return FEATURES.find((f) => f.slug === slug);
}

export function getAllSlugs(): string[] {
  return FEATURES.map((f) => f.slug);
}
