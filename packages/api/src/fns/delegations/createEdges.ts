import { Address } from 'viem'
import { DelegationEdge, Registry } from './types'

export default function createEdges(
  registry: Registry,
  when: number
): DelegationEdge[] {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  type Entries = [string, { delegate: Address; weight: number }[]]
  const isExpired = (expiration: number) => expiration != 0 && expiration < when

  return (
    Object.entries(registry)
      // filter expired delegations
      .map(
        ([delegator, { delegation, expiration }]) =>
          [delegator, isExpired(expiration) ? [] : delegation] as Entries
      )
      // filter opted out addresses
      .map(
        ([delegator, delegation]) =>
          [
            delegator,
            delegation.filter(({ delegate }) => !optedOut.has(delegate)),
          ] as Entries
      )
      .flatMap(([delegator, delegation]) =>
        delegation.map(({ delegate, weight }) => ({
          delegator,
          delegate,
          weight,
        }))
      )
  )
}
