import delegatorTree from './delegatorTree'
import distribution from './distribution'

import { Graph, Scores } from '../types'

export type DelegateTreeNode = {
  delegate: string
  weight: number
  delegatedPower: number
  children: DelegateTreeNode[]
}
export default function delegateTree({
  weights,
  rweights,
  scores,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  address: string
}): DelegateTreeNode[] {
  if (!weights[address]) {
    return []
  }

  const parents = delegatorTree({
    weights,
    rweights,
    scores,
    address,
  })
  const availablePower =
    scores[address]! +
    parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

  return Object.keys(weights[address])
    .filter((delegate) => address != delegate) // exclude self referencing edges, these are not delegates
    .map((delegate) => {
      const { weightInBasisPoints, distributedPower } = distribution({
        weights,
        delegator: address,
        delegate,
        availablePower,
      })
      return {
        delegate,
        weight: weightInBasisPoints,
        delegatedPower: distributedPower,
        children: delegateTree({
          weights,
          rweights,
          scores,
          address: delegate,
        }),
      }
    })
}
