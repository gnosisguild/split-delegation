import { DelegationDAG } from 'src/types'

export function allParticipants(delegations: DelegationDAG): string[] {
  return Array.from(
    new Set([...allDelegators(delegations), ...allDelegates(delegations)])
  )
}

export function allDelegators(delegations: DelegationDAG): string[] {
  return Object.entries(delegations)
    .filter(([, bag]) => bag.outgoing.length > 0)
    .map(([address]) => address)
}

export function allDelegates(delegations: DelegationDAG): string[] {
  return Array.from(
    new Set(
      Object.values(delegations)
        .map((bag) => bag.outgoing.map(({ address }) => address))
        .flat()
    )
  )
}

export function inputsFor(
  delegations: DelegationDAG,
  addresses: string[]
): string[] {
  return Array.from(
    new Set([
      ...addresses,
      ...addresses
        .map(
          (address) =>
            delegations[address]?.incoming.map(({ address }) => address) || []
        )
        .flat(),
    ])
  )
}
