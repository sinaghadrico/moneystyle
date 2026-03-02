-- CreateTable
CREATE TABLE "money_advices" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "emergencyFundNeeded" DOUBLE PRECISION NOT NULL,
    "emergencyFundCurrent" DOUBLE PRECISION NOT NULL,
    "investableAmount" DOUBLE PRECISION NOT NULL,
    "suggestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "money_advices_pkey" PRIMARY KEY ("id")
);
