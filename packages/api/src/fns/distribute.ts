import assert from 'assert'
import basisPoints from './basisPoints'

import { Graph } from '../types'

export default function distribute(
  weights: Graph,
  delegator: string,
  delegate: string,
  power: number
): Record<string, number> {
  assert(typeof weights[delegator][delegate] == 'number')

  const total = sum(Object.values(weights[delegator]))
  const [, distributedPower] = proportionally(weights[delegator], power).find(
    ([address]) => address == delegate
  )!

  return {
    weightInBasisPoints: basisPoints(weights[delegator][delegate], total),
    distributedPower,
  }
}

function proportionally(bag: Record<string, number>, value: number) {
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
