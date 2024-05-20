import basisPoints from '../fns/basisPoints'
import delegatorTree from './delegatorTree'
import distribute from '../fns/distribute'

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

  return (
    Object.keys(weights[address])
      // exclude self referencing edges, these are not delegates
      .filter((delegate) => address != delegate)
      .map((delegate) => ({
        delegate,
        weight: weight(weights, address, delegate),
        delegatedPower: distribute(weights[address]!, availablePower)[
          delegate
        ]!,
        children: delegateTree({
          weights,
          rweights,
          scores,
          address: delegate,
        }),
      }))
  )
}

function weight(weights: Graph, from: string, to: string) {
  return basisPoints(
    weights[from][to]!,
    Object.values(weights[from]).reduce((p, v) => p + v, 0)
  )
}
