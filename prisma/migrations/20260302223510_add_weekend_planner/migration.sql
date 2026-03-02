-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "entertainment" TEXT[],
    "food" TEXT[],
    "likes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekend_plans" (
    "id" TEXT NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekend_plans_pkey" PRIMARY KEY ("id")
);
