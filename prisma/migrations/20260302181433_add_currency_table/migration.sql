-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rateToUsd" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- Seed currencies
INSERT INTO currencies (id, code, name, symbol, "rateToUsd", "isActive", "createdAt", "updatedAt") VALUES
  ('cur_aed', 'AED', 'UAE Dirham', 'د.إ', 0.2723, true, NOW(), NOW()),
  ('cur_usd', 'USD', 'US Dollar', '$', 1.0, true, NOW(), NOW()),
  ('cur_eur', 'EUR', 'Euro', '€', 1.0838, true, NOW(), NOW()),
  ('cur_gbp', 'GBP', 'British Pound', '£', 1.2614, true, NOW(), NOW()),
  ('cur_irr', 'IRR', 'Iranian Rial', '﷼', 0.0000168, true, NOW(), NOW()),
  ('cur_sar', 'SAR', 'Saudi Riyal', 'ر.س', 0.2667, true, NOW(), NOW()),
  ('cur_try', 'TRY', 'Turkish Lira', '₺', 0.02778, true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
