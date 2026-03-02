-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openaiApiKey" TEXT;
