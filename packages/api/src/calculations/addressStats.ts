import basisPoints from '../fns/basisPoints'
import calculateVotingPower from './votingPower'
import reachable from '../fns/graph/reachable'

import { Graph, Scores } from '../types'

export default function addressStats({
  weights,
  rweights,
  scores,
  totalSupply,
  allDelegatorCount,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  totalSupply: number
  allDelegatorCount: number
  address: string
}) {
  const { votingPower, incomingPower, outgoingPower } = calculateVotingPower({
    weights,
    rweights,
    scores,
    address,
  })

  const delegators = reachable(rweights, address)
  const delegates = reachable(weights, address)

  return {
    address,
    votingPower: votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    percentOfDelegators: basisPoints(delegators.length, allDelegatorCount),
    delegators,
    delegates,
  }
}
