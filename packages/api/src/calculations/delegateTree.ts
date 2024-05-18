import basisPoints from '../fns/basisPoints'
import distribute from '../fns/distribute'
import incomingPower from './incomingPower'

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
  const availablePower =
    scores[address]! + incomingPower({ weights, rweights, scores, address })

  const delegates = Object.keys(weights[address] || {})

  return delegates.map((delegate) => {
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
