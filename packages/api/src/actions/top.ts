import { sum } from 'src/fns/bag'
import { Weights } from 'src/types'

type Result = {
  address: string
  delegatorCount: number
  percentOfDelegators: number
  votingPower: number
  percentOfVotingPower: number
}

export default function top(
  {
    delegateWeights,
    delegateScores,
  }: {
    delegateWeights: Weights<bigint>
    delegateScores: Record<string, number>
  },
  {
    limit,
    offset,
  }: {
    orderBy: 'count' | 'weight'
    limit: number
    offset: number
  }
): Result[] {
  const totalDelegatorCount = Object.keys(delegateWeights).length
  const totalVotingPower = sum(delegateScores)

  return Object.keys(delegateWeights)
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
    .sort((a, b) => (a.delegatorCount > b.delegatorCount ? -1 : 1))
    .slice(offset, offset + limit)
}

function bps(score: number, total: number) {
  if (total == 0) return 0
  return (score * 10000) / total
}
