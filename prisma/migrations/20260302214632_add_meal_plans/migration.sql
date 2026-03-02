-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);
