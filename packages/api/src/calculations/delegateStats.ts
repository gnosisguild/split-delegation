import { DelegationGraph, Scores, Weights } from '../types'
import calculateAddressView from './addressView'

export type DelegateStats = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function delegateStats({
  weights,
  delegations,
  scores,
  totalSupply,
}: {
  weights: Weights
  delegations: DelegationGraph
  scores: Scores
  totalSupply: number
}): DelegateStats[] {
  const delegators = Object.keys(weights)
  const delegates = Array.from(
    new Set(
      Object.values(weights)
        .map((value) => Object.keys(value))
        .flat()
    )
  )

  return delegates
    .map((delegate) =>
      calculateAddressView({
        delegations,
        scores,
        totalDelegators: delegators.length,
        totalSupply,
        address: delegate,
      })
    )
    .map(
      ({
        address,
        votingPower,
        delegators,
        percentOfVotingPower,
        percentOfDelegators,
      }) => ({
        address,
        delegatorCount: delegators.length,
        percentOfDelegators,
        votingPower,
        percentOfVotingPower,
      })
    )
}

export function orderByCount(a: DelegateStats, b: DelegateStats) {
  return a.delegatorCount > b.delegatorCount ? -1 : 1
}
export function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}
