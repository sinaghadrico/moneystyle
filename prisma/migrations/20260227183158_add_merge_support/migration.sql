-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "mergedIntoId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_mergedIntoId_idx" ON "transactions"("mergedIntoId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
