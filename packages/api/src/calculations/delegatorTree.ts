import assert from 'assert'

import distribute from '../fns/distribute'
import incomingPower from './incomingPower'

import { Graph, Scores } from 'src/types'

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

function basisPoints(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
