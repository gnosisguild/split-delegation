import { DelegationAction } from 'src/types'
import { Graph } from 'src/weights/graph/types'

export default function top(
  {
    delegatorWeights,
    delegatorScores,
    delegateWeights,
    delegateScores,
  }: {
    delegatorWeights: Graph<bigint>
    delegatorScores: Record<string, number>
    delegateWeights: Graph<bigint>
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
) {
  return Object.keys(delegateWeights)
    .map((address) => ({
      address,
      delegatorCount: Object.keys(delegateWeights[address]).length,
    }))
    .sort((a, b) => (a.delegatorCount > b.delegatorCount ? -1 : 1))
    .slice(offset, offset + limit)
}
