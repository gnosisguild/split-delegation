import basisPoints from '../fns/basisPoints'
import { DelegationGraph } from '../types'

export default function calculateAddressView({
  address,
  delegations,
  votingPower,
  totalDelegators,
  totalSupply,
}: {
  address: string
  delegations: DelegationGraph
  votingPower: Record<string, number>
  totalDelegators: number
  totalSupply: number
}) {
  const isDelegatorOrDelegate = !!delegations[address]

  const delegators = isDelegatorOrDelegate
    ? delegations[address].incoming
        .map(({ address: delegator, direct, ratio }) => ({
          address: delegator,
          direct,
          delegatedPower: ratio * votingPower[delegator],
        }))
        .map(({ delegatedPower, ...rest }) => ({
          ...rest,
          delegatedPower,
          percentPowerIn: basisPoints(delegatedPower, votingPower[address]),
        }))
    : []

  const delegates = isDelegatorOrDelegate
    ? delegations[address].outgoing
        .map(({ address: delegate, direct, ratio }) => ({
          address: delegate,
          direct,
          delegatedPower: ratio * votingPower[address],
        }))
        .map(({ delegatedPower, ...rest }) => ({
          ...rest,
          delegatedPower,
          percentPowerOut: basisPoints(delegatedPower, votingPower[address]),
        }))
    : []

  return {
    votingPower: votingPower[address],
    percentOfVotingPower: basisPoints(votingPower[address], totalSupply),
    percentOfDelegators: basisPoints(delegators.length, totalDelegators),
    delegators,
    delegates,
  }
}
