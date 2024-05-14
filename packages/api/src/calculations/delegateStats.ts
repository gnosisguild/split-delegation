import basisPoints from '../fns/basisPoints'
import { Scores } from '../types'

export type DelegateStats = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function delegateStats({
  totalSupply,
  votingPower,
  delegatorCount,
}: {
  totalSupply: number
  votingPower: Scores
  delegatorCount: Scores
}): DelegateStats[] {
  const allDelegatorCount = delegatorCount.all
  return Object.keys(votingPower).map((address) => ({
    address,
    delegatorCount: delegatorCount[address],
    percentOfDelegators: basisPoints(
      delegatorCount[address],
      allDelegatorCount
    ),
    votingPower: votingPower[address],
    percentOfVotingPower: basisPoints(votingPower[address], totalSupply),
  }))
}

export function orderByCount(a: DelegateStats, b: DelegateStats) {
  return a.delegatorCount > b.delegatorCount ? -1 : 1
}
export function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}
