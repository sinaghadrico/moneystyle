-- CreateTable: users (must exist before adding foreign keys)
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: oauth_accounts
CREATE TABLE "oauth_accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable: sessions
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateTable: verification_tokens
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable: income_deposits
CREATE TABLE "income_deposits" (
    "id" TEXT NOT NULL,
    "incomeSourceId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    CONSTRAINT "income_deposits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "income_deposits_transactionId_key" ON "income_deposits"("transactionId");
CREATE INDEX "income_deposits_incomeSourceId_idx" ON "income_deposits"("incomeSourceId");

-- Create a migration placeholder user for existing data
INSERT INTO "users" ("id", "email", "name", "role", "updatedAt")
VALUES ('migration_user', 'admin@moneystyle.app', 'Admin', 'admin', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- DropIndex (old single-user unique indexes)
DROP INDEX IF EXISTS "accounts_name_key";
DROP INDEX IF EXISTS "ai_prompts_key_key";
DROP INDEX IF EXISTS "categories_name_key";
DROP INDEX IF EXISTS "item_groups_canonicalName_key";
DROP INDEX IF EXISTS "merchant_category_rules_pattern_key";
DROP INDEX IF EXISTS "notification_templates_key_key";
DROP INDEX IF EXISTS "persons_name_key";
DROP INDEX IF EXISTS "sms_patterns_name_key";
DROP INDEX IF EXISTS "tags_name_key";

-- Step 1: Add userId columns as NULLABLE
ALTER TABLE "accounts" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'bank', ADD COLUMN "userId" TEXT;
ALTER TABLE "ai_prompts" ADD COLUMN "userId" TEXT;
ALTER TABLE "app_settings" ADD COLUMN "userId" TEXT, ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "bills" ADD COLUMN "paymentInstructions" TEXT, ADD COLUMN "userId" TEXT;
ALTER TABLE "categories" ADD COLUMN "userId" TEXT;
ALTER TABLE "income_sources" ADD COLUMN "userId" TEXT;
ALTER TABLE "installments" ADD COLUMN "paymentInstructions" TEXT, ADD COLUMN "userId" TEXT;
ALTER TABLE "item_groups" ADD COLUMN "userId" TEXT;
ALTER TABLE "meal_plans" ADD COLUMN "userId" TEXT;
ALTER TABLE "merchant_category_rules" ADD COLUMN "userId" TEXT;
ALTER TABLE "money_advices" ADD COLUMN "userId" TEXT;
ALTER TABLE "notification_templates" ADD COLUMN "userId" TEXT;
ALTER TABLE "persons" ADD COLUMN "userId" TEXT;
ALTER TABLE "reserves" ADD COLUMN "userId" TEXT;
ALTER TABLE "savings_goals" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'AED', ADD COLUMN "description" TEXT, ADD COLUMN "userId" TEXT;
ALTER TABLE "shopping_lists" ADD COLUMN "userId" TEXT;
ALTER TABLE "sms_patterns" ADD COLUMN "userId" TEXT;
ALTER TABLE "tags" ADD COLUMN "userId" TEXT;
ALTER TABLE "transactions" ADD COLUMN "confirmed" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "userId" TEXT;
ALTER TABLE "user_preferences" ADD COLUMN "userId" TEXT, ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "weekend_plans" ADD COLUMN "userId" TEXT;
ALTER TABLE "bill_payments" ADD COLUMN "transactionId" TEXT;
ALTER TABLE "installment_payments" ADD COLUMN "transactionId" TEXT;

-- Step 2: Populate userId for existing data
UPDATE "accounts" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "ai_prompts" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "app_settings" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "bills" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "categories" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "income_sources" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "installments" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "item_groups" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "meal_plans" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "merchant_category_rules" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "money_advices" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "notification_templates" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "persons" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "reserves" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "savings_goals" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "shopping_lists" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "sms_patterns" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "tags" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "transactions" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "user_preferences" SET "userId" = 'migration_user' WHERE "userId" IS NULL;
UPDATE "weekend_plans" SET "userId" = 'migration_user' WHERE "userId" IS NULL;

-- Step 3: Set NOT NULL constraints
ALTER TABLE "accounts" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ai_prompts" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "app_settings" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "bills" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "income_sources" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "installments" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "item_groups" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "meal_plans" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "merchant_category_rules" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "money_advices" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "notification_templates" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "persons" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "reserves" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "savings_goals" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "shopping_lists" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "sms_patterns" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "tags" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "user_preferences" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "weekend_plans" ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Create indexes
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX "accounts_userId_name_key" ON "accounts"("userId", "name");
CREATE INDEX "ai_prompts_userId_idx" ON "ai_prompts"("userId");
CREATE UNIQUE INDEX "ai_prompts_userId_key_key" ON "ai_prompts"("userId", "key");
CREATE UNIQUE INDEX "app_settings_userId_key" ON "app_settings"("userId");
CREATE UNIQUE INDEX "bill_payments_transactionId_key" ON "bill_payments"("transactionId");
CREATE INDEX "bills_userId_idx" ON "bills"("userId");
CREATE INDEX "categories_userId_idx" ON "categories"("userId");
CREATE UNIQUE INDEX "categories_userId_name_key" ON "categories"("userId", "name");
CREATE INDEX "income_sources_userId_idx" ON "income_sources"("userId");
CREATE UNIQUE INDEX "installment_payments_transactionId_key" ON "installment_payments"("transactionId");
CREATE INDEX "installments_userId_idx" ON "installments"("userId");
CREATE INDEX "item_groups_userId_idx" ON "item_groups"("userId");
CREATE UNIQUE INDEX "item_groups_userId_canonicalName_key" ON "item_groups"("userId", "canonicalName");
CREATE INDEX "meal_plans_userId_idx" ON "meal_plans"("userId");
CREATE INDEX "merchant_category_rules_userId_idx" ON "merchant_category_rules"("userId");
CREATE UNIQUE INDEX "merchant_category_rules_userId_pattern_key" ON "merchant_category_rules"("userId", "pattern");
CREATE INDEX "money_advices_userId_idx" ON "money_advices"("userId");
CREATE INDEX "notification_templates_userId_idx" ON "notification_templates"("userId");
CREATE UNIQUE INDEX "notification_templates_userId_key_key" ON "notification_templates"("userId", "key");
CREATE INDEX "persons_userId_idx" ON "persons"("userId");
CREATE UNIQUE INDEX "persons_userId_name_key" ON "persons"("userId", "name");
CREATE INDEX "reserves_userId_idx" ON "reserves"("userId");
CREATE INDEX "savings_goals_userId_idx" ON "savings_goals"("userId");
CREATE INDEX "shopping_lists_userId_idx" ON "shopping_lists"("userId");
CREATE INDEX "sms_patterns_userId_idx" ON "sms_patterns"("userId");
CREATE UNIQUE INDEX "sms_patterns_userId_name_key" ON "sms_patterns"("userId", "name");
CREATE INDEX "tags_userId_idx" ON "tags"("userId");
CREATE UNIQUE INDEX "tags_userId_name_key" ON "tags"("userId", "name");
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");
CREATE INDEX "weekend_plans_userId_idx" ON "weekend_plans"("userId");

-- Step 5: Add foreign keys
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "merchant_category_rules" ADD CONSTRAINT "merchant_category_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "persons" ADD CONSTRAINT "persons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "item_groups" ADD CONSTRAINT "item_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sms_patterns" ADD CONSTRAINT "sms_patterns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "income_deposits" ADD CONSTRAINT "income_deposits_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "income_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "income_deposits" ADD CONSTRAINT "income_deposits_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "installments" ADD CONSTRAINT "installments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "money_advices" ADD CONSTRAINT "money_advices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weekend_plans" ADD CONSTRAINT "weekend_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
