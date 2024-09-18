import { DelegationEvent } from '@prisma/client'
import spaceId from '../fns/spaceId'

import prisma from '../../prisma/singleton'

export default async function loadEvents({
  space,
  blockTimestamp,
}: {
  space: string
  blockTimestamp: number
}): Promise<DelegationEvent[]> {
  return prisma.delegationEvent.findMany({
    where: {
      spaceId: spaceId(space),
      blockTimestamp: { lte: blockTimestamp },
    },
    orderBy: { blockTimestamp: 'asc' },
  })
}
