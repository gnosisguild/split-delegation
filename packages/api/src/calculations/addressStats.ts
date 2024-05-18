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

  const delegatorCount = reachable(rweights, address).length

  return {
    address,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    delegatorCount,
    percentOfDelegators: basisPoints(delegatorCount, allDelegatorCount),
  }
}
