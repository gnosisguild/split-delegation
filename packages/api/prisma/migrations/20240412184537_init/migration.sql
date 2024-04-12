-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('Set', 'Clear', 'Expiration', 'OptOut');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "kind" "EventKind" NOT NULL,
    "chainId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "space" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "delegates" TEXT[],
    "ratios" TEXT[],
    "optOut" BOOLEAN,
    "expiration" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "chainId" INTEGER NOT NULL,
    "contract" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("chainId","contract")
);

-- CreateIndex
CREATE INDEX "Event_space_idx" ON "Event"("space");

-- CreateIndex
CREATE INDEX "Event_account_idx" ON "Event"("account");
