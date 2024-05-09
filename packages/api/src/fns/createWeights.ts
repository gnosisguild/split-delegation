import { Address } from 'viem'
import { Registry, Weights } from '../types'

export default function createWeights(
  registry: Registry,
  when: number
): Weights<bigint> {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  const entries = Object.entries(registry)
    .map(([delegator, { delegation, expiration }]) => {
      const isExpired = expiration != 0 && expiration < when
      return [delegator, isExpired ? [] : delegation] as [
        string,
        { delegate: Address; ratio: bigint }[],
      ]
    })
    .map(([delegator, delegation]) => {
      return [
        delegator,
        delegation.filter(({ delegate }) => !optedOut.has(delegate)),
      ] as [string, { delegate: Address; ratio: bigint }[]]
    })
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
