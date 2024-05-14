import { DelegationEvent } from '@prisma/client'

export function compare({
  prev,
  next,
}: {
  prev: DelegationEvent[]
  next: DelegationEvent[]
}) {
  return {
    create: next.filter(
      (nextEntry) => !prev.some((prevEntry) => nextEntry.id === prevEntry.id)
    ),
    delete: prev.filter(
      (prevEntry) => !next.some((nextEntry) => prevEntry.id === nextEntry.id)
    ),
  }
}
