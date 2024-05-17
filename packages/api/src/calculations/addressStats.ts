import assert from 'assert'
import { allDelegators } from './participants'
import calculateVotingPower from './votingPower'

import { DelegationDAG, Scores } from '../types'

export default function addressStats({
  delegations,
  scores,
  totalSupply,
  address,
}: {
  delegations: DelegationDAG
  scores: Scores
  totalSupply: number
  address: string
}) {
  const { incoming, outgoing } = delegations[address] || {
    incoming: [],
    outgoing: [],
  }

  assert(
    Array.isArray(incoming) && Array.isArray(outgoing),
    'Broken Address Stats'
  )

  const votingPower = calculateVotingPower({ delegations, scores, address })

  const delegators = incoming.map(({ address: delegator, direct, ratio }) => ({
    address: delegator,
    direct,
    delegatedPower: ratio * scores[delegator]!,
    percentPowerIn: basisPoints(ratio * scores[delegator]!, votingPower),
  }))

  const delegates = outgoing.map(({ address: delegate, direct, ratio }) => ({
    address: delegate,
    direct,
    delegatedPower: ratio * votingPower,
    percentPowerOut: basisPoints(ratio * votingPower, votingPower),
  }))

  const delegatedPower = delegates
    .filter(({ direct }) => direct == true)
    .map(({ delegatedPower }) => delegatedPower)
    .reduce((p, v) => p + v, 0)

  // delegated power is subset of votingPower
  assert(delegatedPower <= votingPower)

  return {
    address,
    votingPower: votingPower,
    delegatedPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    percentOfDelegators: basisPoints(
      delegators.length,
      allDelegators(delegations).length
    ),
    delegators,
    delegates,
  }
}

function basisPoints(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
