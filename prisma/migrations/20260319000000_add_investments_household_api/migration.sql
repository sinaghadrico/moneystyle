-- Reserve investment fields
ALTER TABLE "reserves" ADD COLUMN "ticker" TEXT;
ALTER TABLE "reserves" ADD COLUMN "quantity" DECIMAL(12, 6);
ALTER TABLE "reserves" ADD COLUMN "purchasePrice" DECIMAL(12, 2);

-- Developer API key
ALTER TABLE "app_settings" ADD COLUMN "developerApiKey" TEXT;

-- Household models
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "household_members" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "household_invites" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "household_members_householdId_userId_key" ON "household_members"("householdId", "userId");
CREATE INDEX "household_members_userId_idx" ON "household_members"("userId");
CREATE UNIQUE INDEX "household_invites_token_key" ON "household_invites"("token");
CREATE INDEX "household_invites_token_idx" ON "household_invites"("token");
CREATE INDEX "household_invites_householdId_idx" ON "household_invites"("householdId");

ALTER TABLE "household_members" ADD CONSTRAINT "household_members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "household_invites" ADD CONSTRAINT "household_invites_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "household_invites" ADD CONSTRAINT "household_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
