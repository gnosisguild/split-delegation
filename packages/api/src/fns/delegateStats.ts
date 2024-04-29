import { Address } from 'viem'

import { Scores, Weights } from 'src/types'
import { sum } from './bag'

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
  delegatePower,
  scores,
}: {
  address?: Address
  delegateWeights: Weights<bigint>
  delegatePower: Weights<number>
  scores: Scores
}): DelegateStats[] {
  const totalDelegatorCount = new Set(
    Object.values(delegateWeights).flatMap((b) => Object.keys(b))
  ).size

  const totalVotingPower = Object.values(scores).reduce((p, v) => p + v, 0)

  const computeFor = address ? [address] : Object.keys(delegateWeights)

  return computeFor
    .map((address) => ({
      address,
      delegatorCount: Object.keys(delegateWeights[address]).length,
      votingPower: sum(delegatePower[address]) + scores[address],
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
  return Math.round((score * 10000) / total)
}
