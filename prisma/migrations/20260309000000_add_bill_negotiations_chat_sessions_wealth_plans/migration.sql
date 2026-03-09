-- CreateTable
CREATE TABLE "bill_negotiations" (
    "id" TEXT NOT NULL,
    "totalMonthlySavings" DOUBLE PRECISION NOT NULL,
    "totalYearlySavings" DOUBLE PRECISION NOT NULL,
    "recommendations" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wealth_plans" (
    "id" TEXT NOT NULL,
    "wealthScore" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "monthlySurplus" DOUBLE PRECISION NOT NULL,
    "investableCapital" DOUBLE PRECISION NOT NULL,
    "projections" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "completedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wealth_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bill_negotiations_userId_idx" ON "bill_negotiations"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "wealth_plans_userId_idx" ON "wealth_plans"("userId");

-- AddForeignKey
ALTER TABLE "bill_negotiations" ADD CONSTRAINT "bill_negotiations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wealth_plans" ADD CONSTRAINT "wealth_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
