-- CreateTable
CREATE TABLE "sms_patterns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regex" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "amountCaptureGroup" INTEGER NOT NULL DEFAULT 1,
    "merchantCaptureGroup" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "creditKeywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_patterns_name_key" ON "sms_patterns"("name");

-- CreateIndex
CREATE INDEX "sms_patterns_priority_idx" ON "sms_patterns"("priority");
