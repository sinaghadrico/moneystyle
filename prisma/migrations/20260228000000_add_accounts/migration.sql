-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_name_key" ON "accounts"("name");

-- Insert default account
INSERT INTO "accounts" ("id", "name", "bank", "color", "updatedAt")
VALUES ('default_farnoosh_mashreq', 'Farnoosh Mashreq', 'Mashreq', '#3b82f6', CURRENT_TIMESTAMP);

-- Add accountId column with default pointing to the inserted account
ALTER TABLE "transactions" ADD COLUMN "accountId" TEXT NOT NULL DEFAULT 'default_farnoosh_mashreq';

-- Drop the default after backfilling
ALTER TABLE "transactions" ALTER COLUMN "accountId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");
