import { Address } from 'viem'

import bfs from './fns/graph/bfs'
import filterVertices from './fns/graph/filterVertices'
import inverse from './fns/graph/inverse'
import kahn from './fns/graph/sort'
import toAcyclical from './fns/graph/toAcyclical'
import votingPower from './calculations/votingPower'

import { Scores, Weights } from '../src/types'

export default function compute({
  weights,
  scores,
  voters,
}: {
  weights: Weights<bigint>
  scores: Scores
  voters?: Address[]
}) {
  ;[weights] = [weights]
    // Filter out the addresses exercising voting right, from delegator weights
    .map((weights) => (voters ? filterVertices(weights, voters) : weights))
    // Break any potential cycles in the delegator weights
    .map((weights) => toAcyclical(weights))

  const order = kahn(weights)

  return {
    votingPower: votingPower({ weights, scores, order }),
    delegatorCount: delegatorCount({ weights, scores }),
  }
}

function delegatorCount({
  weights,
  scores,
}: {
  weights: Weights<bigint>
  scores: Scores
}): Scores {
  const result: Scores = {
    all: Object.keys(weights).length,
  }

  const rweights = inverse(weights)
  for (const address of Object.keys(scores)) {
    result[address] = bfs(rweights, address).length
  }

  return result
}
