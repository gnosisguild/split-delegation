import calculateVotingPower from './votingPower'
import reachable from '../fns/graph/reachable'

import { DelegatorTreeNode } from './delegatorTree'
import { DelegateTreeNode } from './delegateTree'
import { Graph, Scores } from '../types'

export type AddressStats = {
  address: string
  votingPower: number
  incomingPower: number
  outgoingPower: number
  delegators: string[]
  delegates: string[]
  delegatorTree: DelegatorTreeNode[]
  delegateTree: DelegateTreeNode[]
}

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

function basisPoints(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
