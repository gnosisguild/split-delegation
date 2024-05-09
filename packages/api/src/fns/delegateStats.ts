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
    percentOfDelegators: bps(delegatorCount[address], allDelegatorCount),
    votingPower: votingPower[address],
    percentOfVotingPower: bps(votingPower[address], totalSupply),
  }))
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}

export function orderByCount(a: DelegateStats, b: DelegateStats) {
  return a.delegatorCount > b.delegatorCount ? -1 : 1
}
export function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}
