import assert from 'assert'

import basisPoints from '../fns/basisPoints'
import distribute from '../fns/distribute'
import incomingPower from './incomingPower'

import { Graph, Scores } from '../types'

export type DelegatorTreeNode = {
  delegator: string
  percentDelegatedPower: number
  delegatedPower: number
  parents: DelegatorTreeNode[]
}

export default function delegatorTree({
  weights,
  rweights,
  scores,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  address: string
}): DelegatorTreeNode[] {
  return Object.keys(rweights[address] || {}).map((delegator) => {
    const availablePower: number =
      scores[delegator]! +
      incomingPower({ weights, rweights, scores, address: delegator })
    assert(typeof availablePower == 'number')

    const delegatedPower = distribute(weights[delegator]!, availablePower)[
      address
    ]
    assert(typeof delegatedPower == 'number')

    return {
      delegator,
      delegatedPower,
      percentDelegatedPower: basisPoints(delegatedPower, availablePower),
      parents: delegatorTree({ weights, rweights, scores, address: delegator }),
    }
  })
}
