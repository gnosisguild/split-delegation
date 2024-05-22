import assert from 'assert'
import basisPoints from '../fns/basisPoints'

import { Graph } from '../types'

export default function distribution({
  weights,
  delegator,
  delegate,
  availablePower,
}: {
  weights: Graph
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

  const head = result.slice(0, -1)
  const last = [
    result[result.length - 1][0],
    value - sum(head.map(([, v]) => v)),
  ] as [string, number]

  return [...head, last]
}

function sum(values: number[]): number {
  return values.reduce((p, n) => p + n, 0)
}
