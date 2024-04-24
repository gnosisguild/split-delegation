import parseRows from 'src/fns/parseRows'

import prisma from '../../prisma/singleton'
import spaceId from 'src/fns/spaceId'
import { DelegationEvent } from '@prisma/client'

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
