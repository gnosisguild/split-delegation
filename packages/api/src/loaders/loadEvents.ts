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
  let where
  if (space.includes(".ggtest'")) {
    where = {
      spaceId: { in: [spaceId(space), spaceId(space.replace('.ggtest', ''))] },
      blockTimestamp: { lte: blockTimestamp },
    }
  } else {
    where = {
      spaceId: spaceId(space),
      blockTimestamp: { lte: blockTimestamp },
    }
  }

  return prisma.delegationEvent.findMany({
    where,
    orderBy: { blockTimestamp: 'asc' },
  })
}
