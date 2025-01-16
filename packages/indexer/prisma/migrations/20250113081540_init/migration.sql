-- CreateTable
CREATE TABLE "DelegationEvent" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "registry" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "spaceId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "topics" TEXT[],
    "data" TEXT NOT NULL,

    CONSTRAINT "DelegationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "chainId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("chainId")
);

-- CreateIndex
CREATE INDEX "DelegationEvent_spaceId_idx" ON "DelegationEvent"("spaceId");

-- CreateIndex
CREATE INDEX "DelegationEvent_blockNumber_idx" ON "DelegationEvent"("blockNumber");

-- CreateIndex
CREATE INDEX "DelegationEvent_blockTimestamp_idx" ON "DelegationEvent"("blockTimestamp");
