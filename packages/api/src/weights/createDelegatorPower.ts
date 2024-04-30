import { Address } from 'viem'

import { distribute } from 'src/fns/bag'
import cascade from './cascade'
import filterEdges from './graph/filterEdges'
import filterNoEdge from './graph/filterNoEdge'
import toAcyclical from './graph/toAcyclical'

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
    distribution[delegator] = Object.fromEntries(
      distribute(delegatorWeights[delegator], scores[delegator])
    )
  }
  return distribution
}
