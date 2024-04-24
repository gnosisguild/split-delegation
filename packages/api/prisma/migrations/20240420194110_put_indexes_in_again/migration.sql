-- CreateIndex
CREATE INDEX "DelegationEvent_spaceId_idx" ON "DelegationEvent"("spaceId");

-- CreateIndex
CREATE INDEX "DelegationEvent_blockNumber_idx" ON "DelegationEvent"("blockNumber");

-- CreateIndex
CREATE INDEX "DelegationEvent_blockTimestamp_idx" ON "DelegationEvent"("blockTimestamp");
