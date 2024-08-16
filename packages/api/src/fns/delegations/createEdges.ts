import { Address } from 'viem'
import { DelegationEdge, Registry } from './types'

export default function createEdges(
  registry: Registry,
  when: number
): DelegationEdge[] {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  type Entries = [string, { delegate: Address; weight: number }[], number]
  const isExpired = (expiration: number) => expiration != 0 && expiration < when

  return (
    Object.entries(registry)
      // filter expired delegations
      .map(
        ([delegator, { delegation, expiration }]) =>
          [
            delegator,
            isExpired(expiration) ? [] : delegation,
            expiration,
          ] as Entries
      )
      // filter opted out addresses
      .map(
        ([delegator, delegation, expiration]) =>
          [
            delegator,
            delegation.filter(({ delegate }) => !optedOut.has(delegate)),
            expiration,
          ] as Entries
      )
      .flatMap(([delegator, delegation, expiration]) =>
        delegation.map(({ delegate, weight }) => ({
          delegator,
          delegate,
          expiration,
          weight,
        }))
      )
  )
}
