-- CreateTable
CREATE TABLE "reserve_snapshots" (
    "id" TEXT NOT NULL,
    "reserveId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reserve_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reserve_snapshots_reserveId_idx" ON "reserve_snapshots"("reserveId");

-- AddForeignKey
ALTER TABLE "reserve_snapshots" ADD CONSTRAINT "reserve_snapshots_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "reserves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
