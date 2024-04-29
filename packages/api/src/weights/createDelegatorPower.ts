import { Address } from 'viem'

import filterEdges from './graph/filterEdges'
import toAcyclical from './graph/toAcyclical'
import filterNoEdge from './graph/filterNoEdge'
import cascade from './cascade'
import proportionally from 'src/fns/proportionally'

import { Scores, Weights } from 'src/types'

export default function createDelegatorPower({
  delegatorWeights,
  scores,
  alreadyVoted,
}: {
  delegatorWeights: Weights<bigint>
  scores: Scores
  alreadyVoted?: Address[]
}) {
  const [cascadedDelegatorWeights] = [delegatorWeights]
    // filter the already voted addresses
    .map((weights) =>
      alreadyVoted ? filterEdges(weights, alreadyVoted) : weights
    )
    // break any cycle that may exist
    .map((weights) => toAcyclical(weights))
    // remove any empty node that may linger
    .map((weights) => filterNoEdge(weights))
    // cascade edges such that all delegators are resolved to a leaf
    // this is possible because we already guaranteed there are no cycles
    .map((weights) => cascade(weights))

  const distribution: Weights<number> = {}
  for (const delegator of Object.keys(cascadedDelegatorWeights)) {
    distribution[delegator] = distribute(
      delegatorWeights[delegator],
      scores[delegator]
    )
  }
  return distribution
}

function distribute(
  bag: Record<string, bigint>,
  value: number
): Record<string, number> {
  const keys = Object.keys(bag).sort()
  const weights = keys.map((key) => bag[key])
  const result = proportionally(value, weights)
  return Object.fromEntries(keys.map((key, i) => [key, result[i]]))
}
