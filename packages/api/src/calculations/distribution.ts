import assert from 'assert'
import basisPoints from '../fns/basisPoints'

import { Graph } from '../types'

export default function distribution({
  weights,
  delegator,
  delegate,
  availablePower,
}: {
  weights: Graph<number>
  delegator: string
  delegate: string
  availablePower: number
}) {
  assert(typeof weights[delegator][delegate] == 'number')

  const [, distributedPower] = distributeValueProportionally(
    weights[delegator],
    availablePower
  ).find(([address]) => address == delegate)!

  const weight = weights[delegator][delegate]
  const total = sum(Object.values(weights[delegator]))

  return {
    weightInBasisPoints: basisPoints(weight, total),
    distributedPower,
  }
}

function distributeValueProportionally(
  bag: Record<string, number>,
  value: number
) {
  const total = sum(Object.values(bag))

  const result = Object.entries(bag).map(([address, weight]) => [
    address,
    (weight * value) / total,
  ]) as [string, number][]

  const remaining = value - result.reduce((a, [, b]) => a + b, 0)

  // add the remainder to last entry
  result[result.length - 1][1] += remaining
  return result
}

function sum(values: number[]): number {
  return values.reduce((p, n) => p + n, 0)
}
