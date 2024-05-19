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

  return Object.keys(weights[address]).map((delegate) => {
    const delegatedPower = distribute(weights[address]!, availablePower)[
      delegate
    ]!

    return {
      delegate,
      weight: basisPoints(delegatedPower, availablePower),
      delegatedPower,
      children: delegateTree({ weights, rweights, scores, address: delegate }),
    }
  })
}
