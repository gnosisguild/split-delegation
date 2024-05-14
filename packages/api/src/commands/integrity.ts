import { DelegationEvent } from '@prisma/client'

import { eventId } from '../fns/createEntities'
import { timerEnd, timerStart } from '../fns/timer'
import prefix from '../fns/prefix'

import prisma from '../../prisma/singleton'

export default async function () {
  const start = timerStart()
  console.info(`${prefix('Integrity')} Starting...`)

  let total = 0
  let correct = 0

  const cursor = createCursor()
  for (;;) {
    const event = await cursor()
    if (!event) {
      break
    }

    total++
    if (eventId(event) == event.id) {
      correct++
    } else {
      console.error(`${prefix('Integrity')} Event ${event.id} is corrupted`)
    }
  }

  console.info(
    `${prefix('Integrity')} Done, ${total} events ${correct} correct, ${timerEnd(start)}ms`
  )
}

function createCursor() {
  let pending: DelegationEvent[] = []
  let total = 0

  const load = async () => {
    pending = await prisma.delegationEvent.findMany({
      take: 1000,
      skip: total,
      orderBy: { blockTimestamp: 'asc' },
    })

    total += pending.length
  }

  return async function (): Promise<DelegationEvent | null> {
    if (pending.length == 0) {
      await load()
    }

    return pending.shift() || null
  }
}
