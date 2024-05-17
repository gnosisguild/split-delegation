import calculateVotingPower from './votingPower'

import { DelegationGraph, Scores } from '../types'

export default function addressStats({
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
  const votingPower = calculateVotingPower({ delegations, scores, address })

  const delegators = isDelegatorOrDelegate
    ? delegations[address].incoming.map(
        ({ address: delegator, direct, ratio }) => ({
          address: delegator,
          direct,
          delegatedPower: ratio * scores[delegator]!,
          percentPowerIn: basisPoints(ratio * scores[delegator]!, votingPower),
        })
      )
    : []

  const delegates = isDelegatorOrDelegate
    ? delegations[address].outgoing.map(
        ({ address: delegate, direct, ratio }) => ({
          address: delegate,
          direct,
          delegatedPower: ratio * votingPower,
          percentPowerOut: basisPoints(ratio * votingPower, votingPower),
        })
      )
    : []

  return {
    address,
    votingPower: votingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    percentOfDelegators: basisPoints(delegators.length, totalDelegators),
    delegators,
    delegates,
  }
}

function basisPoints(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
