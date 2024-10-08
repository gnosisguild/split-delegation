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
  const realSpace = mapMaybeTestSpaceToRealSpace(space)

  const where = realSpace
    ? {
        spaceId: { in: [spaceId(space), spaceId(realSpace)] },
        blockTimestamp: { lte: blockTimestamp },
      }
    : {
        spaceId: spaceId(space),
        blockTimestamp: { lte: blockTimestamp },
      }

  return prisma.delegationEvent.findMany({
    where,
    orderBy: { blockTimestamp: 'asc' },
  })
}

/*
 * This function maps specific hardcoded test space names to their corresponding real event spaces.
 * It allows configured test cases to be hydrated with actual events from the real spaces.
 * By using this mapping, we can create test configurations that leverage real space data from the delegate registry.
 */
function mapMaybeTestSpaceToRealSpace(
  maybeTestSpace: string
): string | undefined {
  const spaceId = maybeTestSpace.trim().toLowerCase()

  const spaceMapping: Record<string, string> = {
    'safe.ggtest.eth': 'safe.eth',
    'cow.ggtest.eth': 'cow.eth',
    'cowtesting.eth': 'cow.eth',
  }

  return spaceMapping[spaceId]
}
