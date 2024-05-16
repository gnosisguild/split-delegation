import { calculateForAddress as calculateVotingPower } from './votingPower'
import basisPoints from '../fns/basisPoints'

import { DelegationGraph, Scores } from '../types'

export default function calculateAddressView({
  delegations,
  scores,
  totalDelegators,
  totalSupply,
  address,
}: {
  delegations: DelegationGraph
  scores: Scores
  totalDelegators: number
  totalSupply: number
  address: string
}) {
  const isDelegatorOrDelegate = !!delegations[address]

  const delegators = isDelegatorOrDelegate
    ? delegations[address].incoming.map(
        ({ address: delegator, direct, ratio }) => ({
          address: delegator,
          direct,
          delegatedPower: ratio * scores[delegator]!,
          percentPowerIn: basisPoints(
            ratio * scores[delegator]!,
            scores[address]
          ),
        })
      )
    : []

  const delegates = isDelegatorOrDelegate
    ? delegations[address].outgoing.map(
        ({ address: delegate, direct, ratio }) => ({
          address: delegate,
          direct,
          delegatedPower: ratio * scores[address]!,
          percentPowerOut: basisPoints(
            ratio * scores[address]!,
            scores[address]!
          ),
        })
      )
    : []

  return {
    address,
    votingPower: calculateVotingPower({ delegations, scores, address }),
    percentOfVotingPower: basisPoints(scores[address], totalSupply),
    percentOfDelegators: basisPoints(delegators.length, totalDelegators),
    delegators,
    delegates,
  }
}
