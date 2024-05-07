import { Address } from 'viem'
import { Scores } from '../types'

export type DelegateStats = {
  address: string
  delegators: Address[]
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function delegateStats({
  address,
  totalSupply,
  votingPower,
  delegators,
}: {
  address?: Address
  totalSupply: number
  votingPower: Scores
  delegators: Record<string, Address[]>
}): DelegateStats[] {
  const allDelegatorCount = delegators.all.length
  const computeFor = address ? [address] : Object.keys(votingPower)

  return computeFor.map((address) => {
    // not a delegate -> no key or zero
    return !delegators[address] || delegators[address].length == 0
      ? {
          address,
          delegators: [],
          percentOfDelegators: 0,
          votingPower: 0,
          percentOfVotingPower: 0,
        }
      : {
          address,
          delegators: delegators[address],
          percentOfDelegators: bps(
            delegators[address].length,
            allDelegatorCount
          ),
          votingPower: votingPower[address],
          percentOfVotingPower: bps(votingPower[address], totalSupply),
        }
  })
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
