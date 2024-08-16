import assert from 'assert'
import basisPoints from '../fns/basisPoints'

import { Graph } from '../types'

export default function distribution({
  delegation,
  delegator,
  delegate,
  availablePower,
}: {
  delegation: Graph<{ expiration: number; weight: number }>
  delegator: string
  delegate: string
  availablePower: number
}) {
  assert(typeof delegation[delegator][delegate].weight == 'number')

  const [, distributedPower] = distributeValueProportionally(
    delegation[delegator],
    availablePower
  ).find(([address]) => address == delegate)!

  const { weight, expiration } = delegation[delegator][delegate]!
  const total = sum(Object.values(delegation[delegator]))

  return {
    expiration,
    weightInBasisPoints: basisPoints(weight, total),
    distributedPower,
  }
}

function distributeValueProportionally(
  bag: Record<string, { expiration: number; weight: number }>,
  value: number
) {
  const total = sum(Object.values(bag))

  const result = Object.entries(bag).map(([address, { weight }]) => [
    address,
    (weight * value) / total,
  ]) as [string, number][]

  const remaining = value - result.reduce((a, [, b]) => a + b, 0)

  // add the remainder to last entry
  result[result.length - 1][1] += remaining
  return result
}

function sum(entries: { weight: number }[]): number {
  return entries.reduce((result, { weight }) => result + weight, 0)
}
