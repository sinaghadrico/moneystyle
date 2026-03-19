import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "MoneyStyle REST API documentation. Programmatic access to transactions, categories, and accounts with Bearer token authentication.",
  alternates: {
    canonical: "https://moneystyle.app/docs/api",
  },
};

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">MoneyStyle API Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          REST API for programmatic access to your MoneyStyle data.
        </p>
      </div>

      {/* Auth */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Authentication</h2>
        <p className="text-sm text-muted-foreground">
          All requests require a Bearer token. Generate your API key in{" "}
          <strong>Settings &rarr; Integrations &rarr; API</strong>.
        </p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`curl -H "Authorization: Bearer ms_your_api_key" \\
  https://moneystyle.app/api/v1/transactions`}
        </pre>
      </section>

      {/* Transactions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Transactions</h2>

        <Endpoint
          method="GET"
          path="/api/v1/transactions"
          description="List transactions with filtering, sorting, and pagination."
          params={[
            { name: "page", type: "number", desc: "Page number (default: 1)" },
            { name: "pageSize", type: "number", desc: "Items per page (default: 20, max: 100)" },
            { name: "sortBy", type: "string", desc: "Sort field: date, amount, type, merchant" },
            { name: "sortOrder", type: "string", desc: "asc or desc (default: desc)" },
            { name: "dateFrom", type: "string", desc: "ISO date filter (gte)" },
            { name: "dateTo", type: "string", desc: "ISO date filter (lte)" },
            { name: "type", type: "string", desc: "income, expense, transfer, other" },
            { name: "categoryId", type: "string", desc: "Filter by category ID" },
            { name: "accountId", type: "string", desc: "Filter by account ID" },
            { name: "merchant", type: "string", desc: "Case-insensitive substring match" },
            { name: "confirmed", type: "boolean", desc: "Filter by confirmation status" },
          ]}
          response={`{
  "data": [
    {
      "id": "clx...",
      "date": "2026-03-19T00:00:00.000Z",
      "amount": 45.99,
      "currency": "USD",
      "type": "expense",
      "merchant": "Amazon",
      "description": null,
      "source": "manual",
      "confirmed": true,
      "category": { "id": "...", "name": "Shopping", "color": "#f59e0b" },
      "account": { "id": "...", "name": "Cash", "type": "cash" },
      "tags": [{ "id": "...", "name": "Online", "color": "#6366f1" }],
      "createdAt": "2026-03-19T10:30:00.000Z"
    }
  ],
  "total": 142,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}`}
        />

        <Endpoint
          method="POST"
          path="/api/v1/transactions"
          description="Create a new transaction."
          body={`{
  "date": "2026-03-19",        // required
  "type": "expense",           // required: income, expense, transfer, other
  "accountId": "clx...",       // required
  "amount": 45.99,             // optional
  "currency": "USD",           // optional (default: your primary currency)
  "merchant": "Amazon",        // optional
  "description": "Books",      // optional
  "categoryId": "clx...",      // optional
  "tagIds": ["clx..."],        // optional
  "spreadMonths": null          // optional: 2-24
}`}
          response={`{
  "id": "clx...",
  "date": "2026-03-19T00:00:00.000Z",
  "amount": 45.99,
  "currency": "USD",
  "type": "expense",
  "merchant": "Amazon",
  "category": { "id": "...", "name": "Shopping", "color": "#f59e0b" },
  "account": { "id": "...", "name": "Cash", "type": "cash" },
  "createdAt": "2026-03-19T10:30:00.000Z"
}`}
        />

        <Endpoint
          method="GET"
          path="/api/v1/transactions/:id"
          description="Get a single transaction with line items."
        />

        <Endpoint
          method="PATCH"
          path="/api/v1/transactions/:id"
          description="Update a transaction. All fields optional."
          body={`{
  "amount": 50.00,
  "merchant": "Amazon Prime"
}`}
        />

        <Endpoint
          method="DELETE"
          path="/api/v1/transactions/:id"
          description="Delete a transaction."
        />
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Categories</h2>

        <Endpoint
          method="GET"
          path="/api/v1/categories"
          description="List all categories with transaction counts."
          response={`{
  "data": [
    { "id": "clx...", "name": "Groceries", "color": "#10b981", "icon": null, "transactionCount": 45 }
  ]
}`}
        />

        <Endpoint
          method="POST"
          path="/api/v1/categories"
          description="Create a category."
          body={`{ "name": "Groceries", "color": "#10b981" }`}
        />

        <Endpoint method="GET" path="/api/v1/categories/:id" description="Get a single category." />
        <Endpoint method="PATCH" path="/api/v1/categories/:id" description="Update a category." body={`{ "name": "Food", "color": "#22c55e" }`} />
        <Endpoint method="DELETE" path="/api/v1/categories/:id" description="Delete a category." />
      </section>

      {/* Accounts */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Accounts</h2>

        <Endpoint
          method="GET"
          path="/api/v1/accounts"
          description="List all accounts with transaction counts."
          response={`{
  "data": [
    { "id": "clx...", "name": "Cash", "type": "cash", "bank": null, "color": "#3b82f6", "icon": null, "transactionCount": 120 }
  ]
}`}
        />

        <Endpoint
          method="POST"
          path="/api/v1/accounts"
          description="Create an account."
          body={`{ "name": "Savings", "type": "bank", "bank": "Chase", "color": "#3b82f6" }`}
        />

        <Endpoint method="GET" path="/api/v1/accounts/:id" description="Get a single account." />
        <Endpoint method="PATCH" path="/api/v1/accounts/:id" description="Update an account." body={`{ "name": "Main Checking" }`} />
        <Endpoint method="DELETE" path="/api/v1/accounts/:id" description="Delete an account (must have 0 transactions)." />
      </section>

      {/* Errors */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Error Handling</h2>
        <p className="text-sm text-muted-foreground">All errors return JSON with an error field:</p>
        <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto">
{`// 401 Unauthorized
{ "error": "Invalid API key" }

// 404 Not Found
{ "error": "Transaction not found" }

// 422 Validation Error
{ "error": "date is required, type is required" }

// 409 Conflict
{ "error": "Category already exists" }`}
        </pre>
      </section>

      {/* Rate Limits */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Rate Limits</h2>
        <p className="text-sm text-muted-foreground">
          Currently no rate limits are enforced. Please be reasonable with your usage.
        </p>
      </section>
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  params,
  body,
  response,
}: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; desc: string }[];
  body?: string;
  response?: string;
}) {
  const methodColor: Record<string, string> = {
    GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    PATCH: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${methodColor[method] ?? ""}`}>
          {method}
        </span>
        <code className="text-sm font-mono">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {params && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Query Parameters:</p>
          <div className="grid gap-1">
            {params.map((p) => (
              <div key={p.name} className="flex items-baseline gap-2 text-xs">
                <code className="font-mono text-foreground">{p.name}</code>
                <span className="text-muted-foreground/60">{p.type}</span>
                <span className="text-muted-foreground">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {body && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Request Body:</p>
          <pre className="rounded bg-muted p-3 text-xs font-mono overflow-x-auto">{body}</pre>
        </div>
      )}
      {response && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Response:</p>
          <pre className="rounded bg-muted p-3 text-xs font-mono overflow-x-auto">{response}</pre>
        </div>
      )}
    </div>
  );
}
