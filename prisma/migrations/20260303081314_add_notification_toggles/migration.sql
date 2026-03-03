-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "notifyMonthlyReport" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyPaymentReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySmsTransaction" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyWebTransaction" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyWeekendPlan" BOOLEAN NOT NULL DEFAULT true;
