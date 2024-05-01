import { Address } from 'viem'
import { Scores } from 'src/types'

export type DelegateStats = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function delegateStats({
  address,
  totalSupply,
  delegatedPower,
  delegatorCount,
  scores,
}: {
  address?: Address
  totalSupply: number
  delegatedPower: Scores
  delegatorCount: Scores
  scores: Scores
}): DelegateStats[] {
  const allDelegatorCount = delegatorCount.all
  const computeFor = address ? [address] : Object.keys(delegatedPower)

  return computeFor
    .map((address) => ({
      address,
      delegatorCount: delegatorCount[address],
      votingPower: delegatedPower[address] + scores[address],
    }))
    .map(({ address, delegatorCount, votingPower }) => ({
      address,
      delegatorCount,
      percentOfDelegators: bps(delegatorCount, allDelegatorCount),
      votingPower,
      percentOfVotingPower: bps(votingPower, totalSupply),
    }))
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
