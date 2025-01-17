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

  const rows = await prisma.delegationEvent.findMany({
    where,
    orderBy: { blockTimestamp: 'asc' },
  })

  const sortedRows = assertSortOrder(rows.sort(sortDelegationEvents))

  return sortedRows
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

function sortDelegationEvents(a: DelegationEvent, b: DelegationEvent) {
  // First compare by blockNumber
  if (a.blockNumber !== b.blockNumber) {
    return a.blockNumber - b.blockNumber
  }

  // If blockNumbers are equal, compare by transactionIndex
  if (a.transactionIndex !== b.transactionIndex) {
    return a.transactionIndex - b.transactionIndex
  }

  // If both blockNumber and transactionIndex are equal, compare by logIndex
  return a.logIndex - b.logIndex
}

function assertSortOrder(events: DelegationEvent[]): DelegationEvent[] {
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]
    const curr = events[i]

    // Check blockNumber ordering
    if (prev.blockNumber > curr.blockNumber) {
      throw new Error(
        `Invalid blockNumber order at index ${i}: ${prev.blockNumber} > ${curr.blockNumber}`
      )
    }

    if (
      prev.blockNumber === curr.blockNumber &&
      prev.transactionIndex > curr.transactionIndex
    ) {
      throw new Error(
        `Invalid transactionIndex order at index ${i} (block ${curr.blockNumber}): ${prev.transactionIndex} > ${curr.transactionIndex}`
      )
    }

    if (
      prev.blockNumber === curr.blockNumber &&
      prev.transactionIndex === curr.transactionIndex &&
      prev.logIndex > curr.logIndex
    ) {
      throw new Error(
        `Invalid logIndex order at index ${i} (block ${curr.blockNumber}, tx ${curr.transactionIndex}): ${prev.logIndex} > ${curr.logIndex}`
      )
    }
  }
  return events
}
