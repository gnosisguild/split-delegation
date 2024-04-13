-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('Set', 'Clear', 'Expiration', 'OptOut');

-- CreateTable
CREATE TABLE "RegistryV2Event" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "registry" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "space" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "topics" TEXT[],
    "data" TEXT NOT NULL,

    CONSTRAINT "RegistryV2Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "chainId" INTEGER NOT NULL,
    "registry" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("chainId","registry")
);

-- CreateIndex
CREATE INDEX "RegistryV2Event_space_idx" ON "RegistryV2Event"("space");

-- CreateIndex
CREATE INDEX "RegistryV2Event_account_idx" ON "RegistryV2Event"("account");
