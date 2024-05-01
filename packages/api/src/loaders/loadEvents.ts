import { DelegationEvent } from '@prisma/client'
import spaceId from '../../src/fns/spaceId'

import prisma from '../../prisma/singleton'

export default async function loadEvents({
  space,
  blockNumber,
}: {
  space: string
  blockNumber: number
}): Promise<DelegationEvent[]> {
  return prisma.delegationEvent.findMany({
    where: { spaceId: spaceId(space), blockNumber: { lte: blockNumber } },
    orderBy: { blockTimestamp: 'asc' },
  })
}
