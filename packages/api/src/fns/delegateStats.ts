import { Address } from 'viem'
import { Scores } from '../../src/types'

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
  votingPower,
  delegatorCount,
}: {
  address?: Address
  totalSupply: number
  votingPower: Scores
  delegatorCount: Scores
}): DelegateStats[] {
  const allDelegatorCount = delegatorCount.all
  const computeFor = address ? [address] : Object.keys(votingPower)

  return computeFor.map((address) => {
    // not a delegate -> no key or zero
    return !delegatorCount[address]
      ? {
          address,
          delegatorCount: 0,
          percentOfDelegators: 0,
          votingPower: 0,
          percentOfVotingPower: 0,
        }
      : {
          address,
          delegatorCount: delegatorCount[address],
          percentOfDelegators: bps(delegatorCount[address], allDelegatorCount),
          votingPower: votingPower[address],
          percentOfVotingPower: bps(votingPower[address], totalSupply),
        }
  })
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
