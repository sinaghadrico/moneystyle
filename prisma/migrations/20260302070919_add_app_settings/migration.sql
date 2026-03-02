-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "defaultPageSize" INTEGER NOT NULL DEFAULT 20,
    "defaultAccountId" TEXT,
    "defaultTransactionType" TEXT NOT NULL DEFAULT 'expense',
    "defaultDashboardPeriod" TEXT NOT NULL DEFAULT '3m',
    "autoCategorize" BOOLEAN NOT NULL DEFAULT true,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramBotToken" TEXT,
    "telegramWebhookSecret" TEXT,
    "telegramChatId" TEXT,
    "smsApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
