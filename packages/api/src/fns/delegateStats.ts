import { sum } from 'src/fns/bag'
import { Weights } from 'src/types'
import { Address } from 'viem'

export type DelegateStats = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function delegateStats({
  address,
  delegateWeights,
  delegateScores,
}: {
  address?: Address
  delegateWeights: Weights<bigint>
  delegateScores: Record<string, number>
}): DelegateStats[] {
  const totalDelegatorCount = Object.keys(delegateWeights).length
  const totalVotingPower = sum(delegateScores)

  const computeFor = address ? [address] : Object.keys(delegateWeights)

  return computeFor
    .map((address) => ({
      address,
      delegatorCount: Object.keys(delegateWeights[address]).length,
      votingPower: delegateScores[address],
    }))
    .map(({ address, delegatorCount, votingPower }) => ({
      address,
      delegatorCount,
      percentOfDelegators: bps(delegatorCount, totalDelegatorCount),
      votingPower,
      percentOfVotingPower: bps(votingPower, totalVotingPower),
    }))
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return (score * 10000) / total
}
