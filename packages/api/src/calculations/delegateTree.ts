import assert from 'assert'

import distribute from '../fns/distribute'
import incomingPower from './incomingPower'
import { Graph, Scores } from 'src/types'

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
  const availablePower =
    scores[address]! + incomingPower({ weights, rweights, scores, address })
  assert(typeof availablePower == 'number')

  return Object.keys(weights[address] || {}).map((delegate) => {
    const delegatedPower = distribute(weights[address]!, availablePower)[
      delegate
    ]
    assert(typeof delegatedPower == 'number')

    return {
      delegate,
      delegatedPower,
      percentDelegatedPower: basisPoints(delegatedPower, availablePower),
      children: delegateTree({ weights, rweights, scores, address: delegate }),
    }
  })
}

function basisPoints(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
