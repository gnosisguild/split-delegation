import { Address } from 'viem'
import { Registry, Weights } from '../types'

export default function createWeights(
  registry: Registry,
  when: number
): Weights<bigint> {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  type Entries = [string, { delegate: Address; ratio: bigint }[]]
  const isExpired = (expiration: number) => expiration != 0 && expiration < when

  const entries = Object.entries(registry)
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
    // exclude empty bags
    .filter(([, delegation]) => delegation.length > 0)

  const result: Weights<bigint> = {}
  for (const [delegator, delegation] of entries) {
    result[delegator] = {}
    for (const { delegate, ratio } of delegation) {
      result[delegator][delegate] = ratio
    }
  }
  return result
}
