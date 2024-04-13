-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('Set', 'Clear', 'Expiration', 'OptOut');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "registry" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "blockTimestamp" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "space" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "kind" "EventKind" NOT NULL,
    "topics" TEXT[],
    "data" TEXT[],

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Event_space_idx" ON "Event"("space");

-- CreateIndex
CREATE INDEX "Event_account_idx" ON "Event"("account");
