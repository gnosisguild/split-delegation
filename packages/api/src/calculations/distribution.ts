import assert from 'assert'
import basisPoints from '../fns/basisPoints'

import { DelegationDAG } from '../types'

export default function distribution({
  delegation,
  delegator,
  delegate,
  availablePower,
}: {
  delegation: DelegationDAG
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
): [string, number][] {
  const total = sum(Object.values(bag))

  let accumulated = 0
  return Object.entries(bag).map(([address, { weight }], index, arr) => {
    const isLast = index === arr.length - 1
    const exactAmount = (weight * value) / total
    const actualAmount = isLast ? value - accumulated : exactAmount
    accumulated += exactAmount
    return [address, actualAmount] as [string, number]
  })
}
function sum(entries: { weight: number }[]): number {
  return entries.reduce((result, { weight }) => result + weight, 0)
}
