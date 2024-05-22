import basisPoints from '../fns/basisPoints'
import calculateVotingPower from './votingPower'
import reachable from '../fns/graph/reachable'

import { Delegations, Scores } from '../types'

export default function addressStats({
  delegations,
  scores,
  totalSupply,
  allDelegatorCount,
  address,
}: {
  delegations: Delegations
  scores: Scores
  totalSupply: number
  allDelegatorCount: number
  address: string
}) {
  const { votingPower, incomingPower, outgoingPower } = calculateVotingPower({
    delegations,
    scores,
    address,
  })

  const delegatorCount = reachable(delegations.reverse, address).length

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
