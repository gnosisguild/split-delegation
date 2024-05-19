import basisPoints from '../fns/basisPoints'
import delegatorTree from './delegatorTree'
import distribute from '../fns/distribute'

import { Graph, Scores } from '../types'

export type DelegateTreeNode = {
  delegate: string
  percentDelegatedPower: number
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
  const parents = delegatorTree({
    weights,
    rweights,
    scores,
    address,
  })
  const availablePower =
    scores[address]! +
    parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

  return Object.keys(weights[address] || {}).map((delegate) => {
    const delegatedPower = distribute(weights[address]!, availablePower)[
      delegate
    ]!

    return {
      delegate,
      delegatedPower,
      percentDelegatedPower: basisPoints(delegatedPower, availablePower),
      children: delegateTree({ weights, rweights, scores, address: delegate }),
    }
  })
}
