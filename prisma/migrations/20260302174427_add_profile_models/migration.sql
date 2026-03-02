-- CreateTable
CREATE TABLE "income_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "depositDay" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserves" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "dueDay" INTEGER NOT NULL DEFAULT 1,
    "totalCount" INTEGER,
    "paidCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reminderDays" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);
