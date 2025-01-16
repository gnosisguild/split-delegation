import basisPoints from '../fns/basisPoints'
import reachable from '../fns/graph/reachable'

import calculateVotingPower from './votingPower'
import extractExpiration from './expiration'

import { DelegationDAGs, Scores } from '../types'

export default function addressStats({
  dags,
  scores,
  totalSupply,
  address,
  allDelegators,
}: {
  dags: DelegationDAGs
  scores: Scores
  totalSupply: number
  address: string
  allDelegators?: string[]
}) {
  const { votingPower, incomingPower, outgoingPower } = calculateVotingPower({
    dags,
    scores,
    address,
  })

  // all delegators in the space
  const allDelegatorCount = allDelegators
    ? allDelegators.length
    : Object.keys(dags.forward).length

  // delegators to address
  const delegatorCount = reachable(dags.reverse, address).length

  return {
    address,
    expiration: extractExpiration({
      delegations: dags.forward,
      delegator: address,
    }),
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    delegatorCount,
    percentOfDelegators: basisPoints(delegatorCount, allDelegatorCount),
  }
}
