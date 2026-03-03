-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "city" TEXT NOT NULL DEFAULT 'Dubai',
ADD COLUMN     "companionType" TEXT NOT NULL DEFAULT 'solo';

-- AlterTable
ALTER TABLE "weekend_plans" ADD COLUMN     "linkedTransactionIds" TEXT[],
ADD COLUMN     "ratings" JSONB;
