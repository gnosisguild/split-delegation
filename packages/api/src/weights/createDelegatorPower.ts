import { Address } from 'viem'

import { distribute } from 'src/fns/bag'
import cascade from './cascade'
import filterEdges from './graph/filterEdges'
import filterNoEdge from './graph/filterNoEdge'
import toAcyclical from './graph/toAcyclical'

import { Scores, Weights } from 'src/types'

/**
 * Creates a delegator power distribution based on the provided delegator
 * weights, scores, and optional list of already voted addresses.
 *
 * Every address marked as already voted, will be removed from the delegator
 * list.
 */
export default function createDelegatorPower({
  delegatorWeights,
  scores,
  alreadyVoted,
}: {
  delegatorWeights: Weights<bigint>
  scores: Scores
  alreadyVoted?: Address[]
}) {
  // Filter out the already voted addresses from the delegator weights
  const [cascadedDelegatorWeights] = [delegatorWeights]
    .map((weights) =>
      alreadyVoted ? filterEdges(weights, alreadyVoted) : weights
    )
    // Break any potential cycles in the delegator weights
    .map((weights) => toAcyclical(weights))
    // Remove any empty nodes that may remain after cycle busting
    .map((weights) => filterNoEdge(weights))
    // Cascade all delegators, such that they point to delegate leaf nodes
    .map((weights) => cascade(weights))

  const distribution: Weights<number> = {}
  for (const delegator of Object.keys(cascadedDelegatorWeights)) {
    // Distribute each delegator raw score to delegates, based on cascaded weights
    distribution[delegator] = Object.fromEntries(
      distribute(delegatorWeights[delegator], scores[delegator])
    )
  }
  return distribution
}
