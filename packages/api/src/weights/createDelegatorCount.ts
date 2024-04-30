import { Weights } from 'src/types'
import inverse from './inverse'

export default function createDelegatorCount({
  delegatorDistribution,
}: {
  delegatorDistribution: Weights<number>
}) {
  const delegateDistribution = inverse(delegatorDistribution)
  return Object.fromEntries(
    Object.entries(delegateDistribution).map(([delegate, distribution]) => [
      delegate,
      Object.values(distribution).length,
    ])
  )
}
