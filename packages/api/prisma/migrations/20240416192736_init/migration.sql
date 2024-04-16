-- CreateTable
CREATE TABLE "DelegationEvent" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "registry" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "spaceId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "topics" TEXT[],
    "data" TEXT NOT NULL,

    CONSTRAINT "DelegationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DelegationEvent_spaceId_idx" ON "DelegationEvent"("spaceId");

-- CreateIndex
CREATE INDEX "DelegationEvent_account_idx" ON "DelegationEvent"("account");
