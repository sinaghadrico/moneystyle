-- AlterTable
ALTER TABLE "transaction_items" ADD COLUMN     "normalizedName" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "item_groups" (
    "id" TEXT NOT NULL,
    "canonicalName" TEXT NOT NULL,
    "rawNames" TEXT[],
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_groups_canonicalName_key" ON "item_groups"("canonicalName");

-- CreateIndex
CREATE INDEX "transaction_items_normalizedName_idx" ON "transaction_items"("normalizedName");
